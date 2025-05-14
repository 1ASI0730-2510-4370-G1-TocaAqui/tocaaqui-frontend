// @summary Service for handling event application-related API calls
// @author [Tu nombre]

import httpInstance from "../../shared/services/http.instance.js";
import { EventApplication, Contract, RiderTechnical } from '../model/event-application.model';

export class EventApplicationService {
    resourceEndpoint = '/events';
    applicationsEndpoint = '/applications';
    contractsEndpoint = '/contracts';
    documentsEndpoint = '/documents';

    async getAll() {
        try {
            const response = await httpInstance.get(this.resourceEndpoint);
            return response.data.map(app => new EventApplication(app));
        } catch (error) {
            console.error('Error fetching applications:', error);
            throw error;
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

    async uploadRider(applicationId, riderFile) {
        try {
            const formData = new FormData();
            formData.append('rider', riderFile);
            
            const response = await httpInstance.post(
                `/applications/${applicationId}/rider`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error uploading rider:', error);
            throw error;
        }
    }

    async signContract(applicationId, signature) {
        try {
            // Primero firmamos el contrato
            const signResponse = await httpInstance.post(`${this.applicationsEndpoint}/${applicationId}/sign`, { signature });
            
            // Luego actualizamos el estado del evento a accepted
            const eventResponse = await this.getById(applicationId);
            const updatedEvent = await this.update(applicationId, {
                ...eventResponse,
                status: 'accepted'
            });

            return {
                contract: signResponse.data,
                event: updatedEvent
            };
        } catch (error) {
            console.error('Error signing contract:', error);
            throw error;
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
        if (error.response) {
            return new Error(error.response.data.message || 'Error en el servidor');
        }
        if (error.request) {
            return new Error('No se pudo conectar con el servidor');
        }
        return new Error('Error al procesar la solicitud');
    }
} 