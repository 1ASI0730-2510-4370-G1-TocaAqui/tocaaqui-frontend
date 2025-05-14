export class Ticket {
    constructor({
        id = null,
        eventId = null,
        eventName = '',
        type = 'General',
        price = 0,
        code = '',
        validUntil = '',
        createdAt = new Date().toISOString(),
        updatedAt = new Date().toISOString(),
        qrGenerated = true,
        status = 'active', // active, used, cancelled
        promoterId = null,
        shareStats = {
            clicks: 0,
            uniqueVisits: 0,
            attendanceConfirmations: 0,
            ticketsIssued: 0,
            ticketsScanned: 0
        },
        platforms = []
    } = {}) {
        this.id = id;
        this.eventId = eventId;
        this.eventName = eventName;
        this.type = type;
        this.price = price;
        this.code = code;
        this.validUntil = validUntil;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.qrGenerated = qrGenerated;
        this.status = status;
        this.promoterId = promoterId;
        this.shareStats = shareStats;
        this.platforms = platforms;
    }

    get formattedPrice() {
        return `$${this.price.toFixed(2)}`;
    }

    get isActive() {
        return this.status === 'active';
    }

    get isUsed() {
        return this.status === 'used';
    }

    get isCancelled() {
        return this.status === 'cancelled';
    }

    get statusLabel() {
        const statusMap = {
            'active': 'Activo',
            'used': 'Usado',
            'cancelled': 'Cancelado'
        };
        return statusMap[this.status] || this.status;
    }

    // Método para generar un código único para la entrada
    static generateCode(eventName, type) {
        const eventPrefix = eventName
            .split(' ')
            .map(word => word.charAt(0).toUpperCase())
            .join('');
        
        const typePrefix = type.split(' ')[0].substring(0, 3).toUpperCase();
        const randomNum = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
        
        return `${eventPrefix}-${typePrefix}-${randomNum}`;
    }
}

export class TicketType {
    constructor({
        id = null,
        name = '',
        description = '',
        price = 0,
        available = true,
        maxPerPurchase = 10,
        eventId = null
    } = {}) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.price = price;
        this.available = available;
        this.maxPerPurchase = maxPerPurchase;
        this.eventId = eventId;
    }
}

export class TicketStats {
    constructor({
        ticketId = null,
        clicks = 0,
        uniqueVisits = 0,
        attendanceConfirmations = 0,
        ticketsIssued = 0,
        ticketsScanned = 0
    } = {}) {
        this.ticketId = ticketId;
        this.clicks = clicks;
        this.uniqueVisits = uniqueVisits;
        this.attendanceConfirmations = attendanceConfirmations;
        this.ticketsIssued = ticketsIssued;
        this.ticketsScanned = ticketsScanned;
    }
}