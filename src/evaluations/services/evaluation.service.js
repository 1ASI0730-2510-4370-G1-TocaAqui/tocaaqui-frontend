// src/evaluations/services/evaluation.service.js
import http from '@/shared/services/http.instance.js'
import { Evaluation } from '../model/evaluation.entity.js'

export class EvaluationService {
    endpoint = '/evaluations'
    checklistEndpoint = '/evaluation_checklist'

    async getAll () {
        const { data } = await http.get(this.endpoint + '?_expand=event')
        return data.map(e => new Evaluation(e))
    }

    async getById (id) {
        const { data } = await http.get(`${this.endpoint}/${id}?_expand=event`)
        if (!data) throw new Error('No se encontró la evaluación')
        // checklist aparte
        const { data: list } = await http.get(`${this.checklistEndpoint}?evaluationId=${id}`)
        return new Evaluation({ ...data, checklist: list })
    }

    async create (dto) {
        const { data } = await http.post(this.endpoint, dto)
        return new Evaluation(data)
    }

    async update (id, dto) {
        const { data } = await http.put(`${this.endpoint}/${id}`, dto)
        return new Evaluation(data)
    }
}

export const evaluationService = new EvaluationService()
