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
      <pv-card>
        <template #header>
          <div class="flex align-items-start justify-content-between mb-3">
            <div>
              <h1 class="text-2xl font-bold mb-2">{{ application.eventName }}</h1>
              <div class="flex align-items-center">
                <i class="pi pi-calendar mr-2"></i>
                <span class="text-600">{{ formatDate(application.eventDate) }}</span>
              </div>
            </div>
            <pv-tag
              :value="$t(`applicationDetail.status.${application.status}`)"
              :severity="getStatusSeverity(application.status)"
              size="large"
            />
          </div>
        </template>

        <template #content>
          <div class="grid">
            <div class="col-12 md:col-6">
              <pv-panel header="Detalles del Evento" class="h-full">
                <div class="flex flex-column gap-3">
                  <div class="flex align-items-center">
                    <i class="pi pi-calendar-plus mr-2"></i>
                    <span class="font-medium">Fecha de Publicación:</span>
                    <span class="ml-2">{{ formatDate(application.publishDate) }}</span>
                  </div>
                  <div class="flex align-items-center">
                    <i class="pi pi-calendar mr-2"></i>
                    <span class="font-medium">Fecha del Evento:</span>
                    <span class="ml-2">{{ formatDate(application.eventDate) }}</span>
                  </div>
                  <div class="flex align-items-center">
                    <i class="pi pi-clock mr-2"></i>
                    <span class="font-medium">Hora del Evento:</span>
                    <span class="ml-2">{{ formatTime(application.eventTime) }}</span>
                  </div>
                  <div class="flex align-items-center">
                    <i class="pi pi-map-marker mr-2"></i>
                    <span class="font-medium">Localización:</span>
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
                    <span class="font-medium">Fecha Prueba de Sonido:</span>
                    <span class="ml-2">{{ formatDate(application.soundcheckDate) }}</span>
                  </div>
                  <div class="flex align-items-center">
                    <i class="pi pi-clock mr-2"></i>
                    <span class="font-medium">Hora Prueba de Sonido:</span>
                    <span class="ml-2">{{ formatTime(application.soundcheckTime) }}</span>
                  </div>
                  <div class="flex align-items-center">
                    <i class="pi pi-users mr-2"></i>
                    <span class="font-medium">Capacidad del Local:</span>
                    <span class="ml-2">{{ application.capacity }} personas</span>
                  </div>
                  <div class="flex align-items-center">
                    <i class="pi pi-ticket mr-2"></i>
                    <span class="font-medium">Entradas Disponibles:</span>
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
          chooseLabel="Seleccionar Rider"
          uploadLabel="Subir"
          cancelLabel="Cancelar"
          :customUpload="true"
        >
          <template #empty>
            <p>Arrastra y suelta el archivo PDF aquí o haz clic para seleccionarlo.</p>
          </template>
        </pv-file-upload>
        
        <small class="block mt-2 text-600">
          * El archivo debe estar en formato PDF y no debe exceder los 5MB
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

<script>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import axios from 'axios';

export default {
  name: 'EventApplicationDetail',
  setup() {
    const route = useRoute();
    const router = useRouter();
    const { t } = useI18n();

    const application = ref(null);
    const loading = ref(true);
    const error = ref(null);
    const updating = ref(false);
    const showContractDialog = ref(false);
    const showRiderDialog = ref(false);
    const artistSignature = ref('');
    const hasSignedContract = ref(false);
    const hasUploadedRider = ref(false);
    const contractText = ref(`CONTRATO DE PRESENTACIÓN ARTÍSTICA

Este contrato se celebra entre [Nombre del Venue] y el artista, en adelante denominado "el Artista".

1. OBJETO DEL CONTRATO
El Artista se compromete a realizar una presentación musical en vivo en [Nombre del Venue] en la fecha y hora especificadas.

2. FECHA Y HORA
- Fecha del evento: [Fecha]
- Hora de inicio: [Hora]
- Duración de la presentación: [Duración]

3. PRUEBA DE SONIDO
- Fecha: [Fecha]
- Hora: [Hora]

4. REMUNERACIÓN
El Artista recibirá como pago por su presentación la cantidad de [Monto] euros.

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
[Términos de cancelación]

8. OTROS TÉRMINOS
[Términos adicionales]
`);

    const fetchApplicationDetail = async () => {
      try {
        loading.value = true;
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/applications/${route.params.id}`
        );
        application.value = response.data;
      } catch (err) {
        error.value = t('applicationDetail.errorLoading');
        console.error('Error fetching application details:', err);
      } finally {
        loading.value = false;
      }
    };

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };

    const formatTime = (time) => {
      return new Date(`2000-01-01T${time}`).toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      });
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
        await axios.post(`${import.meta.env.VITE_API_BASE_URL}/applications/${route.params.id}/sign`, {
          signature: artistSignature.value
        });
        hasSignedContract.value = true;
        showContractDialog.value = false;
      } catch (error) {
        console.error('Error al firmar el contrato:', error);
      }
    };

    const onRiderUpload = async (event) => {
      try {
        const formData = new FormData();
        formData.append('rider', event.files[0]);
        
        await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/applications/${route.params.id}/rider`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        
        hasUploadedRider.value = true;
        showRiderDialog.value = false;
      } catch (error) {
        console.error('Error al subir el rider técnico:', error);
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
      formatDate,
      formatTime,
      formatCurrency,
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

<style scoped>
.application-detail-container {
  padding: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
}

:deep(.p-panel) {
  height: 100%;
}

:deep(.p-panel-content) {
  height: calc(100% - 4rem);
}

:deep(.p-toolbar) {
  padding: 1rem;
  border-radius: var(--border-radius);
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