// @summary Componente del dashboard del artista
// @author [Tu nombre]

<script>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import Card from 'primevue/card';

export default {
    name: 'ArtistDashboard',
    components: {
        Card
    },
    setup() {
        const router = useRouter();
        const { t } = useI18n();
        const user = ref(null);
        const isLoading = ref(true);

        // Estados computados para mostrar mensajes descriptivos
        const statsConfig = computed(() => ({
            nextEvents: {
                value: 0,
                title: t('dashboard.stats.nextEvents.title'),
                empty: t('dashboard.stats.nextEvents.empty'),
                icon: 'pi pi-calendar',
                color: 'text-primary'
            },
            pendingPayments: {
                value: 0,
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
        });

        return {
            user,
            isLoading,
            statsConfig
        };
    }
};
</script>

<template>
    <div class="dashboard-container">
        <div class="welcome-section p-4">
            <h1 class="text-3xl font-bold mb-4">{{ $t('dashboard.welcome', { name: user?.name || '' }) }}</h1>
        </div>

        <div class="dashboard-content p-4">
            <!-- Estadísticas -->
            <div class="grid">
                <div v-for="(stat, key) in statsConfig" :key="key" class="col-12 md:col-6 lg:col-3">
                    <Card class="dashboard-card">
                        <template #header>
                            <i :class="[stat.icon, stat.color, 'text-4xl']"></i>
                        </template>
                        <template #title>
                            <span class="block text-lg font-semibold">{{ stat.title }}</span>
                        </template>
                        <template #content>
                            <div class="text-center">
                                <span v-if="stat.value > 0" class="text-4xl font-bold block mb-3">{{ stat.value }}</span>
                                <span v-else class="text-sm text-500">{{ stat.empty }}</span>
                            </div>
                        </template>
                    </Card>
                </div>
            </div>

            <!-- Próximos Eventos y Actividad Reciente -->
            <div class="grid mt-4">
                <div class="col-12 lg:col-8">
                    <Card>
                        <template #title>
                            <div class="flex align-items-center">
                                <i class="pi pi-calendar mr-2"></i>
                                <span>{{ $t('dashboard.sections.upcomingEvents.title') }}</span>
                            </div>
                        </template>
                        <template #content>
                            <p class="text-center text-500">{{ $t('dashboard.sections.upcomingEvents.empty') }}</p>
                        </template>
                    </Card>
                </div>

                <div class="col-12 lg:col-4">
                    <Card>
                        <template #title>
                            <div class="flex align-items-center">
                                <i class="pi pi-bell mr-2"></i>
                                <span>{{ $t('dashboard.sections.recentActivity.title') }}</span>
                            </div>
                        </template>
                        <template #content>
                            <p class="text-center text-500">{{ $t('dashboard.sections.recentActivity.empty') }}</p>
                        </template>
                    </Card>
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
</style> 