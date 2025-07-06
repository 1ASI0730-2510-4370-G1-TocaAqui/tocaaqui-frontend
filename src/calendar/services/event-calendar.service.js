// @summary CRUD service for calendar events (Schedule domain)
import httpInstance from '../../shared/services/http.instance.js';

class EventCalendarService {
    endpoint = `${import.meta.env.VITE_CATEGORIES_ENDPOINT_PATH}events`;
    applicantsEndpoint = `${import.meta.env.VITE_CATEGORIES_ENDPOINT_PATH}event-applicants`;

    constructor() {
        // Service initialized
    }

    // Función para normalizar el formato de fecha
    normalizeEventData(event) {
        try {
            // Asegurar que la fecha esté en formato YYYY-MM-DD
            let normalizedDate = event.date;
            if (event.date) {
                const date = new Date(event.date);
                if (!isNaN(date.getTime())) {
                    normalizedDate = date.toISOString().split('T')[0]; // YYYY-MM-DD
                }
            }

            // Normalizar la fecha del soundcheck también
            let normalizedSoundcheckDate = event.soundcheckDate;
            if (event.soundcheckDate) {
                const soundcheckDate = new Date(event.soundcheckDate);
                if (!isNaN(soundcheckDate.getTime())) {
                    normalizedSoundcheckDate = soundcheckDate.toISOString().split('T')[0];
                }
            }

            return {
                ...event,
                date: normalizedDate,
                soundcheckDate: normalizedSoundcheckDate
            };
        } catch (error) {
            console.error('Error normalizing event data:', event, error);
            return event;
        }
    }

    async getAll() { 
        try {
            // 1. Obtener el usuario actual del localStorage
            const userStr = localStorage.getItem('user');
            if (!userStr) {
                console.warn('No hay usuario en localStorage');
                return [];
            }
            const user = JSON.parse(userStr);

            if (!user.id) {
                console.error('El usuario no tiene ID');
                return [];
            }

            // Si es promotor, obtener sus eventos directamente
            if (user.role === 'promotor') {
                const eventsResponse = await httpInstance.get(`${this.endpoint}?promoterId=${user.id}`);
                
                // Para promotores, crear eventos de soundcheck también
                const allCalendarItems = [];
                eventsResponse.data.forEach(event => {
                    // Agregar el evento principal
                    allCalendarItems.push({
                        ...event,
                        eventType: 'event',
                        applicationStatus: 'accepted',
                        contractSigned: true
                    });
                    
                    // Agregar el soundcheck si existe
                    if (event.soundcheckDate && event.soundcheckTime) {
                        allCalendarItems.push({
                            ...event,
                            id: `soundcheck-${event.id}`,
                            name: `🎵 Soundcheck: ${event.name}`,
                            date: event.soundcheckDate,
                            time: event.soundcheckTime,
                            eventType: 'soundcheck',
                            originalEventId: event.id,
                            applicationStatus: 'accepted',
                            contractSigned: true
                        });
                    }
                });
                
                return allCalendarItems;
            }

            // Para músicos, obtener postulaciones con contrato pendiente o firmado
            // 2. Obtener las postulaciones del usuario que están aceptadas o con contrato firmado
            const applicantsResponse = await httpInstance.get(`${this.applicantsEndpoint}/user/${user.id}`);
            
            const userAcceptedApplications = applicantsResponse.data.filter(app => {
                return app.status === 'ContractPending' || app.status === 'Signed';
            });

            if (userAcceptedApplications.length === 0) {
                return [];
            }

            // 3. Obtener los eventos correspondientes
            const eventIds = userAcceptedApplications.map(app => app.eventId);
            
            const eventsResponse = await httpInstance.get(this.endpoint);
            const events = eventsResponse.data.filter(event => eventIds.includes(event.id));

            if (events.length === 0) {
                return [];
            }

            // 4. Enriquecer los eventos con información de la postulación y crear soundchecks
            const allCalendarItems = [];
            
            events.forEach(event => {
                const application = userAcceptedApplications.find(app => app.eventId === event.id);
                
                // Normalizar los datos del evento
                const normalizedEvent = this.normalizeEventData(event);
                
                // Agregar el evento principal
                const enrichedEvent = {
                    ...normalizedEvent,
                    eventType: 'event',
                    applicationStatus: application.status,
                    contractSigned: application.contractSigned || false,
                    riderUploaded: application.riderUploaded || false
                };
                allCalendarItems.push(enrichedEvent);
                
                // Agregar el soundcheck si existe
                if (normalizedEvent.soundcheckDate && normalizedEvent.soundcheckTime) {
                    const soundcheckEvent = {
                        ...normalizedEvent,
                        id: `soundcheck-${normalizedEvent.id}`,
                        name: `🎵 Soundcheck: ${normalizedEvent.name}`,
                        date: normalizedEvent.soundcheckDate,
                        time: normalizedEvent.soundcheckTime,
                        eventType: 'soundcheck',
                        originalEventId: normalizedEvent.id,
                        applicationStatus: application.status,
                        contractSigned: application.contractSigned || false,
                        riderUploaded: application.riderUploaded || false
                    };
                    allCalendarItems.push(soundcheckEvent);
                }
            });
            
            return allCalendarItems;
        } catch (error) {
            console.error('Error al obtener eventos:', error);
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
