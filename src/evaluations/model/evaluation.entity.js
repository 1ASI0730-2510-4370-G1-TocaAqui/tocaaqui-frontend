// src/evaluations/model/evaluation.entity.js
export class Evaluation {
    constructor({
                    id = null,
                    eventId = null,
                    musicianId = null,
                    promoterId = null,
                    rating = 0,
                    comment = '',
                    checklist = [],          // [{ id, label, value }]
                    createdAt = new Date().toISOString()
                } = {}) {
        Object.assign(this, { id, eventId, musicianId, promoterId, rating, comment, checklist, createdAt })
    }
}
