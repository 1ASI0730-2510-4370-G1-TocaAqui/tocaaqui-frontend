// Estados de pago
export const PaymentStatus = {
    PENDING: 'PENDING',
    HELD: 'HELD',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED'
};

// Modelo de pago
export class Payment {
    constructor(data) {
        this.id = data.id;
        this.amount = data.amount;
        this.eventId = data.eventId;
        // Unificar nombres en inglés para backend
        this.musicianId = data.musicianId ?? data.musicoId;
        this.promoterId = data.promoterId ?? data.promotorId;
        this.status = data.status;
        this.description = data.description;
        this.createdAt = data.createdAt;
        this.updatedAt = data.updatedAt;
        this.eventName = data.eventName;
        this.musicianName = data.musicianName ?? data.musicoName;
        this.promoterName = data.promoterName ?? data.promotorName;
        this.paymentMethod = data.paymentMethod;
        this.bankInfo = data.bankInfo;
    }

    static fromJSON(json) {
        return new Payment(json);
    }

    toJSON() {
        return {
            id: this.id,
            amount: this.amount,
            eventId: this.eventId,
            musicianId: this.musicianId,
            promoterId: this.promoterId,
            status: this.status,
            description: this.description,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            paymentMethod: this.paymentMethod,
            bankInfo: this.bankInfo
        };
    }
}