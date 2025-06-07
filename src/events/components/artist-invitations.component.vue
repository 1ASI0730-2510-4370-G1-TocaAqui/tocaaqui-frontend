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
const showInvitationDialog = ref(false);
const processing = ref(false);

const pendingInvitations = computed(() => 
  invitations.value.filter(inv => inv.status === 'pending')
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
  showInvitationDialog.value = true;
};

const acceptInvitation = async () => {
  if (!selectedInvitation.value) return;
  
  try {
    processing.value = true;
    
    // Aceptar la invitación
    await invitationService.acceptInvitation(selectedInvitation.value.id);
    
    // Crear una postulación automática con estado 'contract_pending' (listo para firmar contrato)
    await eventApplicationService.applyToEvent(
      selectedInvitation.value.eventId, 
      user.value.id,
      'contract_pending' // Estado inicial como listo para contrato por invitación
    );
    
    toast.add({
      severity: 'success',
      summary: t('common.success'),
      detail: 'Invitación aceptada exitosamente',
      life: 3000
    });
    
    showInvitationDialog.value = false;
    await fetchInvitations();
  } catch (error) {
    console.error('Error accepting invitation:', error);
    toast.add({
      severity: 'error',
      summary: t('common.error'),
      detail: error.message || 'Error al aceptar la invitación',
      life: 3000
    });
  } finally {
    processing.value = false;
  }
};

const rejectInvitation = async () => {
  if (!selectedInvitation.value) return;
  
  try {
    processing.value = true;
    await invitationService.rejectInvitation(selectedInvitation.value.id);
    
    toast.add({
      severity: 'info',
      summary: t('common.success'),
      detail: 'Invitación rechazada',
      life: 3000
    });
    
    showInvitationDialog.value = false;
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
                    @click="acceptInvitation"
                    class="flex-1"
                    severity="success"
                    :disabled="processing"
                  />
                  <pv-button 
                    :label="$t('invitations.reject')" 
                    icon="pi pi-times" 
                    @click="rejectInvitation"
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

    <!-- Diálogo de detalles de la invitación -->
    <pv-dialog 
      v-model:visible="showInvitationDialog"
      :modal="true"
      :style="{ width: '50rem' }"
      :header="selectedInvitation?.eventName"
    >
      <div v-if="selectedInvitation" class="grid">
        <div class="col-12">
          <img 
            :src="selectedInvitation.eventImageUrl || 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14'" 
            :alt="selectedInvitation.eventName"
            class="w-full h-15rem mb-4 border-round"
            style="object-fit: cover;"
          />
        </div>
        
        <div class="col-12">
          <h3>{{ $t('invitations.eventDetails') }}</h3>
          <div class="flex flex-column gap-3">
            <div class="flex align-items-center">
              <i class="pi pi-calendar mr-2"></i>
              <span class="font-semibold">{{ $t('applicationDetail.eventDate') }}:</span>
              <span class="ml-2">{{ formatDate(selectedInvitation.eventDate) }}</span>
            </div>
            <div class="flex align-items-center">
              <i class="pi pi-map-marker mr-2"></i>
              <span class="font-semibold">{{ $t('applicationDetail.location') }}:</span>
              <span class="ml-2">{{ selectedInvitation.eventLocation }}</span>
            </div>
            <div class="flex align-items-center">
              <i class="pi pi-user mr-2"></i>
              <span class="font-semibold">{{ $t('invitations.promoter') }}:</span>
              <span class="ml-2">{{ selectedInvitation.promoterName }}</span>
            </div>
            <div v-if="selectedInvitation.message">
              <div class="flex align-items-start">
                <i class="pi pi-envelope mr-2 mt-1"></i>
                <div>
                  <span class="font-semibold">{{ $t('invitations.message') }}:</span>
                  <p class="mt-2 line-height-3">{{ selectedInvitation.message }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <template #footer>
        <div class="flex justify-content-end gap-2">
          <pv-button 
            :label="$t('common.close')" 
            icon="pi pi-times" 
            @click="showInvitationDialog = false" 
            outlined 
          />
          <pv-button 
            :label="$t('invitations.reject')" 
            icon="pi pi-times" 
            @click="rejectInvitation"
            severity="danger"
            outlined
            :disabled="processing"
          />
          <pv-button 
            :label="$t('invitations.accept')" 
            icon="pi pi-check" 
            @click="acceptInvitation"
            severity="success"
            :disabled="processing"
          />
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
</style> 