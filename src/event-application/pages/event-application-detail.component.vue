<script>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { EventApplicationService } from '../services/event-application.service';

export default {
  name: 'EventApplicationDetail',
  setup() {
    const route = useRoute();
    const router = useRouter();
    const { t, locale } = useI18n();
    const eventApplicationService = new EventApplicationService();

    const application = ref(null);
    const loading = ref(true);
    const error = ref(null);
    const updating = ref(false);
    const showContractDialog = ref(false);
    const showRiderDialog = ref(false);
    const artistSignature = ref('');
    const hasSignedContract = ref(false);
    const hasUploadedRider = ref(false);

    const formatDate = (date) => {
      if (!date) return '';
      return new Date(date).toLocaleDateString(locale.value, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };

    const formatTime = (time) => {
      if (!time) return '';
      return new Date(`2000-01-01T${time}`).toLocaleTimeString(locale.value, {
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    const formattedData = computed(() => {
      if (!application.value) return {};
      return {
        date: formatDate(application.value.date),
        time: formatTime(application.value.time),
        publishDate: formatDate(application.value.publishDate),
        soundcheckDate: formatDate(application.value.soundcheckDate),
        soundcheckTime: formatTime(application.value.soundcheckTime)
      };
    });

    const generateContract = (event) => {
      return `CONTRATO DE PRESENTACIÓN ARTÍSTICA

Este contrato se celebra entre ${event.location} y el artista, en adelante denominado "el Artista".

1. OBJETO DEL CONTRATO
El Artista se compromete a realizar una presentación musical en vivo en ${event.location} en la fecha y hora especificadas.

2. FECHA Y HORA
- Fecha del evento: ${formattedData.value.date}
- Hora de inicio: ${formattedData.value.time}
- Duración de la presentación: 2 horas

3. PRUEBA DE SONIDO
- Fecha: ${formattedData.value.soundcheckDate}
- Hora: ${formattedData.value.soundcheckTime}

4. REMUNERACIÓN
El Artista recibirá como pago por su presentación la cantidad acordada según el tipo de evento.

5. OBLIGACIONES DEL VENUE
- Proporcionar equipo de sonido profesional
- Garantizar la seguridad del Artista
- Proporcionar camerino
- Cumplir con los requerimientos técnicos

6. OBLIGACIONES DEL ARTISTA
- Llegar puntualmente
- Realizar la presentación acordada
- Cumplir con el repertorio
- Mantener conducta profesional

7. CANCELACIÓN
La cancelación del evento por cualquiera de las partes deberá ser notificada con al menos 48 horas de anticipación.

8. OTROS TÉRMINOS
Cualquier modificación a este contrato deberá ser acordada por escrito entre ambas partes.`;
    };

    const contractText = ref('');

    const fetchApplicationDetail = async () => {
      try {
        loading.value = true;
        const response = await eventApplicationService.getById(route.params.id);
        application.value = response;
        contractText.value = generateContract(response);
      } catch (err) {
        error.value = t('applicationDetail.errorLoading');
        console.error('Error fetching application details:', err);
      } finally {
        loading.value = false;
      }
    };

    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR'
      }).format(amount);
    };

    const getStatusSeverity = (status) => {
      const severities = {
        pending: 'warning',
        accepted: 'success',
        rejected: 'danger'
      };
      return severities[status] || 'info';
    };

    const signContract = async () => {
      try {
        updating.value = true;
        const result = await eventApplicationService.signContract(route.params.id, artistSignature.value);
        application.value = result.event;
        hasSignedContract.value = true;
        showContractDialog.value = false;
      } catch (error) {
        console.error('Error al firmar el contrato:', error);
      } finally {
        updating.value = false;
      }
    };

    const onRiderUpload = async (event) => {
      try {
        updating.value = true;
        await eventApplicationService.uploadRider(route.params.id, event.files[0]);
        hasUploadedRider.value = true;
        showRiderDialog.value = false;
      } catch (error) {
        console.error('Error al subir el rider técnico:', error);
      } finally {
        updating.value = false;
      }
    };

    onMounted(() => {
      fetchApplicationDetail();
    });

    return {
      application,
      loading,
      error,
      updating,
      router,
      formattedData,
      getStatusSeverity,
      showContractDialog,
      showRiderDialog,
      artistSignature,
      hasSignedContract,
      hasUploadedRider,
      contractText,
      signContract,
      onRiderUpload
    };
  }
};
</script>

<template>
  <div class="application-detail-container">
    <pv-toolbar class="mb-4 surface-0">
      <template #start>
        <pv-button
          @click="router.push('/applications')"
          icon="pi pi-arrow-left"
          text
          :label="$t('applicationDetail.back')"
        />
      </template>
    </pv-toolbar>

    <div v-if="loading" class="flex justify-content-center">
      <pv-progress-spinner />
    </div>

    <div v-else-if="error" class="text-center">
      <pv-message severity="error" :closable="false">{{ error }}</pv-message>
    </div>

    <div v-else class="application-content">
      <pv-card class="card-container">
        <template #header>
          <div class="event-header flex align-items-start justify-content-between">
            <div class="header-content">
              <h1 class="text-3xl font-bold mb-3">{{ application.name }}</h1>
              <div class="flex align-items-center">
                <i class="pi pi-calendar mr-2 text-lg"></i>
                <span class="text-xl">{{ formattedData.date }}</span>
              </div>
            </div>
            <pv-tag
              :value="$t(`applicationDetail.status.${application.status}`)"
              :severity="getStatusSeverity(application.status)"
              size="large"
              class="ml-4"
            />
          </div>
        </template>

        <template #content>
          <div class="content-container">
            <div class="grid">
              <div class="col-12 md:col-6">
                <pv-panel header="Detalles del Evento" class="h-full">
                  <div class="flex flex-column gap-3">
                    <div class="flex align-items-center">
                      <i class="pi pi-calendar-plus mr-2"></i>
                      <span class="font-medium">{{ $t('applicationDetail.publishDate') }}:</span>
                      <span class="ml-2">{{ formattedData.publishDate }}</span>
                    </div>
                    <div class="flex align-items-center">
                      <i class="pi pi-calendar mr-2"></i>
                      <span class="font-medium">{{ $t('applicationDetail.eventDate') }}:</span>
                      <span class="ml-2">{{ formattedData.date }}</span>
                    </div>
                    <div class="flex align-items-center">
                      <i class="pi pi-clock mr-2"></i>
                      <span class="font-medium">{{ $t('applicationDetail.eventTime') }}:</span>
                      <span class="ml-2">{{ formattedData.time }}</span>
                    </div>
                    <div class="flex align-items-center">
                      <i class="pi pi-map-marker mr-2"></i>
                      <span class="font-medium">{{ $t('applicationDetail.location') }}:</span>
                      <span class="ml-2">{{ application.location }}</span>
                    </div>
                  </div>
                </pv-panel>
              </div>

              <div class="col-12 md:col-6">
                <pv-panel header="Detalles Técnicos" class="h-full">
                  <div class="flex flex-column gap-3">
                    <div class="flex align-items-center">
                      <i class="pi pi-volume-up mr-2"></i>
                      <span class="font-medium">{{ $t('applicationDetail.soundcheckDate') }}:</span>
                      <span class="ml-2">{{ formattedData.soundcheckDate }}</span>
                    </div>
                    <div class="flex align-items-center">
                      <i class="pi pi-clock mr-2"></i>
                      <span class="font-medium">{{ $t('applicationDetail.soundcheckTime') }}:</span>
                      <span class="ml-2">{{ formattedData.soundcheckTime }}</span>
                    </div>
                    <div class="flex align-items-center">
                      <i class="pi pi-users mr-2"></i>
                      <span class="font-medium">{{ $t('applicationDetail.venueCapacity') }}:</span>
                      <span class="ml-2">{{ application.capacity }} personas</span>
                    </div>
                    <div class="flex align-items-center">
                      <i class="pi pi-ticket mr-2"></i>
                      <span class="font-medium">{{ $t('applicationDetail.availableTickets') }}:</span>
                      <span class="ml-2">{{ application.availableTickets }}</span>
                    </div>
                  </div>
                </pv-panel>
              </div>

              <div class="col-12">
                <pv-panel header="Información de Contacto">
                  <div class="flex flex-column gap-3">
                    <div class="flex align-items-center">
                      <i class="pi pi-user mr-2"></i>
                      <span class="font-medium">Administrador:</span>
                      <span class="ml-2">{{ application.adminName }}</span>
                    </div>
                    <div class="flex align-items-center">
                      <i class="pi pi-phone mr-2"></i>
                      <span class="font-medium">Contacto:</span>
                      <span class="ml-2">{{ application.adminContact }}</span>
                    </div>
                  </div>
                </pv-panel>
              </div>
            </div>

            <div class="flex gap-3 justify-content-center mt-4">
              <pv-button
                v-if="!hasSignedContract"
                @click="showContractDialog = true"
                icon="pi pi-file-pdf"
                label="Ver Contrato"
                severity="info"
              />
              <pv-button
                v-if="hasSignedContract && !hasUploadedRider"
                @click="showRiderDialog = true"
                icon="pi pi-upload"
                label="Subir Rider Técnico"
                severity="success"
              />
            </div>
          </div>
        </template>
      </pv-card>
    </div>

    <!-- Diálogo del Contrato -->
    <pv-dialog
      v-model:visible="showContractDialog"
      modal
      header="Contrato del Evento"
      :style="{ width: '80vw' }"
      :closable="false"
    >
      <div class="contract-text">{{ contractText }}</div>
      <template #footer>
        <div class="flex justify-content-end gap-2">
          <pv-button
            label="Rechazar"
            icon="pi pi-times"
            @click="showContractDialog = false"
            text
          />
          <pv-button
            label="Firmar y Aceptar"
            icon="pi pi-check"
            @click="signContract"
            severity="success"
          />
        </div>
      </template>
    </pv-dialog>

    <!-- Diálogo del Rider -->
    <pv-dialog
      v-model:visible="showRiderDialog"
      modal
      header="Subir Rider Técnico"
      :style="{ width: '50vw' }"
      :closable="false"
    >
      <div class="rider-upload p-4">
        <pv-file-upload
          mode="advanced"
          :multiple="false"
          accept="application/pdf"
          :maxFileSize="5000000"
          @upload="onRiderUpload"
          :auto="true"
          :chooseLabel="$t('applicationDetail.rider.chooseLabel')"
          :uploadLabel="$t('applicationDetail.rider.uploadLabel')"
          :cancelLabel="$t('applicationDetail.rider.cancelLabel')"
          :customUpload="true"
        >
          <template #empty>
            <p>{{ $t('applicationDetail.rider.dragDropText') }}</p>
          </template>
        </pv-file-upload>
        
        <small class="block mt-2 text-600">
          {{ $t('applicationDetail.rider.sizeNote') }}
        </small>
      </div>

      <template #footer>
        <pv-button
          label="Cerrar"
          icon="pi pi-times"
          @click="showRiderDialog = false"
          text
        />
      </template>
    </pv-dialog>
  </div>
</template>

<style scoped>
.application-detail-container {
  padding: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
}

.card-container {
  overflow: hidden;
}

.event-header {
  padding: 1.5rem 1.5rem 1rem 1.5rem;
  border-bottom: 1px solid var(--surface-200);
}

.content-container {
  padding: 1.5rem;
}

.header-content {
  padding: 0;
}

.header-content h1 {
  color: var(--surface-900);
  margin-bottom: 0.75rem;
}

.header-content .pi {
  color: var(--primary-color);
}

.header-content span {
  color: var(--surface-600);
}

:deep(.p-card) {
  border-radius: var(--border-radius);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

:deep(.p-card-content) {
  padding: 0;
}

:deep(.p-panel) {
  height: 100%;
}

:deep(.p-panel-content) {
  height: calc(100% - 4rem);
  padding: 1.25rem;
}

:deep(.p-toolbar) {
  padding: 1rem;
  border-radius: var(--border-radius);
  background: transparent;
}

:deep(.p-tag) {
  font-size: 0.875rem;
  padding: 0.4rem 0.8rem;
}

.contract-text {
  font-family: 'Courier New', Courier, monospace;
  white-space: pre-wrap;
  background-color: var(--surface-100);
  padding: 1.5rem;
  border-radius: var(--border-radius);
}

:deep(.p-fileupload) {
  width: 100%;
}
</style> 