export class PromoterEvent {
    constructor({
        id = null,
        name = '',
        date = '',
        time = '',
        location = '',
        imageUrl = '',
        status = 'pending',
        publishDate = '',
        soundcheckDate = '',
        soundcheckTime = '',
        capacity = 0,
        availableTickets = 0,
        adminName = '',
        adminContact = '',
        requirements = '',
        description = '',
        payment = '',
        duration = 0,
        genre = '',
        equipment = ''
    } = {}) {
        this.id = id;
        this.name = name;
        this.date = date;
        this.time = time;
        this.location = location;
        this.imageUrl = imageUrl;
        this.status = status;
        this.publishDate = publishDate;
        this.soundcheckDate = soundcheckDate;
        this.soundcheckTime = soundcheckTime;
        this.capacity = capacity;
        this.availableTickets = availableTickets;
        this.adminName = adminName;
        this.adminContact = adminContact;
        this.requirements = requirements;
        this.description = description;
        this.payment = payment;
        this.duration = duration;
        this.genre = genre;
        this.equipment = equipment;
    }

    get formattedDate() {
        if (!this.date) return '';
        const date = new Date(this.date);
        const options = { weekday: 'long', day: 'numeric', month: 'short' };
        return date.toLocaleDateString('es-ES', options);
    }

    get statusLabel() {
        const statusMap = {
            'pending': 'Pendiente',
            'published': 'Publicado',
            'draft': 'Borrador',
            'cancelled': 'Cancelado',
            'completed': 'Completado'
        };
        return statusMap[this.status] || this.status;
    }
}