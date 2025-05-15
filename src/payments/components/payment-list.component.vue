<script>
import { PaymentService } from '../services/payment.service';
import { PaymentStatus } from '../model/payment.model';
import TrackingSteps from '../../components/tracking-steps.component.vue';

export default {
    name: 'PaymentList',
    components: {
        'tracking-steps': TrackingSteps
    },
    props: {
        userId: {
            type: Number,
            required: true
        }
    },
    data() {
        return {
            payments: [],
            loading: false,
            paymentService: new PaymentService(),
            dialogVisible: false,
            selectedPayment: null
        };
    },
    computed: {
        isCancelled() {
            return this.selectedPayment?.status === PaymentStatus.CANCELLED;
        }
    },
    watch: {
        userId: {
            immediate: true,
            handler(newValue) {
                if (newValue) {
                    this.loadPayments();
                }
            }
        }
    },
    methods: {
        async loadPayments() {
            if (!this.userId) return;
            
            this.loading = true;
            try {
                this.payments = await this.paymentService.getPaymentsByUser(this.userId);
            } catch (error) {
                console.error('Error cargando pagos:', error);
                this.$toast.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: error.message,
                    life: 3000
                });
            } finally {
                this.loading = false;
            }
        },
        formatCurrency(value) {
            return new Intl.NumberFormat('es-PE', {
                style: 'currency',
                currency: 'PEN'
            }).format(value);
        },
        formatDate(date) {
            return new Intl.DateTimeFormat('es-PE', {
                dateStyle: 'medium',
                timeStyle: 'short'
            }).format(new Date(date));
        },
        getStatusSeverity(status) {
            const severities = {
                [PaymentStatus.PENDING]: 'warning',
                [PaymentStatus.HELD]: 'info',
                [PaymentStatus.COMPLETED]: 'success',
                [PaymentStatus.CANCELLED]: 'danger'
            };
            return severities[status] || 'info';
        },
        translateStatus(status) {
            return this.$t(`payments.status.${status.toLowerCase()}`);
        },
        getCurrentStep() {
            if (!this.selectedPayment) return 0;
            
            switch (this.selectedPayment.status) {
                case PaymentStatus.PENDING:
                    return 0;
                case PaymentStatus.HELD:
                    return 1;
                case PaymentStatus.COMPLETED:
                    return 2;
                case PaymentStatus.CANCELLED:
                    return 2;
                default:
                    return 0;
            }
        },
        getStepClass(index) {
            if (!this.selectedPayment) return {};
            
            const currentStep = this.getCurrentStep();
            const isCancelled = this.selectedPayment.status === PaymentStatus.CANCELLED;
            
            return {
                'completed': index <= currentStep && !isCancelled,
                'current': index === currentStep && !isCancelled,
                'cancelled': isCancelled && index === currentStep
            };
        },
        showDetails(payment) {
            this.selectedPayment = payment;
            this.dialogVisible = true;
        },
        getProgressValue(status) {
            const progressValues = {
                [PaymentStatus.PENDING]: 25,
                [PaymentStatus.HELD]: 50,
                [PaymentStatus.COMPLETED]: 100,
                [PaymentStatus.CANCELLED]: 0
            };
            return progressValues[status] || 0;
        },
        translatePaymentMethod(method) {
            return this.$t(`payments.paymentMethods.${method}`);
        },
        translateAccountType(type) {
            const types = {
                'savings': 'Cuenta de Ahorros',
                'checking': 'Cuenta Corriente'
            };
            return types[type] || type;
        }
    }
};
</script>

<template>
    <div class="payment-list">
        <pv-data-table :value="payments"
                      :loading="loading"
                      :paginator="true"
                      :rows="10"
                      stripedRows>
            <template #empty>
                <div class="text-center p-4">{{ $t('payments.noPayments') }}</div>
            </template>
            
            <template #loading>
                <div class="text-center p-4">
                    <i class="pi pi-spin pi-spinner" style="font-size: 2rem"></i>
                    <p>{{ $t('payments.loading') }}</p>
                </div>
            </template>

            <pv-column field="id" :header="$t('payments.columns.id')"></pv-column>
            
            <pv-column field="eventName" :header="$t('payments.columns.event')"></pv-column>
            
            <pv-column field="amount" :header="$t('payments.columns.amount')">
                <template #body="slotProps">
                    {{ formatCurrency(slotProps.data.amount) }}
                </template>
            </pv-column>
            
            <pv-column field="status" :header="$t('payments.columns.status')">
                <template #body="slotProps">
                    <pv-tag :value="translateStatus(slotProps.data.status)"
                           :severity="getStatusSeverity(slotProps.data.status)" />
                </template>
            </pv-column>
            
            <pv-column field="createdAt" :header="$t('payments.columns.date')">
                <template #body="slotProps">
                    {{ formatDate(slotProps.data.createdAt) }}
                </template>
            </pv-column>

            <pv-column :header="$t('payments.actions.title')">
                <template #body="slotProps">
                    <pv-button icon="pi pi-eye" 
                              :aria-label="$t('payments.actions.viewDetails')"
                              class="p-button-rounded p-button-text"
                              @click="showDetails(slotProps.data)" />
                </template>
            </pv-column>
        </pv-data-table>

        <!-- Diálogo de detalles -->
        <pv-dialog v-model:visible="dialogVisible" 
                   :header="$t('payments.details.title')"
                   :modal="true"
                   :style="{ width: '50vw' }">
            <div v-if="selectedPayment" class="payment-details">
                <tracking-steps 
                    :current-step="getCurrentStep()" 
                    :steps="[
                        { label: $t('payments.tracking.pending'), icon: 'pi pi-clock' },
                        { label: $t('payments.tracking.held'), icon: 'pi pi-lock' },
                        { label: $t('payments.tracking.completed'), icon: 'pi pi-check-circle' }
                    ]"
                    :is-cancelled="isCancelled"
                    class="mb-4" 
                />
                
                <div class="grid">
                    <div class="col-12">
                        <h3 class="text-primary">{{ $t('payments.details.eventInfo') }}</h3>
                        <p><strong>{{ $t('payments.details.name') }}:</strong> {{ selectedPayment.eventName }}</p>
                        <p><strong>{{ $t('payments.details.musician') }}:</strong> {{ selectedPayment.musicoName }}</p>
                        <p><strong>{{ $t('payments.details.promoter') }}:</strong> {{ selectedPayment.promotorName }}</p>
                    </div>
                    
                    <div class="col-12">
                        <h3 class="text-primary">{{ $t('payments.details.paymentInfo') }}</h3>
                        <p><strong>{{ $t('payments.details.amount') }}:</strong> {{ formatCurrency(selectedPayment.amount) }}</p>
                        <p><strong>{{ $t('payments.details.paymentMethod') }}:</strong> {{ translatePaymentMethod(selectedPayment.paymentMethod) }}</p>
                        <p><strong>{{ $t('payments.details.description') }}:</strong> {{ selectedPayment.description }}</p>
                        <template v-if="selectedPayment.bankInfo">
                            <p><strong>{{ $t('payments.details.bank') }}:</strong> {{ selectedPayment.bankInfo.bankName }}</p>
                            <p><strong>{{ $t('payments.details.accountNumber') }}:</strong> {{ selectedPayment.bankInfo.accountNumber }}</p>
                        </template>
                        <p><strong>{{ $t('payments.details.createdAt') }}:</strong> {{ formatDate(selectedPayment.createdAt) }}</p>
                        <p><strong>{{ $t('payments.details.updatedAt') }}:</strong> {{ formatDate(selectedPayment.updatedAt) }}</p>
                    </div>
                </div>
            </div>
        </pv-dialog>
    </div>
</template>

<style scoped>
.payment-list {
    width: 100%;
    padding: 1rem;
}

.payment-details {
    padding: 1rem;
}

.payment-details h3 {
    color: var(--primary-color);
    margin-bottom: 1rem;
}

.payment-details p {
    margin: 0.5rem 0;
}

:deep(.p-progressbar) {
    height: 0.8rem;
}

:deep(.p-progressbar.warning) .p-progressbar-value {
    background: var(--yellow-500);
}

:deep(.p-progressbar.info) .p-progressbar-value {
    background: var(--blue-500);
}

:deep(.p-progressbar.success) .p-progressbar-value {
    background: var(--green-500);
}

:deep(.p-progressbar.danger) .p-progressbar-value {
    background: var(--red-500);
}
</style> 