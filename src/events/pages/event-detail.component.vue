<template>
    <div class="event-detail-container p-4">
        <div class="surface-0 p-4 shadow-2 border-round">
            <div v-if="isLoading" class="flex justify-content-center">
                <pv-progress-spinner />
            </div>
            <div v-else-if="event" class="grid">
                <!-- Cabecera del evento -->
                <div class="col-12 flex justify-content-between align-items-center mb-4">
                    <h1 class="text-4xl font-bold m-0">{{ event.name }}</h1>
                    <div class="flex flex-column gap-3">
                        <!-- Estado del evento -->
                        <div class="flex gap-2 align-items-center">
                            <pv-tag :value="$t(`eventApplications.status.${event.status || 'active'}`)"
                                   :severity="getStatusSeverity(event.status)"
                                   class="text-lg" />
                            
                            <!-- Estado del pago y botones -->
                            <template v-if="hasAcceptedApplicant">
                                <pv-tag 
                                    v-if="payment"
                                    :value="payment.status"
                                    :severity="getPaymentStatusSeverity(payment.status)"
                                    class="text-lg" />
                                
                                <!-- Botón de Pagar -->
                                <pv-button
                                    v-if="payment && payment.status === 'PENDING'"
                                    label="Pagar"
                                    icon="pi pi-money-bill"
                                    :loading="paymentLoading"
                                    @click="handlePayment"
                                    class="p-button-success" />
                                
                                <!-- Botón de Finalizar Evento -->
                                <pv-button
                                    v-if="payment && payment.status === 'HELD'"
                                    label="Finalizar Evento"
                                    icon="pi pi-check-circle"
                                    :loading="paymentLoading"
                                    @click="finalizeEvent"
                                    class="p-button-success" />
                            </template>
                        </div>
                    </div>
                </div>

                <!-- Imagen y detalles principales -->
                <div class="col-12 lg:col-5">
                    <div class="image-container mb-4">
                        <img :src="event.imageUrl" :alt="event.name" class="event-image" />
                    </div>
                </div>

                <div class="col-12 lg:col-7">
                    <!-- Información principal -->
                    <div class="event-info-grid mb-4">
                        <div class="info-item">
                            <div class="flex align-items-center">
                                <i class="pi pi-calendar mr-2 text-xl"></i>
                                <span class="text-lg">{{ formatDate(event.date) }}</span>
                            </div>
                        </div>
                        <div class="info-item">
                            <div class="flex align-items-center">
                                <i class="pi pi-clock mr-2 text-xl"></i>
                                <span class="text-lg">{{ event.time }}</span>
                            </div>
                        </div>
                        <div class="info-item">
                            <div class="flex align-items-center">
                                <i class="pi pi-map-marker mr-2 text-xl"></i>
                                <span class="text-lg">{{ event.location }}</span>
                            </div>
                        </div>
                        <div class="info-item">
                            <div class="flex align-items-center">
                                <i class="pi pi-music mr-2 text-xl"></i>
                                <span class="text-lg">{{ event.genre }}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Detalles adicionales -->
                    <div class="event-details-grid mb-4">
                        <div class="detail-item surface-100 p-3 border-round">
                            <i class="pi pi-money-bill text-xl mb-2"></i>
                            <span class="text-lg font-medium block">{{ formatCurrency(event.payment) }}</span>
                        </div>
                        <div class="detail-item surface-100 p-3 border-round">
                            <i class="pi pi-users text-xl mb-2"></i>
                            <span class="text-lg font-medium block">{{ event.capacity }} personas</span>
                        </div>
                        <div class="detail-item surface-100 p-3 border-round">
                            <i class="pi pi-clock text-xl mb-2"></i>
                            <span class="text-lg font-medium block">{{ event.duration }} horas</span>
                        </div>
                    </div>

                    <!-- Descripción -->
                    <div class="mb-4">
                        <h3 class="text-xl font-semibold mb-2">{{ $t('applicationDetail.description') }}</h3>
                        <p class="line-height-3 description-text">{{ event.description }}</p>
                    </div>

                    <!-- Requisitos -->
                    <div class="mb-4">
                        <h3 class="text-xl font-semibold mb-2">{{ $t('applicationDetail.requirements') }}</h3>
                        <p class="line-height-3 requirements-text">{{ event.requirements }}</p>
                    </div>
                </div>

                <!-- Invitaciones -->
                <div v-if="invitedApplicants.length > 0" class="col-12 mt-4">
                    <h2 class="text-2xl font-bold mb-4">{{ $t('eventApplications.invitations') }}</h2>
                    <div class="grid">
                        <div v-for="applicant in invitedApplicants" :key="applicant.id" class="col-12 mb-3">
                            <div class="surface-200 p-4 border-round border-2 border-primary">
                                <div class="flex flex-column md:flex-row align-items-center justify-content-between">
                                    <div class="flex align-items-center mb-3 md:mb-0">
                                        <img :src="applicant.imageUrl" :alt="applicant.name" 
                                             class="border-circle mr-3" style="width: 64px; height: 64px; object-fit: cover;" />
                                        <div>
                                            <h3 class="text-xl font-semibold mb-2">
                                                {{ applicant.name }}
                                                <pv-tag value="Invitado" severity="success" class="ml-2" />
                                            </h3>
                                            <div class="flex gap-3">
                                                <span class="flex align-items-center">
                                                    <i class="pi pi-music mr-2"></i>
                                                    {{ applicant.genre }}
                                                </span>
                                                <span class="flex align-items-center">
                                                    <i class="pi pi-envelope mr-2"></i>
                                                    {{ applicant.email }}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="flex flex-column align-items-end gap-2">
                                        <pv-tag v-if="applicant.status" 
                                               :value="$t(`eventApplications.status.${applicant.status}`)"
                                               :severity="getStatusSeverity(applicant.status)"
                                               class="mb-2" />
                                        <div class="flex gap-2">
                                            <pv-button 
                                                icon="pi pi-eye" 
                                                @click="viewApplicantProfile(applicant.userId)"
                                                text 
                                                :label="$t('eventApplications.viewProfile')" 
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div v-if="applicant.description" class="mt-3">
                                    <p class="line-height-3">{{ applicant.description }}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Postulantes -->
                <div class="col-12 mt-4">
                    <h2 class="text-2xl font-bold mb-4">{{ $t('eventApplications.applicants') }}</h2>
                    <div v-if="regularApplicants.length === 0" class="text-center p-4">
                        <p>{{ $t('eventApplications.noApplicants') }}</p>
                    </div>
                    <div v-else class="grid">
                        <div v-for="applicant in regularApplicants" :key="applicant.id" class="col-12 mb-3">
                            <div class="surface-100 p-4 border-round">
                                <div class="flex flex-column md:flex-row align-items-center justify-content-between">
                                    <div class="flex align-items-center mb-3 md:mb-0">
                                        <img :src="applicant.imageUrl" :alt="applicant.name" 
                                             class="border-circle mr-3" style="width: 64px; height: 64px; object-fit: cover;" />
                                        <div>
                                            <h3 class="text-xl font-semibold mb-2">{{ applicant.name }}</h3>
                                            <div class="flex gap-3">
                                                <span class="flex align-items-center">
                                                    <i class="pi pi-music mr-2"></i>
                                                    {{ applicant.genre }}
                                                </span>
                                                <span class="flex align-items-center">
                                                    <i class="pi pi-envelope mr-2"></i>
                                                    {{ applicant.email }}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="flex flex-column align-items-end gap-2">
                                        <pv-tag v-if="applicant.status" 
                                               :value="$t(`eventApplications.status.${applicant.status}`)"
                                               :severity="getStatusSeverity(applicant.status)"
                                               class="mb-2" />
                                        <div class="flex gap-2">
                                            <pv-button 
                                                icon="pi pi-eye" 
                                                @click="viewApplicantProfile(applicant.userId)"
                                                text 
                                                :label="$t('eventApplications.viewProfile')" 
                                            />
                                            <pv-button 
                                                v-if="!hasAcceptedApplicant && (applicant.status === 'pending' || applicant.status === 'Pending')"
                                                icon="pi pi-check" 
                                                @click="acceptApplicant(applicant.id)"
                                                severity="success"
                                                :label="$t('eventApplications.accept')" 
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div v-if="applicant.description" class="mt-3">
                                    <p class="line-height-3">{{ applicant.description }}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div v-else class="text-center">
                <p>{{ $t('eventApplications.eventNotFound') }}</p>
            </div>
        </div>
    </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { EventApplicationService } from '../services/event-application.service';
import { PaymentService } from '../../payments/services/payment.service';
import httpInstance from '../../shared/services/http.instance';

export default {
    name: 'EventDetail',
    setup() {
        const route = useRoute();
        const router = useRouter();
        const { t } = useI18n();
        const eventApplicationService = new EventApplicationService();
        const paymentService = new PaymentService();

        const event = ref(null);
        const applicants = ref([]);
        const isLoading = ref(true);
        const hasAcceptedApplicant = ref(false);
        const payment = ref(null);
        const paymentLoading = ref(false);

        // Computed properties para separar postulantes e invitados
        const invitedApplicants = computed(() => {
            return applicants.value.filter(applicant => applicant.isInvited === true);
        });

        const regularApplicants = computed(() => {
            return applicants.value.filter(applicant => !applicant.isInvited);
        });

        const formatDate = (date) => {
            if (!date) return '';
            const localDate = new Date(date + 'T00:00:00');
            return localDate.toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        };

        const formatCurrency = (value) => {
            return new Intl.NumberFormat('es-PE', {
                style: 'currency',
                currency: 'PEN'
            }).format(value);
        };

        const getStatusSeverity = (status) => {
            const severities = {
                pending: 'warning',
                contract_pending: 'info',
                signed: 'success',
                accepted: 'success',
                rejected: 'danger',
                Pending: 'warning',
                ContractPending: 'info',
                Signed: 'success',
                Rejected: 'danger'
            };
            return severities[status] || 'info';
        };

        const getPaymentStatusSeverity = (status) => {
            const severities = {
                'PENDING': 'warning',
                'HELD': 'info',
                'COMPLETED': 'success',
                'CANCELLED': 'danger'
            };
            return severities[status] || 'info';
        };

        const loadEventData = async () => {
            try {
                isLoading.value = true;
                const eventId = route.params.id;
                
                // Cargar datos del evento
                event.value = await eventApplicationService.getById(eventId);
                
                // Cargar postulantes
                const eventApplicants = await eventApplicationService.getEventApplicants(eventId);
                
                // Verificar si ya hay un postulante con contrato firmado
                const signedApplicant = eventApplicants.find(app => app.status === 'signed' || app.status === 'Signed');
                hasAcceptedApplicant.value = !!signedApplicant;
                
                if (signedApplicant) {
                    console.log('Artista con contrato firmado encontrado:', signedApplicant);
                    // Buscar el pago asociado al artista con contrato firmado
                    const payments = await paymentService.getPaymentsByUser(event.value.adminId);
                    console.log('Pagos encontrados:', payments);
                    if (payments && payments.length > 0) {
                        payment.value = payments.find(p => 
                            Number(p.eventId) === Number(eventId) && 
                            Number(p.musicoId) === Number(signedApplicant.userId)
                        );
                        console.log('Pago para este evento:', payment.value);
                    }
                }
                
                // Asignar postulantes
                applicants.value = eventApplicants;
            } catch (error) {
                console.error('Error loading event data:', error);
            } finally {
                isLoading.value = false;
            }
        };

        const viewApplicantProfile = (userId) => {
            router.push(`/profile/${userId}`);
        };

        const acceptApplicant = async (applicantId) => {
            try {
                // Solo cambiar el estado a 'contract_pending' (no crear pago aún)
                await eventApplicationService.updateApplicationStatus(applicantId, 'contract_pending');
                
                // Recargar los datos
                await loadEventData();
            } catch (error) {
                console.error('Error accepting applicant:', error);
            }
        };

        const handlePayment = async () => {
            if (!payment.value) return;
            try {
                paymentLoading.value = true;
                const now = new Date().toISOString();
                
                // Asegurarnos de que statusHistory sea un array
                const currentHistory = Array.isArray(payment.value.statusHistory) 
                    ? payment.value.statusHistory 
                    : [];
                
                // Actualizar el pago a estado HELD
                const updatedPayment = {
                    ...payment.value,
                    status: "HELD",
                    updatedAt: now,
                    statusHistory: [
                        ...currentHistory,
                        {
                            status: "HELD",
                            timestamp: now,
                            comment: "Pago en espera de confirmación del evento"
                        }
                    ]
                };

                const response = await httpInstance.patch(`/payments/${payment.value.id}`, updatedPayment);
                payment.value = response.data;
                await loadEventData();
            } catch (error) {
                console.error('Error processing payment:', error);
            } finally {
                paymentLoading.value = false;
            }
        };

        const finalizeEvent = async () => {
            if (!payment.value) return;
            try {
                paymentLoading.value = true;
                const now = new Date().toISOString();
                
                // Asegurarnos de que statusHistory sea un array
                const currentHistory = Array.isArray(payment.value.statusHistory) 
                    ? payment.value.statusHistory 
                    : [];
                
                // Actualizar el pago a estado COMPLETED
                const updatedPayment = {
                    ...payment.value,
                    status: "COMPLETED",
                    updatedAt: now,
                    statusHistory: [
                        ...currentHistory,
                        {
                            status: "COMPLETED",
                            timestamp: now,
                            comment: "Pago liberado después de confirmar el evento"
                        }
                    ]
                };

                const response = await httpInstance.patch(`/payments/${payment.value.id}`, updatedPayment);
                payment.value = response.data;
                await loadEventData();
            } catch (error) {
                console.error('Error finalizing event:', error);
            } finally {
                paymentLoading.value = false;
            }
        };

        onMounted(loadEventData);

        return {
            event,
            applicants,
            invitedApplicants,
            regularApplicants,
            isLoading,
            hasAcceptedApplicant,
            payment,
            paymentLoading,
            formatDate,
            formatCurrency,
            getStatusSeverity,
            getPaymentStatusSeverity,
            viewApplicantProfile,
            acceptApplicant,
            handlePayment,
            finalizeEvent
        };
    }
};
</script>

<style scoped>
.event-detail-container {
    max-width: 1200px;
    margin: 0 auto;
}

.image-container {
    width: 100%;
    height: 400px;
    overflow: hidden;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.event-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
}

.event-info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
}

.event-details-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
}

.detail-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
}

.description-text, .requirements-text {
    background-color: var(--surface-50);
    padding: 1.5rem;
    border-radius: 8px;
    margin-top: 0.5rem;
    font-size: 1.1rem;
}

@media screen and (max-width: 768px) {
    .event-details-grid {
        grid-template-columns: repeat(1, 1fr);
    }
    
    .image-container {
        height: 300px;
    }
}
</style> 