import httpInstance from '../../shared/services/http.instance.js';

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
            return response.data.filter(evaluation => evaluation.status === 'evaluated');
        } catch (error) {
            console.error('Error al obtener eventos evaluados:', error);
            throw error;
        }
    }
}

export const evaluationService = new EvaluationService();