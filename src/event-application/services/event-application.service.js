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
            // Normalizar el estado si es 'confirmed' a 'accepted'
            if (response.data.status?.toLowerCase() === 'confirmed') {
                response.data.status = 'accepted';
            }
            return new EventApplication(response.data);
        } catch (error) {
            console.error('Error fetching application:', error);
            throw this.handleError(error);
        }
    }

    async create(eventResource) {
        try {
            const response = await httpInstance.post(this.resourceEndpoint, eventResource);
            return new EventApplication(response.data);
        } catch (error) {
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
            return response.data.map(applicant => new EventApplicant(applicant));
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async applyToEvent(eventId, userId) {
        try {
            const applicant = new EventApplicant({
                eventId,
                userId,
                applicationDate: new Date().toISOString()
            });
            const response = await httpInstance.post(this.applicantsEndpoint, applicant);
            return new EventApplicant(response.data);
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async updateApplicationStatus(applicantId, status) {
        try {
            // Normalizar el estado si es 'confirmed' a 'accepted'
            const normalizedStatus = status.toLowerCase() === 'confirmed' ? 'accepted' : status.toLowerCase();
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

            // 2. Actualizar el estado de la postulación a aceptado
            await httpInstance.patch(
                `${this.applicantsEndpoint}/${applicant.id}`,
                {
                    status: 'accepted',
                    contractSigned: true
                }
            );

            // 3. Crear el contrato como un campo más en el evento
            const contract = {
                userId: userId,
                signature: signature,
                signedDate: new Date().toISOString(),
                status: 'signed'
            };

            // 4. Actualizar el evento con el contrato
            const eventResponse = await httpInstance.patch(
                `${this.resourceEndpoint}/${eventId}`,
                { 
                    contract: contract,
                    status: 'accepted'
                }
            );

            return eventResponse.data;
        } catch (error) {
            console.error('Error en signContract:', error);
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

    handleError(error) {
        console.error('Service error:', error);
        return new Error(error.response?.data?.message || 'Error en el servicio');
    }
} 