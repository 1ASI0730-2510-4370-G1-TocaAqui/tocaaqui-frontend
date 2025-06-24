import httpInstance from "../../shared/services/http.instance.js";
import { Payment, PaymentStatus } from '../model/payment.model';

export class PaymentService {
    async createPayment(eventId, amount, userId, promotorId) {
        try {
            console.log('Creating payment:', { eventId, amount, userId, promotorId });
            
            // Obtener información del evento
            const eventResponse = await httpInstance.get(`/events/${eventId}`);
            const event = eventResponse.data;
            
            // Obtener información del músico
            const musicoResponse = await httpInstance.get(`/api/v1/users/${userId}`);
            const musico = musicoResponse.data;

            const now = new Date().toISOString();
            
            const paymentData = {
                eventId: Number(eventId),
                amount: Number(amount),
                musicoId: Number(userId),
                promotorId: Number(promotorId),
                status: PaymentStatus.PENDING,
                paymentMethod: "bank_transfer",
                bankInfo: {
                    accountNumber: "****" + Math.floor(1000 + Math.random() * 9000),
                    bankName: "Banco de Crédito",
                    accountType: "savings"
                },
                description: `Pago por presentación de ${musico.name} en ${event.name}`,
                createdAt: now,
                updatedAt: now,
                statusHistory: [
                    {
                        status: PaymentStatus.PENDING,
                        timestamp: now,
                        comment: "Pago creado"
                    }
                ]
            };

            console.log('Creating payment with data:', paymentData);
            const response = await httpInstance.post('/payments', paymentData);
            console.log('Payment created:', response.data);
            return new Payment(response.data);
        } catch (error) {
            console.error('Error creating payment:', error);
            throw error;
        }
    }

    async getPaymentsByUser(userId) {
        try {
            // 1. Obtener el usuario
            const userResponse = await httpInstance.get(`/api/v1/users/${userId}`);
            const user = userResponse.data;

            // 2. Obtener todos los pagos
            const paymentsResponse = await httpInstance.get('/payments');
            const payments = Array.isArray(paymentsResponse.data) ? paymentsResponse.data : [];
            console.log('Payments from server:', payments);

            // 3. Filtrar pagos según el rol del usuario
            const userPayments = payments.filter(payment => {
                if (user.role === 'musico') {
                    return Number(payment.musicoId) === Number(userId);
                }
                if (user.role === 'promotor') {
                    return Number(payment.promotorId) === Number(userId);
                }
                return false;
            });

            // 4. Enriquecer los pagos con información adicional
            const enrichedPayments = await Promise.all(userPayments.map(async payment => {
                    try {
                    // Obtener información del evento
                        const eventResponse = await httpInstance.get(`/events/${payment.eventId}`);
                    const event = eventResponse.data;

                    // Obtener información del músico
                    const musicoResponse = await httpInstance.get(`/api/v1/users/${payment.musicoId}`);
                    const musico = musicoResponse.data;

                    // Obtener información del promotor
                    const promotorResponse = await httpInstance.get(`/api/v1/users/${payment.promotorId}`);
                    const promotor = promotorResponse.data;

                    return {
                            ...payment,
                        eventName: event.name,
                        musicoName: musico.name,
                        promotorName: promotor.name
                    };
                    } catch (error) {
                    console.error('Error enriching payment:', error);
                    return payment;
                }
            }));

            console.log('Enriched payments:', enrichedPayments);

            // 5. Convertir a instancias de Payment
            return enrichedPayments.map(payment => new Payment(payment));
        } catch (error) {
            console.error('Error al obtener pagos:', error);
            throw new Error('No se pudieron cargar los pagos');
        }
    }

    async updatePaymentStatus(paymentId, newStatus) {
        try {
            // Primero obtener el pago actual para mantener el historial
            const currentPayment = await httpInstance.get(`/payments/${paymentId}`);
            const payment = currentPayment.data;

            const now = new Date().toISOString();
            let comment = '';

            switch (newStatus) {
                case PaymentStatus.HELD:
                    comment = 'Pago en espera de confirmación del evento';
                    break;
                case PaymentStatus.COMPLETED:
                    comment = 'Pago liberado después de confirmar el evento';
                    break;
                case PaymentStatus.CANCELLED:
                    comment = 'Pago cancelado';
                    break;
                default:
                    comment = 'Estado actualizado';
            }

            const statusHistoryEntry = {
                status: newStatus,
                timestamp: now,
                comment
            };

            const updatedData = {
                status: newStatus,
                updatedAt: now,
                statusHistory: [...(payment.statusHistory || []), statusHistoryEntry]
            };

            const { data } = await httpInstance.patch(`/payments/${paymentId}`, updatedData);
            return new Payment(data);
        } catch (error) {
            console.error('Error updating payment status:', error);
            throw new Error(`Error al actualizar el estado del pago: ${error.message}`);
        }
    }

    async releasePayment(paymentId) {
        return this.updatePaymentStatus(paymentId, PaymentStatus.COMPLETED);
    }

    async cancelPayment(paymentId) {
        return this.updatePaymentStatus(paymentId, PaymentStatus.CANCELLED);
    }

    async enrichPaymentData(payment) {
        try {
            console.log('Enriching payment data:', payment);
            // Obtener información del evento
            const eventResponse = await httpInstance.get(`/events/${Number(payment.eventId)}`);
            const event = eventResponse.data;

            // Obtener información del músico
                            const musicoResponse = await httpInstance.get(`/api/v1/users/${Number(payment.musicoId)}`);
            const musico = musicoResponse.data;

            // Obtener información del promotor
                            const promotorResponse = await httpInstance.get(`/api/v1/users/${Number(payment.promotorId)}`);
            const promotor = promotorResponse.data;

            const enrichedPayment = new Payment(
                Number(payment.id),
                Number(payment.amount),
                Number(payment.eventId),
                Number(payment.musicoId),
                Number(payment.promotorId),
                payment.status,
                new Date(payment.createdAt),
                new Date(payment.updatedAt)
            );

            // Agregar información adicional
            enrichedPayment.eventName = event.name;
            enrichedPayment.musicoName = musico.name;
            enrichedPayment.promotorName = promotor.name;

            console.log('Enriched payment:', enrichedPayment);
            return enrichedPayment;
        } catch (error) {
            console.error('Error enriching payment data:', error);
            return payment;
        }
    }
} 