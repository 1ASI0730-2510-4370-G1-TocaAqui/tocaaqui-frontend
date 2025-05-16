// @summary CRUD service for calendar events (Schedule domain)
import httpInstance from '../../shared/services/http.instance.js';

class EventCalendarService {
    endpoint = '/events';

    async getAll() { 
        try {
            // 1. Obtener el usuario actual del localStorage
            const userStr = localStorage.getItem('user');
            if (!userStr) {
                console.error('No hay usuario en localStorage');
                return [];
            }
            const user = JSON.parse(userStr);
            console.log('Usuario actual:', user);

            if (!user.id) {
                console.error('El usuario no tiene ID');
                return [];
            }

            // Si es promotor, obtener sus eventos directamente
            if (user.role === 'promotor') {
                const eventsResponse = await httpInstance.get(`${this.endpoint}?promoterId=${user.id}`);
                console.log('Eventos del promotor:', eventsResponse.data);
                return eventsResponse.data;
            }

            // Para músicos, mantener la lógica actual
            // 2. Obtener las postulaciones del usuario que tienen contrato firmado
            const applicantsResponse = await httpInstance.get('/event_applicants');
            console.log('Todas las postulaciones:', applicantsResponse.data);
            
            const userSignedApplications = applicantsResponse.data.filter(app => {
                console.log('Verificando postulación:', app);
                console.log('Condiciones:', {
                    'userId coincide': app.userId === user.id,
                    'status es accepted': app.status === 'accepted',
                    'contrato firmado': app.contractSigned === true
                });
                return app.userId === user.id && 
                       app.status === 'accepted' && 
                       app.contractSigned === true;
            });
            console.log('Postulaciones aceptadas y firmadas:', userSignedApplications);

            if (userSignedApplications.length === 0) {
                console.log('No se encontraron postulaciones aceptadas y firmadas para el usuario');
                return [];
            }

            // 3. Obtener los eventos correspondientes
            const eventIds = userSignedApplications.map(app => app.eventId);
            console.log('IDs de eventos a buscar:', eventIds);
            
            const eventsResponse = await httpInstance.get(this.endpoint);
            console.log('Todos los eventos:', eventsResponse.data);
            
            const events = eventsResponse.data.filter(event => eventIds.includes(event.id));
            console.log('Eventos filtrados:', events);

            if (events.length === 0) {
                console.log('No se encontraron eventos para las postulaciones del usuario');
                return [];
            }

            // 4. Enriquecer los eventos con información de la postulación
            const enrichedEvents = events.map(event => {
                const application = userSignedApplications.find(app => app.eventId === event.id);
                return {
                    ...event,
                    applicationStatus: application.status,
                    contractSigned: application.contractSigned,
                    riderUploaded: application.riderUploaded
                };
            });
            console.log('Eventos enriquecidos:', enrichedEvents);
            
            return enrichedEvents;
        } catch (error) {
            console.error('Error al obtener eventos:', error);
            if (error.response) {
                console.error('Error de respuesta:', error.response.data);
                console.error('Estado HTTP:', error.response.status);
            }
            return [];
        }
    }

    async getConfirmed() { 
        try {
            const events = await this.getAll();
            return events.filter(event => event.contractSigned);
        } catch (error) {
            console.error('Error al obtener eventos confirmados:', error);
            return [];
        }
    }

    async getByDate(date) {
        try {
            const events = await this.getAll();
            return events.filter(event => event.date === date);
        } catch (error) {
            console.error('Error al obtener eventos por fecha:', error);
            return [];
        }
    }
}

export default new EventCalendarService();
