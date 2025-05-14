import httpInstance from "../../shared/services/http.instance.js";
import { PromoterEvent } from "../model/promoter-event.model.js";

export class PromoterEventService {
    resourceEndpoint = '/events';
    applicantsEndpoint = '/event_applicants';

    async getAll() {
        try {
            const response = await httpInstance.get(this.resourceEndpoint);
            return response.data.map(event => new PromoterEvent(event));
        } catch (error) {
            console.error('Error fetching events:', error);
            throw new Error(error.response?.data?.message || 'Error al obtener eventos');
        }
    }

    async getById(id) {
        try {
            const response = await httpInstance.get(`${this.resourceEndpoint}/${id}`);
            return new PromoterEvent(response.data);
        } catch (error) {
            console.error('Error fetching event:', error);
            throw new Error(error.response?.data?.message || 'Error al obtener el evento');
        }
    }

    async filterEvents(filters = {}) {
        try {
            let queryParams = [];
            
            if (filters.name) {
                queryParams.push(`name_like=${encodeURIComponent(filters.name)}`);
            }
            
            if (filters.location) {
                queryParams.push(`location_like=${encodeURIComponent(filters.location)}`);
            }
            
            if (filters.status) {
                queryParams.push(`status=${encodeURIComponent(filters.status)}`);
            }
            
            if (filters.dateFrom) {
                // Para json-server, esto es una aproximación
                queryParams.push(`date_gte=${encodeURIComponent(filters.dateFrom)}`);
            }
            
            if (filters.dateTo) {
                queryParams.push(`date_lte=${encodeURIComponent(filters.dateTo)}`);
            }
            
            const url = queryParams.length > 0 
                ? `${this.resourceEndpoint}?${queryParams.join('&')}` 
                : this.resourceEndpoint;
            
            const response = await httpInstance.get(url);
            return response.data.map(event => new PromoterEvent(event));
        } catch (error) {
            console.error('Error filtering events:', error);
            throw new Error(error.response?.data?.message || 'Error al filtrar eventos');
        }
    }
}