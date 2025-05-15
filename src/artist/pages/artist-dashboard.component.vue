<script>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { EventApplicationService } from '../../event-application/services/event-application.service';
import { PaymentService } from '../../payments/services/payment.service';

export default {
    name: 'ArtistDashboard',
    setup() {
        const router = useRouter();
        const { t } = useI18n();
        const user = ref(null);
        const isLoading = ref(true);
        const eventApplicationService = new EventApplicationService();
        const paymentService = new PaymentService();
        const upcomingEvents = ref([]);
        const pendingPayments = ref([]);

        // Estados computados para mostrar mensajes descriptivos
        const statsConfig = computed(() => ({
            nextEvents: {
                value: upcomingEvents.value.length,
                title: t('dashboard.stats.nextEvents.title'),
                empty: t('dashboard.stats.nextEvents.empty'),
                icon: 'pi pi-calendar',
                color: 'text-primary'
            },
            pendingPayments: {
                value: pendingPayments.value.length,
                title: t('dashboard.stats.pendingPayments.title'),
                empty: t('dashboard.stats.pendingPayments.empty'),
                icon: 'pi pi-money-bill',
                color: 'text-orange-500'
            },
            rating: {
                value: '-',
                title: t('dashboard.stats.rating.title'),
                empty: t('dashboard.stats.rating.empty'),
                icon: 'pi pi-star-fill',
                color: 'text-yellow-500'
            },
            bookings: {
                value: 0,
                title: t('dashboard.stats.bookings.title'),
                empty: t('dashboard.stats.bookings.empty'),
                icon: 'pi pi-check-circle',
                color: 'text-green-500'
            }
        }));

        onMounted(async () => {
            const userStr = localStorage.getItem('user');
            if (!userStr) {
                router.push('/login');
                return;
            }
            user.value = JSON.parse(userStr);
            isLoading.value = false;
            await Promise.all([
                fetchUpcomingEvents(),
                fetchPendingPayments()
            ]);
        });

        const getStatusSeverity = (status) => {
            const severities = {
                pending: 'warning',
                accepted: 'success',
                rejected: 'danger'
            };
            return severities[status] || 'info';
        };

        const formatDate = (date) => {
            if (!date) return '';
            return new Date(date).toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        };

        const fetchPendingPayments = async () => {
            try {
                const payments = await paymentService.getPaymentsByUser(user.value.id);
                pendingPayments.value = payments.filter(payment => 
                    payment.status === 'PENDING'
                );
            } catch (error) {
                console.error('Error fetching pending payments:', error);
            }
        };

        const formatCurrency = (value) => {
            return new Intl.NumberFormat('es-PE', {
                style: 'currency',
                currency: 'PEN'
            }).format(value);
        };

        const fetchUpcomingEvents = async () => {
            try {
                isLoading.value = true;
                // Obtener las postulaciones del usuario
                const applicants = await eventApplicationService.getUserApplications(user.value.id);
                
                // Obtener los detalles de los eventos correspondientes
                const eventPromises = applicants.map(applicant => 
                    eventApplicationService.getById(applicant.eventId)
                        .then(event => ({
                            ...event,
                            status: applicant.status,
                            applicationDate: applicant.applicationDate,
                            contractSigned: applicant.contractSigned,
                            riderUploaded: applicant.riderUploaded
                        }))
                );
                
                const events = await Promise.all(eventPromises);
                
                // Ordenar eventos por fecha
                upcomingEvents.value = events.sort((a, b) => new Date(a.date) - new Date(b.date));
            } catch (error) {
                console.error('Error fetching upcoming events:', error);
            } finally {
                isLoading.value = false;
            }
        };

        const viewEventDetail = (eventId) => {
            router.push(`/applications/${eventId}`);
        };

        const navigateToPayments = () => {
            router.push('/payments');
        };

        return {
            user,
            isLoading,
            statsConfig,
            getStatusSeverity,
            formatDate,
            formatCurrency,
            upcomingEvents,
            pendingPayments,
            viewEventDetail,
            navigateToPayments
        };
    }
};
</script>

<template>
    <div class="dashboard-container">
        <div class="welcome-section py-3">
            <div class="dashboard-content px-4">
                <h1 class="text-4xl font-bold mb-2">{{ $t('dashboard.welcome', { name: user?.name || '' }) }}</h1>
            </div>
        </div>

        <div class="dashboard-content p-4">
            <!-- Stats Cards -->
            <div class="grid">
                <div v-for="(stat, key) in statsConfig" :key="key" class="col-12 sm:col-6 lg:col-3">
                    <pv-card class="dashboard-card">
                        <template #header>
                            <div class="flex justify-content-center">
                                <i :class="[stat.icon, stat.color, 'text-4xl']"></i>
                            </div>
                        </template>
                        <template #content>
                            <h3 class="text-xl font-semibold mb-2">{{ stat.title }}</h3>
                            <p v-if="stat.value === 0 || stat.value === '-'" class="text-500">
                                {{ stat.empty }}
                            </p>
                            <p v-else class="text-2xl font-bold">{{ stat.value }}</p>
                        </template>
                    </pv-card>
                </div>
            </div>

            <!-- Próximos Eventos y Actividad Reciente -->
            <div class="grid mt-4">
                <div class="col-12 lg:col-8">
                    <pv-card>
                        <template #title>
                            <div class="flex align-items-center">
                                <i class="pi pi-calendar mr-2"></i>
                                <span>{{ $t('dashboard.sections.upcomingEvents.title') }}</span>
                            </div>
                        </template>
                        <template #content>
                            <div v-if="isLoading" class="flex justify-content-center">
                                <pv-progress-spinner />
                            </div>
                            <p v-else-if="upcomingEvents.length === 0" class="text-center text-500">
                                {{ $t('dashboard.sections.upcomingEvents.empty') }}
                            </p>
                            <div v-else class="upcoming-events">
                                <div v-for="event in upcomingEvents" :key="event.id" 
                                     class="event-item p-3 mb-3 border-round surface-100">
                                    <div class="flex align-items-center justify-content-between">
                                        <div class="flex align-items-center">
                                            <img :src="event.imageUrl" :alt="event.name" 
                                                 class="event-thumbnail mr-3" />
                                            <div>
                                                <h3 class="text-xl font-semibold mb-2">{{ event.name }}</h3>
                                                <div class="flex align-items-center text-600 mb-2">
                                                    <i class="pi pi-calendar mr-2"></i>
                                                    <span>{{ formatDate(event.date) }}</span>
                                                    <i class="pi pi-clock ml-3 mr-2"></i>
                                                    <span>{{ event.time }}</span>
                                                </div>
                                                <div class="flex align-items-center text-600">
                                                    <i class="pi pi-map-marker mr-2"></i>
                                                    <span>{{ event.location }}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="flex flex-column align-items-end">
                                            <pv-tag :value="$t(`eventApplications.status.${event.status}`)"
                                                   :severity="getStatusSeverity(event.status)"
                                                   class="mb-2" />
                                            <pv-button 
                                                icon="pi pi-eye" 
                                                @click="viewEventDetail(event.id)"
                                                text
                                                :label="$t('eventApplications.viewApplication')"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </template>
                    </pv-card>
                </div>

                <div class="col-12 lg:col-4">
                    <pv-card>
                        <template #title>
                            <div class="flex align-items-center">
                                <i class="pi pi-money-bill mr-2"></i>
                                <span>{{ $t('dashboard.stats.pendingPayments.title') }}</span>
                            </div>
                        </template>
                        <template #content>
                            <div v-if="isLoading" class="flex justify-content-center">
                                <pv-progress-spinner />
                            </div>
                            <p v-else-if="pendingPayments.length === 0" class="text-center text-500">
                                {{ $t('dashboard.stats.pendingPayments.empty') }}
                            </p>
                            <div v-else class="pending-payments">
                                <div v-for="payment in pendingPayments" :key="payment.id" 
                                     class="payment-item p-3 mb-2 border-round surface-100">
                                    <div class="flex align-items-center justify-content-between">
                                        <div>
                                            <h4 class="text-lg font-semibold mb-2">{{ payment.eventName }}</h4>
                                            <p class="text-xl font-bold text-primary">{{ formatCurrency(payment.amount) }}</p>
                                            <div class="flex align-items-center text-600 mt-2">
                                                <i class="pi pi-calendar mr-2"></i>
                                                <span>{{ formatDate(payment.createdAt) }}</span>
                                            </div>
                                        </div>
                                        <div class="flex flex-column align-items-end">
                                            <pv-tag :value="$t(`payments.status.${payment.status.toLowerCase()}`)"
                                                   :severity="getStatusSeverity(payment.status.toLowerCase())"
                                                   class="mb-2" />
                                        </div>
                                    </div>
                                </div>
                                <div class="flex justify-content-end mt-3">
                                    <pv-button 
                                        icon="pi pi-external-link" 
                                        @click="navigateToPayments"
                                        text
                                        :label="$t('dashboard.viewAll')"
                                    />
                                </div>
                            </div>
                        </template>
                    </pv-card>

                    <pv-card class="mt-4">
                        <template #title>
                            <div class="flex align-items-center">
                                <i class="pi pi-bell mr-2"></i>
                                <span>{{ $t('dashboard.sections.recentActivity.title') }}</span>
                            </div>
                        </template>
                        <template #content>
                            <p class="text-center text-500">{{ $t('dashboard.sections.recentActivity.empty') }}</p>
                        </template>
                    </pv-card>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.dashboard-container {
    min-height: 100vh;
    background-color: var(--surface-ground);
}

.welcome-section {
    background-color: var(--surface-0);
    border-bottom: 1px solid var(--surface-200);
}

.dashboard-content {
    max-width: 1200px;
    margin: 0 auto;
}

.dashboard-card {
    height: 100%;
    text-align: center;
}

.dashboard-card :deep(.p-card-header) {
    padding-top: 1.5rem;
    padding-bottom: 0.5rem;
}

:deep(.p-card) {
    background-color: var(--surface-0);
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.event-item, .payment-item {
    transition: all 0.2s;
}

.event-item:hover, .payment-item:hover {
    background-color: var(--surface-200);
}

.event-thumbnail {
    width: 80px;
    height: 80px;
    object-fit: cover;
    border-radius: 8px;
}

:deep(.p-tag) {
    font-size: 0.875rem;
    padding: 0.3rem 0.75rem;
}

.payment-item {
    cursor: pointer;
}
</style> 