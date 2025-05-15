export class Evaluation {
    constructor({
                    id = null,
                    eventId = null,
                    musicianId = null,
                    promoterId = null,
                    rating = 0,
                    comment = '',
                    venueRating = 0,
                    venueComment = '',
                    checklist = [],
                    createdAt = new Date().toISOString()
                } = {}) {
        Object.assign(this, { id, eventId, musicianId, promoterId, rating, comment, venueRating, venueComment, checklist, createdAt });
    }
}