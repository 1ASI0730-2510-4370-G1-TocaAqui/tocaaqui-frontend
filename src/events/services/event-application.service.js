// @summary Service for handling event application-related API calls
// @author [Tu nombre]

import httpInstance from "../../shared/services/http.instance.js";
import { EventApplication, Contract, RiderTechnical, EventApplicant } from '../model/event-application.model';

export class EventApplicationService {
    resourceEndpoint = '/events';
    applicantsEndpoint = '/event_applicants';
    contractsEndpoint = '/contracts';
    documentsEndpoint = '/documents';

    async getAll() {
        try {
            const response = await httpInstance.get(this.resourceEndpoint);
            return response.data.map(event => new EventApplication(event));
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async getById(id) {
        try {
            const response = await httpInstance.get(`${this.resourceEndpoint}/${id}`);
            if (!response.data) {
                throw new Error('No se encontró el evento');
            }

            // Obtener el usuario actual
            const userStr = localStorage.getItem('user');
            if (!userStr) {
                return new EventApplication(response.data);
            }
            const user = JSON.parse(userStr);

            // Obtener la postulación del usuario para este evento
            const applicantResponse = await httpInstance.get(`${this.applicantsEndpoint}?eventId=${id}&userId=${user.id}`);
            const applicant = applicantResponse.data[0];

            // Si existe una postulación, incluir su estado en el evento
            if (applicant) {
                return new EventApplication({
                    ...response.data,
                    status: applicant.status
                });
            }

            return new EventApplication(response.data);
        } catch (error) {
            console.error('Error fetching application:', error);
            throw this.handleError(error);
        }
    }

    async uploadImageToImgBB(file) {
        try {
            // Verificar que tenemos la API key (usar VITE_ para variables de entorno en Vue)
            const apiKey = import.meta.env.VITE_IMGBB_API_KEY;
            if (!apiKey) {
                console.warn('API key de ImgBB no configurada, usando imagen por defecto');
                // Retornar una imagen por defecto si no hay API key
                return 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14';
            }

            // Convertir el archivo a base64
            const base64Image = await this.fileToBase64(file);
            const base64Data = base64Image.split(',')[1]; // Remover el prefijo "data:image/..."

            // Crear el cuerpo de la solicitud con URLSearchParams
            const body = new URLSearchParams();
            body.append('key', apiKey);
            body.append('image', base64Data);

            // Realizar la solicitud a ImgBB
            const response = await fetch('https://api.imgbb.com/1/upload', {
                method: 'POST',
                body: body
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Respuesta de ImgBB:', errorText);
                throw new Error(`Error al subir la imagen: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            console.log('Respuesta de ImgBB:', data); // Para debug

            if (data.success) {
                return data.data.display_url;
            } else {
                console.error('Error de ImgBB:', data);
                throw new Error(data.error?.message || 'Error al subir la imagen');
            }
        } catch (error) {
            console.error('Error detallado al subir la imagen:', error);
            // En caso de error, usar imagen por defecto en lugar de fallar
            console.warn('Usando imagen por defecto debido a error en subida');
            return 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14';
        }
    }

    async fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }

    async create(eventResource) {
        try {
            console.log('Creando evento:', eventResource);
            
            // Si hay un archivo de imagen, intentar subirlo
            if (eventResource.imageFile) {
                try {
                    console.log('Subiendo imagen...');
                    const imageUrl = await this.uploadImageToImgBB(eventResource.imageFile);
                    eventResource.imageUrl = imageUrl;
                    console.log('Imagen subida exitosamente:', imageUrl);
                } catch (error) {
                    console.warn('Error al subir la imagen, usando imagen por defecto:', error);
                    eventResource.imageUrl = 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14';
                }
            } else {
                // Si no hay imagen, usar una por defecto
                eventResource.imageUrl = eventResource.imageUrl || 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14';
            }

            // Eliminar la propiedad imageFile antes de enviar al servidor
            const { imageFile, ...eventData } = eventResource;
            
            console.log('Enviando datos del evento al servidor:', eventData);
            const response = await httpInstance.post(this.resourceEndpoint, eventData);
            console.log('Evento creado exitosamente:', response.data);
            
            return new EventApplication(response.data);
        } catch (error) {
            console.error('Error al crear evento:', error);
            throw this.handleError(error);
        }
    }

    async update(id, eventResource) {
        try {
            const response = await httpInstance.put(`${this.resourceEndpoint}/${id}`, eventResource);
            return new EventApplication(response.data);
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async delete(id) {
        try {
            return await httpInstance.delete(`${this.resourceEndpoint}/${id}`);
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async getUserApplications(userId) {
        try {
            const response = await httpInstance.get(`${this.applicantsEndpoint}?userId=${userId}`);
            return response.data.map(applicant => new EventApplicant(applicant));
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async getEventApplicants(eventId) {
        try {
            const response = await httpInstance.get(`${this.applicantsEndpoint}?eventId=${eventId}`);
            const applicants = response.data;

            // Obtener información detallada de cada postulante
            const applicantsWithDetails = await Promise.all(
                applicants.map(async (applicant) => {
                    const userResponse = await httpInstance.get(`/users/${applicant.userId}`);
                    return {
                        ...applicant,
                        name: userResponse.data.name,
                        imageUrl: userResponse.data.imageUrl || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y',
                        genre: userResponse.data.genre,
                        email: userResponse.data.email,
                        phone: userResponse.data.phone,
                        description: userResponse.data.description
                    };
                })
            );

            return applicantsWithDetails;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async getUserById(userId) {
        try {
            const response = await httpInstance.get(`/users/${userId}`);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async applyToEvent(eventId, userId, initialStatus = 'pending') {
        try {
            const applicant = new EventApplicant({
                eventId,
                userId,
                applicationDate: new Date().toISOString(),
                status: initialStatus,
                isInvited: initialStatus === 'contract_pending' // Marcar como invitado si el estado inicial es 'contract_pending'
            });
            const response = await httpInstance.post(this.applicantsEndpoint, applicant);
            return new EventApplicant(response.data);
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async updateApplicationStatus(applicantId, status) {
        try {
            // Normalizar el estado si es 'confirmed' a 'contract_pending'
            let normalizedStatus = status.toLowerCase();
            if (normalizedStatus === 'confirmed' || normalizedStatus === 'accepted') {
                normalizedStatus = 'contract_pending';
            }
            
            const response = await httpInstance.patch(`${this.applicantsEndpoint}/${applicantId}`, { 
                status: normalizedStatus 
            });
            return new EventApplicant(response.data);
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async uploadRider(eventId, file) {
        try {
            // 1. Obtener el usuario actual
            const userStr = localStorage.getItem('user');
            if (!userStr) {
                throw new Error('No hay usuario autenticado');
            }
            const user = JSON.parse(userStr);

            // 2. Obtener la postulación actual
            const applicantsResponse = await httpInstance.get(
                `${this.applicantsEndpoint}?eventId=${eventId}&userId=${user.id}`
            );

            if (!applicantsResponse.data || applicantsResponse.data.length === 0) {
                throw new Error('No se encontró la postulación');
            }

            const applicant = applicantsResponse.data[0];

            // 3. Actualizar el estado del rider en la postulación
            await httpInstance.patch(
                `${this.applicantsEndpoint}/${applicant.id}`,
                { riderUploaded: true }
            );

            // 4. Guardar la información del rider en el evento
            const riderInfo = {
                fileName: file.name,
                uploadDate: new Date().toISOString(),
                uploadedBy: user.id,
                fileType: file.type
            };

            const eventResponse = await httpInstance.patch(
                `${this.resourceEndpoint}/${eventId}`,
                { 
                    rider: riderInfo,
                    status: 'accepted'
                }
            );

            return eventResponse.data;
        } catch (error) {
            console.error('Error al subir el rider:', error);
            throw this.handleError(error);
        }
    }

    async signContract(eventId, userId, signature) {
        try {
            // 1. Obtener la postulación actual
            const applicantsResponse = await httpInstance.get(
                `${this.applicantsEndpoint}?eventId=${eventId}&userId=${userId}`
            );

            if (!applicantsResponse.data || applicantsResponse.data.length === 0) {
                throw new Error('No se encontró la postulación');
            }

            const applicant = applicantsResponse.data[0];

            // 2. Obtener información del evento y del músico
            const eventResponse = await httpInstance.get(`${this.resourceEndpoint}/${eventId}`);
            const event = eventResponse.data;
            
            const musicoResponse = await httpInstance.get(`/users/${userId}`);
            const musico = musicoResponse.data;

            // 3. Crear el pago para el artista
            const now = new Date().toISOString();
            const paymentData = {
                amount: Number(event.payment),
                eventId: eventId,
                musicoId: userId,
                promotorId: event.adminId,
                status: "PENDING",
                paymentMethod: "bank_transfer",
                bankInfo: {
                    accountNumber: "****1234",
                    bankName: "Banco de Crédito",
                    accountType: "savings"
                },
                description: `Pago por presentación de ${musico.name} en ${event.name}`,
                createdAt: now,
                updatedAt: now,
                statusHistory: [
                    {
                        status: "PENDING",
                        timestamp: now,
                        comment: "Pago creado después de firma de contrato"
                    }
                ]
            };

            console.log('Creando pago después de firma de contrato:', paymentData);
            await httpInstance.post('/payments', paymentData);

            // 4. Actualizar el estado de la postulación a 'signed' y marcar contrato como firmado
            await httpInstance.patch(
                `${this.applicantsEndpoint}/${applicant.id}`,
                {
                    status: 'signed',
                    contractSigned: true
                }
            );

            // 5. Crear el contrato como un campo más en el evento
            const contract = {
                userId: userId,
                signature: signature,
                signedDate: new Date().toISOString(),
                status: 'signed'
            };

            // 6. Actualizar el evento con el contrato
            const eventUpdateResponse = await httpInstance.patch(
                `${this.resourceEndpoint}/${eventId}`,
                { 
                    contract: contract,
                    status: 'signed'
                }
            );

            // 7. AHORA rechazar automáticamente a los demás postulantes
            const allApplicantsResponse = await httpInstance.get(
                `${this.applicantsEndpoint}?eventId=${eventId}`
            );
            
            const otherApplicants = allApplicantsResponse.data.filter(app => app.id !== applicant.id);
            await Promise.all(
                otherApplicants.map(app => 
                    httpInstance.patch(`${this.applicantsEndpoint}/${app.id}`, { status: 'rejected' })
                )
            );

            return eventUpdateResponse.data;
        } catch (error) {
            console.error('Error en signContract:', error);
            throw this.handleError(error);
        }
    }

    async rejectContract(eventId, userId) {
        try {
            // 1. Obtener la postulación actual
            const applicantsResponse = await httpInstance.get(
                `${this.applicantsEndpoint}?eventId=${eventId}&userId=${userId}`
            );

            if (!applicantsResponse.data || applicantsResponse.data.length === 0) {
                throw new Error('No se encontró la postulación');
            }

            const applicant = applicantsResponse.data[0];

            // 2. Cambiar el estado de vuelta a 'rejected'
            await httpInstance.patch(
                `${this.applicantsEndpoint}/${applicant.id}`,
                {
                    status: 'rejected',
                    contractSigned: false
                }
            );

            return { success: true };
        } catch (error) {
            console.error('Error en rejectContract:', error);
            throw this.handleError(error);
        }
    }

    async getEventApplicant(eventId, userId) {
        try {
            const response = await httpInstance.get(`${this.applicantsEndpoint}?eventId=${eventId}&userId=${userId}`);
            const applicants = response.data;
            return applicants.length > 0 ? new EventApplicant(applicants[0]) : null;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async getApplicationStatus(applicationId) {
        try {
            const [applicationResponse, contractResponse] = await Promise.all([
                this.getById(applicationId),
                httpInstance.get(`${this.contractsEndpoint}/${applicationId}`)
            ]);

            return {
                application: applicationResponse,
                contract: new Contract(contractResponse.data)
            };
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async getEventsByPromoter(promoterId) {
        try {
            const response = await httpInstance.get(`${this.resourceEndpoint}?promoterId=${promoterId}`);
            return response.data.map(event => new EventApplication(event));
        } catch (error) {
            throw this.handleError(error);
        }
    }

    handleError(error) {
        console.error('Service error:', error);
        return new Error(error.response?.data?.message || 'Error en el servicio');
    }
}