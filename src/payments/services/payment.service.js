import axios from 'axios';
import { Payment, PaymentStatus } from '../model/payment.model';

// Usar la misma URL base que el resto de la aplicación
const API_BASE_URL = import.meta.env.VITE_API_URL;

export class PaymentService {
    constructor() {
        this.axios = axios.create({
            baseURL: API_BASE_URL,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }

    async createPayment(eventId, amount, userId, promotorId) {
        try {
            console.log('Creating payment:', { eventId, amount, userId, promotorId });
            const response = await this.axios.post('/payments', {
                eventId: Number(eventId),
                amount: Number(amount),
                musicoId: Number(userId),
                promotorId: Number(promotorId),
                status: PaymentStatus.PENDING,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
            return this.enrichPaymentData(response.data);
        } catch (error) {
            console.error('Error creating payment:', error);
            throw error;
        }
    }

    async getPaymentsByUser(userId) {
        try {
            // 1. Obtener el usuario
            const userResponse = await this.axios.get(`/users/${userId}`);
            const user = userResponse.data;

            // 2. Obtener todos los pagos
            const paymentsResponse = await this.axios.get('/payments');
            const payments = paymentsResponse.data;

            // 3. Filtrar pagos según el rol del usuario
            const userPayments = payments.filter(payment => {
                if (user.role === 'musico') {
                    return payment.musicoId === userId;
                }
                if (user.role === 'promotor') {
                    return payment.promotorId === userId;
                }
                return false;
            });

            // 4. Obtener información adicional para cada pago
            const enrichedPayments = await Promise.all(
                userPayments.map(async (payment) => {
                    const eventResponse = await this.axios.get(`/events/${payment.eventId}`);
                    return new Payment({
                        ...payment,
                        eventName: eventResponse.data.name
                    });
                })
            );

            return enrichedPayments;
        } catch (error) {
            console.error('Error al obtener pagos:', error);
            throw new Error('No se pudieron cargar los pagos');
        }
    }

    async updatePaymentStatus(paymentId, newStatus) {
        try {
            const { data } = await this.axios.patch(`/payments/${paymentId}`, {
                status: newStatus,
                updatedAt: new Date().toISOString()
            });
            return Payment.fromJSON(data);
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
            const eventResponse = await this.axios.get(`/events/${Number(payment.eventId)}`);
            const event = eventResponse.data;

            // Obtener información del músico
            const musicoResponse = await this.axios.get(`/users/${Number(payment.musicoId)}`);
            const musico = musicoResponse.data;

            // Obtener información del promotor
            const promotorResponse = await this.axios.get(`/users/${Number(payment.promotorId)}`);
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