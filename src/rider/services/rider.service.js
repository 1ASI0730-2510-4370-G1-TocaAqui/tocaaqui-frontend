// @summary Service for handling rider-related API calls
// @author [Tu nombre]

import http from "../../shared/services/http-common.js";
import { Rider } from '../model/rider.model';

export class RiderService {
    resourceEndpoint = '/riders';
    applicationsEndpoint = '/applications';
    locationsEndpoint = '/locations';
    documentTypesEndpoint = '/document_types';

    async getAll() {
        return http.get(this.resourceEndpoint);
    }

    async getById(id) {
        return http.get(`${this.resourceEndpoint}/${id}`);
    }

    async create(riderResource) {
        try {
            // Crear el rider
            const riderResponse = await http.post(this.resourceEndpoint, riderResource);
            const rider = new Rider(riderResponse.data);

            // Crear la aplicación asociada
            const applicationData = {
                riderId: rider.id,
                status: 'pending',
                stages: [
                    {
                        name: 'document_verification',
                        status: 'pending',
                        completedAt: null
                    },
                    {
                        name: 'background_check',
                        status: 'pending',
                        completedAt: null
                    },
                    {
                        name: 'training',
                        status: 'pending',
                        completedAt: null
                    }
                ],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            await http.post(this.applicationsEndpoint, applicationData);
            return rider;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async update(id, riderResource) {
        return http.put(`${this.resourceEndpoint}/${id}`, riderResource);
    }

    async delete(id) {
        return http.delete(`${this.resourceEndpoint}/${id}`);
    }

    async uploadDocument(riderId, document) {
        try {
            // Simular subida de archivo para la fake API
            const documentData = {
                type: document.type,
                url: `https://example.com/docs/${document.name}`,
                uploadedAt: new Date().toISOString()
            };

            // Obtener rider actual
            const response = await this.getById(riderId);
            const rider = response.data;
            
            // Actualizar documentos
            rider.documents = [...(rider.documents || []), documentData];
            rider.updatedAt = new Date().toISOString();

            // Actualizar rider
            await this.update(riderId, rider);
            return documentData;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async getApplicationStatus(riderId) {
        try {
            const [riderResponse, applicationResponse] = await Promise.all([
                this.getById(riderId),
                http.get(`${this.applicationsEndpoint}?riderId=${riderId}`)
            ]);

            return {
                rider: new Rider(riderResponse.data),
                application: applicationResponse.data[0]
            };
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async getLocations() {
        return http.get(this.locationsEndpoint);
    }

    async getDocumentTypes() {
        return http.get(this.documentTypesEndpoint);
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