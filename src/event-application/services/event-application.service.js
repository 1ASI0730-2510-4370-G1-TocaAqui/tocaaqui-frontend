// @summary Service for handling event application-related API calls
// @author [Tu nombre]

import http from "../../shared/services/http-common.js";
import { EventApplication, Contract, RiderTechnical } from '../model/event-application.model';

export class EventApplicationService {
    resourceEndpoint = '/events';
    applicationsEndpoint = '/applications';
    contractsEndpoint = '/contracts';
    documentsEndpoint = '/documents';

    async getAll() {
        try {
            const response = await http.get(this.resourceEndpoint);
            return response.data.map(event => new EventApplication(event));
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async getById(id) {
        try {
            const response = await http.get(`${this.applicationsEndpoint}/${id}`);
            return new EventApplication(response.data);
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async create(eventResource) {
        try {
            const response = await http.post(this.resourceEndpoint, eventResource);
            return new EventApplication(response.data);
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async update(id, eventResource) {
        try {
            const response = await http.put(`${this.resourceEndpoint}/${id}`, eventResource);
            return new EventApplication(response.data);
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async delete(id) {
        try {
            return await http.delete(`${this.resourceEndpoint}/${id}`);
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async uploadRider(applicationId, riderFile) {
        try {
            const formData = new FormData();
            formData.append('rider', riderFile);

            const response = await http.post(
                `${this.applicationsEndpoint}/${applicationId}/rider`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );
            return new RiderTechnical(response.data);
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async signContract(applicationId, signature) {
        try {
            const response = await http.post(`${this.contractsEndpoint}/${applicationId}/sign`, {
                signature
            });
            return new Contract(response.data);
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async getApplicationStatus(applicationId) {
        try {
            const [applicationResponse, contractResponse] = await Promise.all([
                this.getById(applicationId),
                http.get(`${this.contractsEndpoint}/${applicationId}`)
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