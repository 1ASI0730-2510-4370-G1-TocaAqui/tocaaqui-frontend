// @summary CRUD service for calendar events (Schedule domain)
import httpInstance from '../../shared/services/http.instance.js';

class EventCalendarService {
    endpoint = '/events';

    async getAll() { 
        try {
            console.log('🗓️ EventCalendarService: Iniciando obtención de eventos...');
            
            // 1. Obtener el usuario actual del localStorage
            const userStr = localStorage.getItem('user');
            if (!userStr) {
                console.warn('⚠️ No hay usuario en localStorage');
                return [];
            }
            const user = JSON.parse(userStr);
            console.log('👤 Usuario actual:', { id: user.id, role: user.role, name: user.name });

            if (!user.id) {
                console.error('❌ El usuario no tiene ID');
                return [];
            }

            // Si es promotor, obtener sus eventos directamente
            if (user.role === 'promotor') {
                console.log('🎭 Usuario es promotor, obteniendo eventos creados...');
                const eventsResponse = await httpInstance.get(`${this.endpoint}?promoterId=${user.id}`);
                console.log('📅 Eventos del promotor:', eventsResponse.data);
                
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

            console.log('🎵 Usuario es músico, obteniendo postulaciones aceptadas...');
            
            // Para músicos, obtener postulaciones con contrato pendiente o firmado
            // 2. Obtener las postulaciones del usuario que están aceptadas o con contrato firmado
            const applicantsResponse = await httpInstance.get('/event_applicants');
            console.log('📋 Total de postulaciones en el sistema:', applicantsResponse.data.length);
            
            const userAcceptedApplications = applicantsResponse.data.filter(app => {
                const isUserApp = app.userId === user.id;
                const isAcceptedOrSigned = app.status === 'contract_pending' || app.status === 'signed';
                console.log(`📝 Postulación ${app.id}: userId=${app.userId}, status=${app.status}, match=${isUserApp && isAcceptedOrSigned}`);
                return isUserApp && isAcceptedOrSigned;
            });
            console.log('✅ Postulaciones aceptadas/firmadas del usuario:', userAcceptedApplications.length);

            if (userAcceptedApplications.length === 0) {
                console.log('ℹ️ No se encontraron postulaciones aceptadas para el usuario');
                return [];
            }

            // 3. Obtener los eventos correspondientes
            const eventIds = userAcceptedApplications.map(app => app.eventId);
            console.log('🔍 IDs de eventos a buscar:', eventIds);
            
            const eventsResponse = await httpInstance.get(this.endpoint);
            console.log('📊 Total de eventos en el sistema:', eventsResponse.data.length);
            
            const events = eventsResponse.data.filter(event => eventIds.includes(event.id));
            console.log('🎯 Eventos filtrados para el usuario:', events.length);

            if (events.length === 0) {
                console.log('⚠️ No se encontraron eventos para las postulaciones del usuario');
                return [];
            }

            // 4. Enriquecer los eventos con información de la postulación y crear soundchecks
            const allCalendarItems = [];
            
            events.forEach(event => {
                const application = userAcceptedApplications.find(app => app.eventId === event.id);
                
                // Agregar el evento principal
                const enrichedEvent = {
                    ...event,
                    eventType: 'event',
                    applicationStatus: application.status,
                    contractSigned: application.contractSigned || false,
                    riderUploaded: application.riderUploaded || false
                };
                console.log(`🎪 Evento enriquecido: ${event.name} - Contrato: ${enrichedEvent.contractSigned}`);
                allCalendarItems.push(enrichedEvent);
                
                // Agregar el soundcheck si existe
                if (event.soundcheckDate && event.soundcheckTime) {
                    const soundcheckEvent = {
                        ...event,
                        id: `soundcheck-${event.id}`,
                        name: `🎵 Soundcheck: ${event.name}`,
                        date: event.soundcheckDate,
                        time: event.soundcheckTime,
                        eventType: 'soundcheck',
                        originalEventId: event.id,
                        applicationStatus: application.status,
                        contractSigned: application.contractSigned || false,
                        riderUploaded: application.riderUploaded || false
                    };
                    console.log(`🎵 Soundcheck creado: ${soundcheckEvent.name} - ${soundcheckEvent.date} ${soundcheckEvent.time}`);
                    allCalendarItems.push(soundcheckEvent);
                }
            });
            
            console.log('🎉 Eventos finales para el calendario (incluyendo soundchecks):', allCalendarItems.length);
            return allCalendarItems;
        } catch (error) {
            console.error('💥 Error al obtener eventos:', error);
            if (error.response) {
                console.error('📡 Error de respuesta del servidor:', {
                    status: error.response.status,
                    statusText: error.response.statusText,
                    data: error.response.data
                });
            } else if (error.request) {
                console.error('🌐 Error de red - no se recibió respuesta:', error.request);
            } else {
                console.error('⚙️ Error de configuración:', error.message);
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
