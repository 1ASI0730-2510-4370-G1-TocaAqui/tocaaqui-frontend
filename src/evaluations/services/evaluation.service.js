import httpInstance from '../../shared/services/http.instance';

export class EvaluationService {
    async getAllEvents() {
        try {
            const response = await httpInstance.get('/events');
            return response.data;
        } catch (error) {
            console.error('Error fetching events:', error);
            throw error;
        }
    }

    async getCompletedEventsByPromoter(promoterId) {
        try {
            // Obtener todos los eventos del promotor
            const eventsResponse = await httpInstance.get('/events');
            return eventsResponse.data.filter(event => 
                event.adminId === promoterId
            );
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
            const response = await httpInstance.post('/evaluations', {
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
            const promoterEvents = eventsResponse.data.filter(event => event.adminId === promoterId);
            
            // 3. Filtrar las evaluaciones que corresponden a los eventos del promotor
            const promoterEvaluations = evaluations.filter(evaluation => 
                promoterEvents.some(event => event.id === evaluation.eventId)
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
            const promoterEvaluations = evaluations.filter(evaluation => evaluation.promoterId === promoterId);

            // 2. Obtener información de los artistas y eventos
            const enrichedEvaluations = await Promise.all(promoterEvaluations.map(async (evaluation) => {
                try {
                    // Obtener información del artista
                    const artistResponse = await httpInstance.get(`/users/${evaluation.musicianId}`);
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