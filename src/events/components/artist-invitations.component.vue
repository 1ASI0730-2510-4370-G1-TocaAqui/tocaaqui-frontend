<script setup>
import { ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import { InvitationService } from '../services/invitation.service';
import { EventApplicationService } from '../services/event-application.service';

const { t } = useI18n();
const toast = useToast();
const invitationService = new InvitationService();
const eventApplicationService = new EventApplicationService();

const invitations = ref([]);
const loading = ref(true);
const error = ref(null);
const user = ref(JSON.parse(localStorage.getItem('user')));
const selectedInvitation = ref(null);
const showContractDialog = ref(false);
const processing = ref(false);
const contractText = ref('');

const generateContract = (invitation) => {
  const eventDate = new Date(invitation.eventDate);
  const formattedDate = eventDate.toLocaleDateString('es-ES', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  const formattedTime = eventDate.toLocaleTimeString('es-ES', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  return `CONTRATO DE PRESENTACIÓN ARTÍSTICA

Este contrato se celebra entre ${invitation.eventLocation} y el artista, en adelante denominado "el Artista".

1. OBJETO DEL CONTRATO
El Artista se compromete a realizar una presentación musical en vivo en ${invitation.eventLocation} en la fecha y hora especificadas.

2. FECHA Y HORA
- Fecha del evento: ${formattedDate}
- Hora de inicio: ${formattedTime}
- Duración de la presentación: 2 horas

3. PRUEBA DE SONIDO
- Fecha: miércoles, 9 de julio de 2025
- Hora: 22:24

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

const pendingInvitations = computed(() => 
  invitations.value.filter(inv => inv.status === 'Pending' || inv.status === 'pending')
);

const acceptedInvitations = computed(() => 
  invitations.value.filter(inv => inv.status === 'Accepted' || inv.status === 'accepted')
);

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('es-ES', options);
};

const fetchInvitations = async () => {
  try {
    loading.value = true;
    if (user.value?.id) {
      invitations.value = await invitationService.getInvitationsByArtist(user.value.id);
    }
  } catch (err) {
    error.value = err.message || 'Error al cargar las invitaciones';
    console.error('Error loading invitations:', err);
  } finally {
    loading.value = false;
  }
};

const viewInvitation = (invitation) => {
  selectedInvitation.value = invitation;
  contractText.value = generateContract(invitation);
  showContractDialog.value = true;
};

const acceptInvitation = async (invitation) => {
  if (!invitation) return;
  
  try {
    processing.value = true;
    
    // Solo aceptar la invitación
    await invitationService.acceptInvitation(invitation.id);
    
    // Crear una postulación automática con estado 'ContractPending'
    await eventApplicationService.applyToEvent(
      invitation.eventId, 
      user.value.id,
      'ContractPending'
    );
    
    // Mostrar el contrato para que el usuario lo revise
    selectedInvitation.value = invitation;
    showContractDialog.value = true;
    
  } catch (error) {
    console.error('Error accepting invitation:', error);
    toast.add({
      severity: 'error',
      summary: t('common.error'),
      detail: error.message || 'Error al procesar la invitación',
      life: 3000
    });
  } finally {
    processing.value = false;
  }
};

const rejectInvitation = async (invitation) => {
  if (!invitation) return;
  
  try {
    processing.value = true;
    await invitationService.rejectInvitation(invitation.id);
    
    toast.add({
      severity: 'info',
      summary: t('common.success'),
      detail: 'Invitación rechazada',
      life: 3000
    });
    
    await fetchInvitations();
  } catch (error) {
    console.error('Error rejecting invitation:', error);
    toast.add({
      severity: 'error',
      summary: t('common.error'),
      detail: error.message || 'Error al rechazar la invitación',
      life: 3000
    });
  } finally {
    processing.value = false;
  }
};

const signContract = async () => {
  if (!selectedInvitation.value) return;
  try {
    processing.value = true;
    // 1. Verificar si ya existe una postulación firmada para este evento
    const applicants = await eventApplicationService.getEventApplicants(selectedInvitation.value.eventId);
    const alreadySigned = applicants.find(app => app.status === 'Signed' || app.status === 'signed');
    if (alreadySigned) {
      // Eliminar la invitación del usuario actual
      await invitationService.rejectInvitation(selectedInvitation.value.id);
      toast.add({
        severity: 'warn',
        summary: t('common.warning'),
        detail: 'Ya existe un artista con contrato firmado para este evento. Tu invitación ha sido eliminada.',
        life: 4000
      });
      showContractDialog.value = false;
      await fetchInvitations();
      return;
    }
    // 2. Crear postulación y firmar contrato
    await eventApplicationService.applyToEvent(
      selectedInvitation.value.eventId,
      user.value.id,
      'ContractPending'
    );
    await eventApplicationService.signContract(
      selectedInvitation.value.eventId,
      user.value.id,
      'signed_digitally'
    );
    // 3. Marcar la invitación como aceptada
    await invitationService.acceptInvitation(selectedInvitation.value.id);
    // 4. Eliminar invitaciones de otros usuarios para este evento
    const allInvitations = await invitationService.getInvitationsByEvent(selectedInvitation.value.eventId);
    const others = allInvitations.filter(inv => inv.id !== selectedInvitation.value.id);
    await Promise.all(others.map(inv => invitationService.rejectInvitation(inv.id)));
    toast.add({
      severity: 'success',
      summary: t('common.success'),
      detail: 'Contrato firmado exitosamente',
      life: 3000
    });
    showContractDialog.value = false;
    await fetchInvitations();
  } catch (error) {
    console.error('Error signing contract:', error);
    toast.add({
      severity: 'error',
      summary: t('common.error'),
      detail: error.message || 'Error al firmar el contrato',
      life: 3000
    });
  } finally {
    processing.value = false;
  }
};

const rejectContract = async () => {
  if (!selectedInvitation.value) return;
  
  try {
    processing.value = true;
    
    // Rechazar el contrato
    await eventApplicationService.rejectContract(
      selectedInvitation.value.eventId,
      user.value.id
    );
    
    toast.add({
      severity: 'info',
      summary: t('common.success'),
      detail: 'Contrato rechazado',
      life: 3000
    });
    
    showContractDialog.value = false;
    await fetchInvitations();
  } catch (error) {
    console.error('Error rejecting contract:', error);
    toast.add({
      severity: 'error',
      summary: t('common.error'),
      detail: error.message || 'Error al rechazar el contrato',
      life: 3000
    });
  } finally {
    processing.value = false;
  }
};

onMounted(fetchInvitations);
</script>

<template>
  <div class="invitations-container">
    <h2 class="text-2xl font-bold mb-4">{{ $t('invitations.title') }}</h2>

    <div v-if="loading" class="flex justify-content-center">
      <pv-progress-spinner />
    </div>

    <div v-else-if="error" class="text-center">
      <pv-message severity="error" :closable="false">
        {{ error }}
      </pv-message>
    </div>

    <div v-else>
      <div v-if="pendingInvitations.length === 0" class="text-center p-4">
        <i class="pi pi-envelope text-4xl text-500 mb-3"></i>
        <h3 class="text-xl mb-2">{{ $t('invitations.noInvitations') }}</h3>
        <p class="text-500">{{ $t('invitations.noInvitationsDescription') }}</p>
      </div>

      <div v-else class="grid">
        <div v-for="invitation in pendingInvitations" :key="invitation.id" class="col-12 md:col-6 lg:col-4">
          <pv-card class="h-full invitation-card">
            <template #header>
              <div class="relative">
                <img 
                  :src="invitation.eventImageUrl || 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14'" 
                  :alt="invitation.eventName"
                  class="w-full h-12rem invitation-image"
                />
                <pv-tag 
                  :severity="invitation.status === 'pending' ? 'warning' : 'info'" 
                  class="absolute top-0 right-0 m-2"
                  :value="$t(`invitations.status.${invitation.status}`)"
                />
              </div>
            </template>
            <template #title>
              <div class="text-xl font-bold">{{ invitation.eventName }}</div>
            </template>
            <template #subtitle>
              <div class="flex align-items-center text-600 mb-2">
                <i class="pi pi-calendar mr-2"></i>
                <span>{{ formatDate(invitation.eventDate) }}</span>
              </div>
              <div class="flex align-items-center text-600 mb-2">
                <i class="pi pi-map-marker mr-2"></i>
                <span>{{ invitation.eventLocation }}</span>
              </div>
            </template>
            <template #content>
              <div class="mb-3">
                <span class="font-semibold">{{ $t('invitations.message') }}:</span>
                <p class="mt-2 text-600">{{ invitation.message || 'Sin mensaje' }}</p>
              </div>
            </template>
            <template #footer>
              <div class="flex flex-column gap-2">
                <pv-button 
                  :label="$t('invitations.viewInfo')" 
                  icon="pi pi-info" 
                  @click="viewInvitation(invitation)"
                  class="w-full"
                  outlined
                />
                <div class="flex gap-2">
                  <pv-button 
                    :label="$t('invitations.accept')" 
                    icon="pi pi-check" 
                    @click="viewInvitation(invitation)"
                    class="flex-1"
                    severity="success"
                    :disabled="processing"
                  />
                  <pv-button 
                    :label="$t('invitations.reject')" 
                    icon="pi pi-times" 
                    @click="rejectInvitation(invitation)"
                    class="flex-1"
                    severity="danger"
                    outlined
                    :disabled="processing"
                  />
                </div>
              </div>
            </template>
          </pv-card>
        </div>
      </div>
    </div>

    <!-- Diálogo del contrato -->
    <pv-dialog 
      v-model:visible="showContractDialog"
      :modal="true"
      :style="{ width: '80vw' }"
      header="Contrato del Evento"
      :closable="true"
    >
      <div class="contract-text">{{ contractText }}</div>
      
      <template #footer>
        <div class="flex justify-content-between">
          <pv-button 
            :label="$t('common.close')" 
            icon="pi pi-arrow-left" 
            @click="showContractDialog = false" 
            outlined 
          />
          <div class="flex gap-2">
            <pv-button 
              :label="$t('contracts.reject')" 
              icon="pi pi-times" 
              @click="rejectContract"
              severity="danger"
              outlined
              :disabled="processing"
            />
            <pv-button 
              :label="$t('contracts.signAndAccept')" 
              icon="pi pi-check" 
              @click="signContract"
              severity="success"
              :disabled="processing"
            />
          </div>
        </div>
      </template>
    </pv-dialog>
  </div>
</template>

<style scoped>
.invitations-container {
  padding: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
}

.invitation-card {
  background: var(--surface-card);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: transform 0.2s, box-shadow 0.2s;
  height: 100%;
  overflow: hidden;
}

.invitation-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 16px rgba(0,0,0,0.1);
}

.invitation-image {
  object-fit: cover;
  object-position: center;
  transition: transform 0.3s ease;
}

.invitation-card:hover .invitation-image {
  transform: scale(1.05);
}

.h-12rem {
  height: 12rem;
}

.h-15rem {
  height: 15rem;
}

.line-height-3 {
  line-height: 1.5;
}

.border-round {
  border-radius: 12px;
}

:deep(.p-card-content) {
  padding: 1rem 1.5rem;
}

:deep(.p-card-title) {
  padding: 0 1.5rem;
  margin-bottom: 0;
}

:deep(.p-card-subtitle) {
  padding: 0 1.5rem;
  margin-bottom: 0.5rem;
}

:deep(.p-card-footer) {
  padding: 1rem 1.5rem 1.5rem;
}

.contract-content {
  line-height: 1.6;
}

.contract-content h3 {
  text-align: center;
  margin-bottom: 2rem;
  color: var(--primary-color);
}

.contract-section {
  margin-bottom: 1.5rem;
}

.contract-section h4 {
  color: var(--primary-color);
  margin-bottom: 0.5rem;
}

.contract-section ol {
  padding-left: 1.5rem;
}

.contract-section li {
  margin-bottom: 0.5rem;
}

.contract-footer {
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid var(--surface-border);
  text-align: center;
}

.contract-text {
  white-space: pre-line;
  line-height: 1.6;
  font-family: 'Courier New', monospace;
  background-color: var(--surface-100);
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid var(--surface-300);
}
</style>