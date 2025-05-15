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

    async saveEvaluation(evaluationData) {
        try {
            const response = await httpInstance.post('/evaluations', {
                ...evaluationData,
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

    async getEvaluatedEvents() {
        try {
            const response = await httpInstance.get('/evaluations');
            return response.data;
        } catch (error) {
            console.error('Error al obtener eventos evaluados:', error);
            throw new Error('No se pudieron cargar los eventos evaluados');
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
}

export const evaluationService = new EvaluationService();