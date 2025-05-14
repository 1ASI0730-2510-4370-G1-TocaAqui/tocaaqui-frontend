<script setup>
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { TicketService } from '../services/ticket.service.js';

const props = defineProps({
  ticketId: {
    type: [Number, String],
    required: true
  },
  showActions: {
    type: Boolean,
    default: true
  }
});

const { t } = useI18n();
const ticketService = new TicketService();
const ticket = ref(null);
const isLoading = ref(true);
const error = ref(null);

const fetchTicket = async () => {
  try {
    isLoading.value = true;
    ticket.value = await ticketService.getById(props.ticketId);
  } catch (err) {
    error.value = err.message;
    console.error('Error loading ticket:', err);
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchTicket);

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString();
};

// Plataformas para compartir
const sharePlatforms = [
  { id: 'facebook', name: 'Facebook', icon: 'pi pi-facebook' },
  { id: 'instagram', name: 'Instagram', icon: 'pi pi-instagram' },
  { id: 'twitter', name: 'Twitter/X', icon: 'pi pi-twitter' },
  { id: 'whatsapp', name: 'WhatsApp', icon: 'pi pi-whatsapp' }
];

const shareTicket = async (platform) => {
  try {
    await ticketService.shareTicket(props.ticketId, platform);
    await fetchTicket(); // Actualizar datos
  } catch (err) {
    error.value = err.message;
  }
};
</script>

<template>
  <div class="ticket-detail">
    <div v-if="isLoading" class="loading-container">
      <pv-progress-spinner />
      <p>{{ t('common.loading') }}</p>
    </div>

    <div v-else-if="error" class="error-container">
      <p class="error-message">{{ error }}</p>
      <pv-button :label="t('common.retry')" icon="pi pi-refresh" @click="fetchTicket" />
    </div>

    <div v-else-if="ticket" class="ticket-card">
      <div class="ticket-header">
        <h3>{{ t('ticket.creation') }}</h3>
      </div>
      
      <div class="ticket-content">
        <div class="ticket-info">
          <p><strong>{{ t('ticket.event') }}:</strong> {{ ticket.eventName }}</p>
          <p><strong>{{ t('ticket.type') }}:</strong> {{ ticket.type }}</p>
          <p><strong>{{ t('ticket.qrCode') }}:</strong> {{ t('ticket.generated') }}</p>
          <p><strong>{{ t('ticket.code') }}:</strong> {{ ticket.code }}</p>
          <p><strong>{{ t('ticket.validUntil') }}:</strong> {{ formatDate(ticket.validUntil) }}</p>
        </div>
      </div>
      
      <div v-if="showActions" class="ticket-actions">
        <div class="share-section">
          <h4>{{ t('ticket.shareOn') }}</h4>
          <div class="share-buttons">
            <pv-button 
              v-for="platform in sharePlatforms" 
              :key="platform.id"
              :icon="platform.icon" 
              :label="platform.name"
              class="p-button-text" 
              @click="shareTicket(platform.id)" 
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ticket-detail {
  max-width: 600px;
  margin: 0 auto;
}

.ticket-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.ticket-header {
  padding: 1rem;
  background-color: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  text-align: center;
}

.ticket-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.ticket-content {
  padding: 1.5rem;
}

.ticket-info p {
  margin: 0.75rem 0;
  font-size: 1rem;
}

.ticket-actions {
  padding: 1rem;
  border-top: 1px solid #e9ecef;
}

.share-section h4 {
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1rem;
  color: #6c757d;
}

.share-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.loading-container, .error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
}

.error-message {
  color: #e74c3c;
  margin-bottom: 1rem;
}

@media (max-width: 768px) {
  .share-buttons {
    flex-direction: column;
  }
  
  .share-buttons .p-button {
    width: 100%;
  }
}
</style>