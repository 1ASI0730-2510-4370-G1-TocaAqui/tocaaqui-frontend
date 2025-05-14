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
            const response = await httpInstance.patch(`${this.applicantsEndpoint}/${applicantId}`, { status });
            return new EventApplicant(response.data);
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async uploadRider(eventId, userId, file) {
        try {
            const formData = new FormData();
            formData.append('rider', file);
            formData.append('userId', userId);
            
            const response = await httpInstance.post(
                `${this.resourceEndpoint}/${eventId}/riders`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            // Actualizamos el estado del rider en la postulación
            const applicant = await this.getEventApplicant(eventId, userId);
            if (applicant) {
                await this.updateApplicationStatus(applicant.id, { riderUploaded: true });
            }
            
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async signContract(eventId, userId, signature) {
        try {
            const contract = new Contract({
                eventApplicationId: eventId,
                userId: userId,
                signature: signature,
                signedDate: new Date().toISOString()
            });
            const response = await httpInstance.post(`${this.resourceEndpoint}/${eventId}/contracts`, contract);
            
            // Actualizamos el estado de la postulación
            const applicant = await this.getEventApplicant(eventId, userId);
            if (applicant) {
                await this.updateApplicationStatus(applicant.id, { 
                    status: 'accepted',
                    contractSigned: true 
                });
            }
            
            return response.data;
        } catch (error) {
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