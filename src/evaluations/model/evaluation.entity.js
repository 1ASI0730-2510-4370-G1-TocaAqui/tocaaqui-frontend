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
                    artistRating = 0,
                    artistComment = '',
                    checklist = [],
                    artistChecklist = [],
                    createdAt = new Date().toISOString(),
                    type = 'venue' // 'venue' o 'artist'
                } = {}) {
        Object.assign(this, { id, eventId, musicianId, promoterId, rating, comment, venueRating, venueComment, artistRating, artistComment, checklist, artistChecklist, createdAt, type });
    }
}