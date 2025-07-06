// @summary Service for handling event application-related API calls
// @author [Tu nombre]

import httpInstance from "../../shared/services/http.instance.js";
import { EventApplication, Contract, RiderTechnical, EventApplicant } from '../model/event-application.model';

export class EventApplicationService {
    resourceEndpoint = `${import.meta.env.VITE_CATEGORIES_ENDPOINT_PATH || '/api/v1/'}events`;
    applicantsEndpoint = `${import.meta.env.VITE_CATEGORIES_ENDPOINT_PATH || '/api/v1/'}event-applicants`;
    contractsEndpoint = `${import.meta.env.VITE_CATEGORIES_ENDPOINT_PATH || '/api/v1/'}contracts`;
    documentsEndpoint = `${import.meta.env.VITE_CATEGORIES_ENDPOINT_PATH || '/api/v1/'}documents`;

    constructor() {
        // Logs de debugging temporalmente comentados
        // console.log('Environment variables:', {
        //     VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
        //     VITE_CATEGORIES_ENDPOINT_PATH: import.meta.env.VITE_CATEGORIES_ENDPOINT_PATH
        // });
        // console.log('EventApplicationService endpoints:', {
        //     resourceEndpoint: this.resourceEndpoint,
        //     applicantsEndpoint: this.applicantsEndpoint,
        //     contractsEndpoint: this.contractsEndpoint,
        //     documentsEndpoint: this.documentsEndpoint
        // });
    }

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

            // Solo buscar aplicación si el usuario NO es el creador del evento
            if (response.data.adminId !== user.id) {
                // Obtener la postulación del usuario para este evento específico
                try {
                    const applicantResponse = await httpInstance.get(`${this.applicantsEndpoint}/event/${id}/user/${user.id}`);
                    const applicant = applicantResponse.data;

                // Si existe una postulación, incluir su estado en el evento
                if (applicant) {
                    return new EventApplication({
                        ...response.data,
                        status: applicant.status
                    });
                    }
                } catch (error) {
                    // Si es 404, significa que no hay postulación (normal)
                    if (error.response?.status !== 404) {
                        console.error('Error fetching applicant:', error);
                    }
                }
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
            const response = await httpInstance.get(`${this.applicantsEndpoint}/user/${userId}`);
            return response.data.map(applicant => new EventApplicant(applicant));
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async getEventApplicants(eventId) {
        try {
            const response = await httpInstance.get(`${this.applicantsEndpoint}/event/${eventId}`);
            const applicants = response.data;

            // Obtener información detallada de cada postulante
            const applicantsWithDetails = await Promise.all(
                applicants.map(async (applicant) => {
                    const userResponse = await httpInstance.get(`${import.meta.env.VITE_CATEGORIES_ENDPOINT_PATH}users/${applicant.userId}`);
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
            const response = await httpInstance.get(`${import.meta.env.VITE_CATEGORIES_ENDPOINT_PATH}users/${userId}`);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async applyToEvent(eventId, userId, initialStatus = 'Pending') {
        try {
            const applicant = new EventApplicant({
                eventId,
                userId,
                applicationDate: new Date().toISOString(),
                status: initialStatus,
                isInvited: initialStatus === 'ContractPending' // Marcar como invitado si el estado inicial es 'ContractPending'
            });
            const response = await httpInstance.post(this.applicantsEndpoint, applicant);
            return new EventApplicant(response.data);
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async updateApplicationStatus(applicantId, status) {
        try {
            // Normalizar el estado según el enum del backend
            let normalizedStatus = status;
            if (status === 'confirmed' || status === 'accepted') {
                normalizedStatus = 'ContractPending';
            } else if (status === 'pending') {
                normalizedStatus = 'Pending';
            } else if (status === 'rejected') {
                normalizedStatus = 'Rejected';
            } else if (status === 'signed') {
                normalizedStatus = 'Signed';
            } else if (status === 'contract_pending') {
                normalizedStatus = 'ContractPending';
            }
            
            const response = await httpInstance.patch(`${this.applicantsEndpoint}/${applicantId}/status`, { 
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
                `${this.applicantsEndpoint}/event/${eventId}/user/${user.id}`
            );

            if (!applicantsResponse.data) {
                throw new Error('No se encontró la postulación');
            }

            const applicant = applicantsResponse.data;

            // 3. Actualizar el estado del rider en la postulación
            // TODO: El backend no tiene endpoint para actualizar riderUploaded
            // await httpInstance.patch(
            //     `${this.applicantsEndpoint}/${applicant.id}`,
            //     { riderUploaded: true }
            // );

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
            console.log('Iniciando signContract con:', { eventId, userId, signature });
            
            // 1. Obtener la postulación actual
            console.log('Buscando postulación en:', `${this.applicantsEndpoint}/event/${eventId}/user/${userId}`);
            
            let applicant = null;
            try {
            const applicantsResponse = await httpInstance.get(
                    `${this.applicantsEndpoint}/event/${eventId}/user/${userId}`
            );
                applicant = applicantsResponse.data;
            } catch (error) {
                console.error('Error obteniendo postulación específica:', error);
                
                // Fallback: buscar entre todas las postulaciones del evento
                console.log('Intentando fallback: buscar entre todas las postulaciones del evento');
                const allApplicantsResponse = await httpInstance.get(
                    `${this.applicantsEndpoint}/event/${eventId}`
                );
                
                applicant = allApplicantsResponse.data.find(app => Number(app.userId) === Number(userId));
                console.log('Postulación encontrada via fallback:', applicant);
            }

            if (!applicant) {
                throw new Error('No se encontró la postulación del usuario para este evento');
            }

            console.log('Postulación encontrada:', applicant);

            // 2. Obtener información del evento
            const eventResponse = await httpInstance.get(`${this.resourceEndpoint}/${eventId}`);
            const event = eventResponse.data;
            
            // Obtener información del músico desde localStorage en lugar del backend
            const userStr = localStorage.getItem('user');
            if (!userStr) {
                throw new Error('No hay usuario autenticado');
            }
            const musico = JSON.parse(userStr);

            // 3. Crear el pago para el artista (descomentar y ajustar cuando el backend esté disponible)
            try {
              const paymentService = new (await import('../../payments/services/payment.service.js')).PaymentService();
              const newPayment = await paymentService.createPayment(
                eventId,
                event.payment,
                userId,
                event.adminId
              );
              console.log('Pago creado tras firma de contrato:', newPayment);
            } catch (err) {
              console.error('Error creando el pago tras firma de contrato:', err);
            }

            // 4. Actualizar el estado de la postulación a 'Signed' y marcar contrato como firmado
                await httpInstance.patch(
                    `${this.applicantsEndpoint}/${applicant.id}/status`,
                    {
                        status: 'Signed'
                    }
                );

            // 5. Crear el contrato como un campo más en la postulación (no en el evento)
            // No necesitamos actualizar el evento, solo la postulación ya tiene el estado correcto

            // 6. AHORA rechazar automáticamente a los demás postulantes
            const allApplicantsResponse = await httpInstance.get(
                `${this.applicantsEndpoint}/event/${eventId}`
            );
            
            const otherApplicants = allApplicantsResponse.data.filter(app => app.id !== applicant.id);
            await Promise.all(
                otherApplicants.map(app => 
                    httpInstance.patch(`${this.applicantsEndpoint}/${app.id}/status`, { status: 'Rejected' })
                )
            );

            return { success: true, applicant: applicant };
        } catch (error) {
            console.error('Error en signContract:', error);
            throw this.handleError(error);
        }
    }

    async rejectContract(eventId, userId) {
        try {
            // 1. Obtener la postulación actual
            const applicantsResponse = await httpInstance.get(
                `${this.applicantsEndpoint}/event/${eventId}/user/${userId}`
            );

            if (!applicantsResponse.data) {
                throw new Error('No se encontró la postulación');
            }

            const applicant = applicantsResponse.data;

            // 2. Cambiar el estado de vuelta a 'Rejected'
            await httpInstance.patch(
                `${this.applicantsEndpoint}/${applicant.id}/status`,
                {
                    status: 'Rejected'
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
            const response = await httpInstance.get(`${this.applicantsEndpoint}/event/${eventId}/user/${userId}`);
            return response.data ? new EventApplicant(response.data) : null;
        } catch (error) {
            if (error.response?.status === 404) {
                return null; // No se encontró la postulación, es normal
            }
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