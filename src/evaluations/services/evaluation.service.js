import httpInstance from '../../shared/services/http.instance';

export class EvaluationService {
    constructor() {
        this.resourceEndpoint = `${import.meta.env.VITE_CATEGORIES_ENDPOINT_PATH}evaluations`;
    }

    async getAllEvents() {
        try {
            // Obtener el usuario actual
            const userStr = localStorage.getItem('user');
            if (!userStr) {
                throw new Error('No hay usuario autenticado');
            }
            const user = JSON.parse(userStr);

            if (user.role === 'musico') {
                return await this.getCompletedEventsForMusician(user.id);
            } else if (user.role === 'promotor') {
                return await this.getCompletedEventsForPromoter(user.id);
            }

            return [];
        } catch (error) {
            console.error('Error fetching events:', error);
            throw error;
        }
    }

    async getCompletedEventsForMusician(musicianId) {
        try {
            // 1. Obtener todas las postulaciones del músico con contrato firmado
            const applicantsResponse = await httpInstance.get('/event_applicants');
            const musicianApplications = applicantsResponse.data.filter(app => 
                Number(app.userId) === Number(musicianId) && app.status === 'signed'
            );

            if (musicianApplications.length === 0) {
                return [];
            }

            // 2. Obtener todos los pagos completados
            const paymentsResponse = await httpInstance.get('/payments');
            const completedPayments = paymentsResponse.data.filter(payment => 
                payment.status === 'COMPLETED' && Number(payment.musicoId) === Number(musicianId)
            );

            // 3. Obtener eventos donde el músico tocó Y el pago se completó
            const completedEventIds = completedPayments.map(payment => Number(payment.eventId));
            const eventsResponse = await httpInstance.get('/events');
            const completedEvents = eventsResponse.data.filter(event => 
                completedEventIds.includes(Number(event.id))
            );

            // 4. Verificar que no hayan sido evaluados ya
            const evaluationsResponse = await httpInstance.get('/evaluations');
            const existingEvaluations = evaluationsResponse.data.filter(evaluation => 
                Number(evaluation.userId) === Number(musicianId) && evaluation.type === 'venue'
            );
            const evaluatedEventIds = existingEvaluations.map(evaluation => Number(evaluation.eventId));

            return completedEvents.filter(event => !evaluatedEventIds.includes(Number(event.id)));
        } catch (error) {
            console.error('Error fetching completed events for musician:', error);
            throw error;
        }
    }

    async getCompletedEventsForPromoter(promoterId) {
        try {
            // 1. Obtener todos los eventos del promotor
            const eventsResponse = await httpInstance.get('/events');
            const promoterEvents = eventsResponse.data.filter(event => 
                Number(event.adminId) === Number(promoterId)
            );

            if (promoterEvents.length === 0) {
                return [];
            }

            // 2. Obtener todos los pagos completados para eventos del promotor
            const paymentsResponse = await httpInstance.get('/payments');
            const completedPayments = paymentsResponse.data.filter(payment => 
                payment.status === 'COMPLETED' && Number(payment.promotorId) === Number(promoterId)
            );

            // 3. Filtrar eventos que tienen pagos completados
            const completedEventIds = completedPayments.map(payment => Number(payment.eventId));
            const completedEvents = promoterEvents.filter(event => 
                completedEventIds.includes(Number(event.id))
            );

            // 4. Obtener evaluaciones existentes de artistas para filtrar duplicados
            const existingEvaluations = await this.getEvaluatedArtists();
            const existingEvaluationKeys = existingEvaluations
                .filter(evaluation => Number(evaluation.promoterId) === Number(promoterId))
                .map(evaluation => `${evaluation.eventId}-${evaluation.musicianId}`);

            // 5. Enriquecer con información de los artistas que tocaron (excluyendo ya evaluados)
            const eventsWithArtists = await Promise.all(completedEvents.map(async (event) => {
                try {
                    // Obtener postulaciones aceptadas para este evento
                    const applicantsResponse = await httpInstance.get('/event_applicants');
                    const acceptedApplicants = applicantsResponse.data.filter(app => 
                        Number(app.eventId) === Number(event.id) && app.status === 'signed'
                    );

                    // Obtener información de los artistas y filtrar los ya evaluados
                    const artists = await Promise.all(acceptedApplicants.map(async (applicant) => {
                        const evaluationKey = `${event.id}-${applicant.userId}`;
                        
                        // Solo incluir si no ha sido evaluado todavía
                        if (!existingEvaluationKeys.includes(evaluationKey)) {
                            const userResponse = await httpInstance.get(`/api/v1/users/${applicant.userId}`);
                            return {
                                userId: applicant.userId,
                                name: userResponse.data.name,
                                imageUrl: userResponse.data.imageUrl
                            };
                        }
                        return null;
                    }));

                    // Filtrar artistas nulos (ya evaluados)
                    const filteredArtists = artists.filter(artist => artist !== null);

                    return {
                        ...event,
                        artists: filteredArtists
                    };
                } catch (error) {
                    console.error('Error enriching event with artists:', error);
                    return {
                        ...event,
                        artists: []
                    };
                }
            }));

            // 6. Filtrar eventos que tienen al menos un artista para evaluar
            const eventsWithPendingEvaluations = eventsWithArtists.filter(event => 
                event.artists && event.artists.length > 0
            );

            return eventsWithPendingEvaluations;
        } catch (error) {
            console.error('Error fetching completed events for promoter:', error);
            throw error;
        }
    }

    async getCompletedEventsByPromoter(promoterId) {
        try {
            // Usar el nuevo método que verifica pagos completados
            return await this.getCompletedEventsForPromoter(promoterId);
        } catch (error) {
            console.error('Error fetching completed events:', error);
            throw error;
        }
    }

    async saveEvaluation(evaluationData) {
        try {
            // Primero obtener la información del evento para conseguir el promoterId
            const eventResponse = await httpInstance.get(`/events/${evaluationData.eventId}`);
            const event = eventResponse.data;

            const response = await httpInstance.post('/evaluations', {
                ...evaluationData,
                promoterId: event.adminId, // Agregamos el ID del promotor
                name: evaluationData.eventName,
                date: evaluationData.eventDate,
                location: evaluationData.eventLocation,
                imageUrl: evaluationData.eventImageUrl,
                status: 'evaluated'
            });
            return response.data;
        } catch (error) {
            console.error("Error saving evaluation:", error);
            throw error;
        }
    }

    async saveArtistEvaluation(evaluationData) {
        try {
            const response = await httpInstance.post(this.resourceEndpoint, {
                ...evaluationData,
                type: 'artist',
                status: 'evaluated'
            });
            return response.data;
        } catch (error) {
            console.error("Error saving artist evaluation:", error);
            throw error;
        }
    }

    async getEvaluatedEvents() {
        try {
            const response = await httpInstance.get('/evaluations?type=venue');
            return response.data;
        } catch (error) {
            console.error('Error al obtener eventos evaluados:', error);
            throw new Error('No se pudieron cargar los eventos evaluados');
        }
    }

    async getEvaluatedArtists() {
        try {
            const response = await httpInstance.get('/evaluations?type=artist');
            return response.data;
        } catch (error) {
            console.error('Error al obtener artistas evaluados:', error);
            throw new Error('No se pudieron cargar las evaluaciones de artistas');
        }
    }

    async getEvaluationsByPromoter(promoterId) {
        try {
            // 1. Obtener todas las evaluaciones
            const evaluations = await this.getEvaluatedEvents();
            
            // 2. Obtener todos los eventos del promotor
            const eventsResponse = await httpInstance.get('/events');
            const promoterEvents = eventsResponse.data.filter(event => Number(event.adminId) === Number(promoterId));
            
            // 3. Filtrar las evaluaciones que corresponden a los eventos del promotor
            const promoterEvaluations = evaluations.filter(evaluation => 
                promoterEvents.some(event => Number(event.id) === Number(evaluation.eventId))
            );
            
            return promoterEvaluations;
        } catch (error) {
            console.error('Error al obtener evaluaciones del promotor:', error);
            throw new Error('No se pudieron cargar las evaluaciones del promotor');
        }
    }

    async getArtistEvaluationsByPromoter(promoterId) {
        try {
            // 1. Obtener todas las evaluaciones de artistas
            const evaluations = await this.getEvaluatedArtists();
            const promoterEvaluations = evaluations.filter(evaluation => Number(evaluation.promoterId) === Number(promoterId));

            // 2. Obtener información de los artistas y eventos
            const enrichedEvaluations = await Promise.all(promoterEvaluations.map(async (evaluation) => {
                try {
                    // Obtener información del artista
                    const artistResponse = await httpInstance.get(`/api/v1/users/${evaluation.musicianId}`);
                    const artist = artistResponse.data;

                    // Obtener información del evento
                    const eventResponse = await httpInstance.get(`/events/${evaluation.eventId}`);
                    const event = eventResponse.data;

                    return {
                        ...evaluation,
                        artist: {
                            name: artist.name,
                            imageUrl: artist.imageUrl,
                            userId: artist.id
                        },
                        event: {
                            name: event.name,
                            date: event.date,
                            location: event.location
                        }
                    };
                } catch (error) {
                    console.error('Error enriching evaluation:', error);
                    return evaluation;
                }
            }));

            return enrichedEvaluations;
        } catch (error) {
            console.error('Error al obtener evaluaciones de artistas:', error);
            throw new Error('No se pudieron cargar las evaluaciones de artistas');
        }
    }

    async getArtistEvaluationsByMusician(musicianId) {
        try {
            const evaluations = await this.getEvaluatedArtists();
            return evaluations.filter(evaluation => evaluation.musicianId === musicianId);
        } catch (error) {
            console.error('Error al obtener evaluaciones del artista:', error);
            throw error;
        }
    }

    async getAverageRatingForMusician(musicianId) {
        try {
            const evaluations = await this.getEvaluatedArtists();
            const musicianEvaluations = evaluations.filter(e => e.musicianId === musicianId);
            if (musicianEvaluations.length === 0) return 0;
            
            const sum = musicianEvaluations.reduce((acc, curr) => acc + curr.rating, 0);
            return sum / musicianEvaluations.length;
        } catch (error) {
            console.error('Error getting average rating for musician:', error);
            return 0;
        }
    }

    async getAverageRatingForPromoter(promoterId) {
        try {
            // 1. Obtener todos los eventos del promotor
            const eventsResponse = await httpInstance.get('/events');
            const promoterEvents = eventsResponse.data.filter(event => event.adminId === promoterId);
            
            // 2. Obtener todas las evaluaciones de venues
            const evaluations = await this.getEvaluatedEvents();
            
            // 3. Filtrar las evaluaciones que corresponden a los eventos del promotor
            const promoterEvaluations = evaluations.filter(evaluation => 
                promoterEvents.some(event => event.id === evaluation.eventId)
            );
            
            if (promoterEvaluations.length === 0) return 0;
            
            // 4. Calcular el promedio
            const sum = promoterEvaluations.reduce((acc, curr) => acc + curr.rating, 0);
            return sum / promoterEvaluations.length;
        } catch (error) {
            console.error('Error getting average rating for promoter:', error);
            return 0;
        }
    }
}

export const evaluationService = new EvaluationService();