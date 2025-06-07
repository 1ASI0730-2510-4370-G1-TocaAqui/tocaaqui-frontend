export class Invitation {
    constructor({
        id = null,
        eventId = null,
        eventName = '',
        eventDate = '',
        eventLocation = '',
        eventImageUrl = '',
        promoterId = null,
        promoterName = '',
        artistId = null,
        artistName = '',
        message = '',
        status = 'pending', // 'pending', 'accepted', 'rejected'
        createdAt = new Date().toISOString(),
        updatedAt = new Date().toISOString()
    } = {}) {
        this.id = id;
        this.eventId = eventId;
        this.eventName = eventName;
        this.eventDate = eventDate;
        this.eventLocation = eventLocation;
        this.eventImageUrl = eventImageUrl;
        this.promoterId = promoterId;
        this.promoterName = promoterName;
        this.artistId = artistId;
        this.artistName = artistName;
        this.message = message;
        this.status = status;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
} 