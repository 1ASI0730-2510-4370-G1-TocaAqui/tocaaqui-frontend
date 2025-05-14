import httpInstance from "../../shared/services/http.instance.js";
import { Ticket, TicketStats } from "../model/ticket.model.js";

export class TicketService {
    resourceEndpoint = '/tickets';
    eventsEndpoint = '/events';
    statsEndpoint = '/ticket_stats';

    async getAll(promoterId) {
        try {
            const response = await httpInstance.get(`${this.resourceEndpoint}?promoterId=${promoterId}`);
            return response.data.map(ticket => new Ticket(ticket));
        } catch (error) {
            console.error('Error fetching tickets:', error);
            throw new Error(error.response?.data?.message || 'Error al obtener entradas');
        }
    }

    async getById(id) {
        try {
            const response = await httpInstance.get(`${this.resourceEndpoint}/${id}`);
            return new Ticket(response.data);
        } catch (error) {
            console.error('Error fetching ticket:', error);
            throw new Error(error.response?.data?.message || 'Error al obtener la entrada');
        }
    }

    async getByEventId(eventId) {
        try {
            const response = await httpInstance.get(`${this.resourceEndpoint}?eventId=${eventId}`);
            return response.data.map(ticket => new Ticket(ticket));
        } catch (error) {
            console.error('Error fetching tickets by event:', error);
            throw new Error(error.response?.data?.message || 'Error al obtener entradas del evento');
        }
    }

    async create(ticketData) {
        try {
            // Si no se proporciona un código, generamos uno
            if (!ticketData.code) {
                ticketData.code = Ticket.generateCode(ticketData.eventName, ticketData.type);
            }
            
            const response = await httpInstance.post(this.resourceEndpoint, ticketData);
            return new Ticket(response.data);
        } catch (error) {
            console.error('Error creating ticket:', error);
            throw new Error(error.response?.data?.message || 'Error al crear la entrada');
        }
    }

    async update(id, ticketData) {
        try {
            ticketData.updatedAt = new Date().toISOString();
            const response = await httpInstance.put(`${this.resourceEndpoint}/${id}`, ticketData);
            return new Ticket(response.data);
        } catch (error) {
            console.error('Error updating ticket:', error);
            throw new Error(error.response?.data?.message || 'Error al actualizar la entrada');
        }
    }

    async delete(id) {
        try {
            await httpInstance.delete(`${this.resourceEndpoint}/${id}`);
            return true;
        } catch (error) {
            console.error('Error deleting ticket:', error);
            throw new Error(error.response?.data?.message || 'Error al eliminar la entrada');
        }
    }

    async getEvents() {
        try {
            const response = await httpInstance.get(this.eventsEndpoint);
            return response.data;
        } catch (error) {
            console.error('Error fetching events:', error);
            throw new Error(error.response?.data?.message || 'Error al obtener eventos');
        }
    }

    async getEventById(eventId) {
        try {
            const response = await httpInstance.get(`${this.eventsEndpoint}/${eventId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching event:', error);
            throw new Error(error.response?.data?.message || 'Error al obtener el evento');
        }
    }

    async getTicketStats(ticketId) {
        try {
            const response = await httpInstance.get(`${this.statsEndpoint}?ticketId=${ticketId}`);
            return response.data.length > 0 ? response.data[0] : new TicketStats({ ticketId });
        } catch (error) {
            console.error('Error fetching ticket stats:', error);
            throw new Error(error.response?.data?.message || 'Error al obtener estadísticas de la entrada');
        }
    }

    async updateTicketStats(ticketId, statsData) {
        try {
            const existingStats = await this.getTicketStats(ticketId);
            
            if (existingStats.ticketId) {
                // Actualizar estadísticas existentes
                const response = await httpInstance.put(`${this.statsEndpoint}/${existingStats.id}`, {
                    ...existingStats,
                    ...statsData
                });
                return response.data;
            } else {
                // Crear nuevas estadísticas
                const response = await httpInstance.post(this.statsEndpoint, {
                    ticketId,
                    ...statsData
                });
                return response.data;
            }
        } catch (error) {
            console.error('Error updating ticket stats:', error);
            throw new Error(error.response?.data?.message || 'Error al actualizar estadísticas de la entrada');
        }
    }

    async shareTicket(ticketId, platform) {
        try {
            const ticket = await this.getById(ticketId);
            
            // Actualizar plataformas compartidas
            if (!ticket.platforms.includes(platform)) {
                ticket.platforms.push(platform);
                await this.update(ticketId, ticket);
            }
            
            // Incrementar estadísticas de clics
            const stats = await this.getTicketStats(ticketId);
            stats.clicks = (stats.clicks || 0) + 1;
            await this.updateTicketStats(ticketId, stats);
            
            return true;
        } catch (error) {
            console.error('Error sharing ticket:', error);
            throw new Error(error.response?.data?.message || 'Error al compartir la entrada');
        }
    }
}