<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { TicketService } from '../services/ticket.service.js';
import { Ticket } from '../model/ticket.model.js';

const { t } = useI18n();
const router = useRouter();
const ticketService = new TicketService();

// Estados
const tickets = ref([]);
const events = ref([]);
const isLoading = ref(true);
const error = ref(null);
const showForm = ref(false);
const showStats = ref(false);
const editingTicket = ref(null);
const selectedTicket = ref(null);
const selectedEvent = ref(null);
const currentStats = ref(null);

// Formulario
const ticketForm = ref({
  eventId: null,
  eventName: '',
  type: 'General',
  price: 0,
  validUntil: '',
  status: 'active',
  promoterId: JSON.parse(localStorage.getItem("user"))?.id

});

// Plataformas para compartir
const sharePlatforms = [
  { id: 'facebook', name: 'Facebook', icon: 'pi pi-facebook' },
  { id: 'instagram', name: 'Instagram', icon: 'pi pi-instagram' },
  { id: 'twitter', name: 'Twitter/X', icon: 'pi pi-twitter' },
  { id: 'whatsapp', name: 'WhatsApp', icon: 'pi pi-whatsapp' }
];

// Cargar datos
const fetchTickets = async () => {
  try {
    isLoading.value = true;
    const data = await ticketService.getAll(ticketForm.value.promoterId);
    tickets.value = data;
  } catch (err) {
    error.value = err.message;
    console.error('Error loading tickets:', err);
  } finally {
    isLoading.value = false;
  }
};

const fetchEvents = async () => {
  try {
    const data = await ticketService.getEvents();
    events.value = data;
  } catch (err) {
    console.error('Error loading events:', err);
  }
};

// Observar cambios en el evento seleccionado
watch(() => ticketForm.value.eventId, async (newEventId) => {
  if (newEventId) {
    try {
      const event = events.value.find(e => e.id === newEventId);
      if (event) {
        ticketForm.value.eventName = event.name;
      } else {
        const eventData = await ticketService.getEventById(newEventId);
        ticketForm.value.eventName = eventData.name;
      }
    } catch (err) {
      console.error('Error loading event details:', err);
    }
  }
});

// Cargar datos al montar el componente
onMounted(async () => {
  await Promise.all([fetchTickets(), fetchEvents()]);
});

// Métodos CRUD
const createTicket = async () => {
  try {
    isLoading.value = true;
    await ticketService.create(ticketForm.value);
    resetForm();
    await fetchTickets();
    showForm.value = false;
  } catch (err) {
    error.value = err.message;
  } finally {
    isLoading.value = false;
  }
};

const updateTicket = async () => {
  try {
    isLoading.value = true;
    await ticketService.update(editingTicket.value.id, ticketForm.value);
    resetForm();
    await fetchTickets();
    showForm.value = false;
    editingTicket.value = null;
  } catch (err) {
    error.value = err.message;
  } finally {
    isLoading.value = false;
  }
};

const deleteTicket = async (ticket) => {
  if (confirm(t('ticket.confirmDelete'))) {
    try {
      isLoading.value = true;
      await ticketService.delete(ticket.id);
      await fetchTickets();
    } catch (err) {
      error.value = err.message;
    } finally {
      isLoading.value = false;
    }
  }
};

const editTicket = (ticket) => {
  editingTicket.value = ticket;
  ticketForm.value = { ...ticket };
  showForm.value = true;
};

const viewTicketStats = async (ticket) => {
  try {
    selectedTicket.value = ticket;
    isLoading.value = true;
    currentStats.value = await ticketService.getTicketStats(ticket.id);
    showStats.value = true;
  } catch (err) {
    error.value = err.message;
  } finally {
    isLoading.value = false;
  }
};

const shareTicket = async (ticket, platform) => {
  try {
    await ticketService.shareTicket(ticket.id, platform);
    // Actualizar las estadísticas si están visibles
    if (showStats.value && selectedTicket.value && selectedTicket.value.id === ticket.id) {
      currentStats.value = await ticketService.getTicketStats(ticket.id);
    }
  } catch (err) {
    error.value = err.message;
  }
};

const resetForm = () => {
  ticketForm.value = {
    eventId: null,
    eventName: '',
    type: 'General',
    price: 0,
    validUntil: '',
    status: 'active',
    promoterId: JSON.parse(localStorage.getItem("user"))?.id
  };
  editingTicket.value = null;
};

// Filtrar eventos para mostrar solo los del promotor actual
const filteredEvents = computed(() => {
  return events.value.filter(event => event.promoterId === ticketForm.value.promoterId);
});

// Formatear fecha
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString();
};
</script>

<template>
  <div class="ticket-producer">
    <div class="header">
      <h1>{{ t('ticket.management') }}</h1>
      <pv-button 
        v-if="!showForm" 
        icon="pi pi-plus" 
        :label="t('ticket.create')" 
        @click="showForm = true; resetForm()" 
      />
    </div>

    <!-- Formulario de creación/edición -->
    <pv-dialog 
      v-model:visible="showForm" 
      :header="editingTicket ? t('ticket.edit') : t('ticket.create')" 
      :modal="true"
      :style="{ width: '500px' }"
    >
      <div class="ticket-form">
        <div class="form-field">
          <label for="event">{{ t('ticket.event') }}</label>
          <pv-dropdown 
            id="event" 
            v-model="ticketForm.eventId" 
            :options="filteredEvents" 
            optionLabel="name" 
            optionValue="id" 
            :placeholder="t('ticket.selectEvent')" 
            class="w-full"
            :disabled="editingTicket"
          />
        </div>

        <div class="form-field">
          <label for="type">{{ t('ticket.type') }}</label>
          <pv-input-text 
            id="type" 
            v-model="ticketForm.type" 
            :placeholder="t('ticket.typePlaceholder')" 
            class="w-full"
          />
        </div>

        <div class="form-field">
          <label for="price">{{ t('ticket.price') }}</label>
          <pv-input-number 
            id="price" 
            v-model="ticketForm.price" 
            mode="currency" 
            currency="USD" 
            locale="en-US" 
            class="w-full"
          />
        </div>

        <div class="form-field">
          <label for="validUntil">{{ t('ticket.validUntil') }}</label>
          <pv-calendar 
            id="validUntil" 
            v-model="ticketForm.validUntil" 
            dateFormat="yy-mm-dd" 
            :showIcon="true" 
            class="w-full"
          />
        </div>

        <div class="form-field">
          <label for="status">{{ t('ticket.status') }}</label>
          <pv-dropdown 
            id="status" 
            v-model="ticketForm.status" 
            :options="[
              { label: t('ticket.statusActive'), value: 'active' },
              { label: t('ticket.statusUsed'), value: 'used' },
              { label: t('ticket.statusCancelled'), value: 'cancelled' }
            ]" 
            optionLabel="label" 
            optionValue="value" 
            class="w-full"
          />
        </div>

        <div class="form-actions">
          <pv-button 
            :label="t('common.cancel')" 
            icon="pi pi-times" 
            class="p-button-text" 
            @click="showForm = false" 
          />
          <pv-button 
            :label="t('common.save')" 
            icon="pi pi-check" 
            @click="editingTicket ? updateTicket() : createTicket()" 
          />
        </div>
      </div>
    </pv-dialog>

    <!-- Diálogo de estadísticas -->
    <pv-dialog 
      v-model:visible="showStats" 
      :header="t('ticket.statistics')" 
      :modal="true"
      :style="{ width: '600px' }"
    >
      <div v-if="currentStats" class="stats-container">
        <h3>{{ selectedTicket?.eventName }}</h3>
        <p>{{ t('ticket.type') }}: {{ selectedTicket?.type }}</p>
        
        <div class="stats-grid">
          <div class="stats-item">
            <div class="stats-label">{{ t('ticket.stats.clicks') }}</div>
            <div class="stats-value">{{ currentStats.clicks || 0 }}</div>
          </div>
          <div class="stats-item">
            <div class="stats-label">{{ t('ticket.stats.uniqueVisits') }}</div>
            <div class="stats-value">{{ currentStats.uniqueVisits || 0 }}</div>
          </div>
          <div class="stats-item">
            <div class="stats-label">{{ t('ticket.stats.confirmations') }}</div>
            <div class="stats-value">{{ currentStats.attendanceConfirmations || 0 }}</div>
          </div>
          <div class="stats-item">
            <div class="stats-label">{{ t('ticket.stats.issued') }}</div>
            <div class="stats-value">{{ currentStats.ticketsIssued || 0 }}</div>
          </div>
          <div class="stats-item">
            <div class="stats-label">{{ t('ticket.stats.scanned') }}</div>
            <div class="stats-value">{{ currentStats.ticketsScanned || 0 }}</div>
          </div>
        </div>

        <div class="dialog-footer">
          <pv-button 
            :label="t('common.close')" 
            icon="pi pi-times" 
            @click="showStats = false" 
          />
        </div>
      </div>
    </pv-dialog>

    <!-- Lista de entradas -->
    <div v-if="isLoading" class="loading-container">
      <pv-progress-spinner />
      <p>{{ t('common.loading') }}</p>
    </div>

    <div v-else-if="error" class="error-container">
      <p class="error-message">{{ error }}</p>
      <pv-button :label="t('common.retry')" icon="pi pi-refresh" @click="fetchTickets" />
    </div>

    <div v-else-if="tickets.length === 0 && !showForm" class="empty-container">
      <p>{{ t('ticket.noTickets') }}</p>
      <pv-button :label="t('ticket.create')" icon="pi pi-plus" @click="showForm = true" />
    </div>

    <div v-else class="tickets-container">
      <div v-for="ticket in tickets" :key="ticket.id" class="ticket-card">
        <div class="ticket-header">
          <h3>{{ ticket.eventName }}</h3>
          <pv-tag :value="ticket.statusLabel" :severity="
            ticket.status === 'active' ? 'success' : 
            ticket.status === 'used' ? 'info' : 'danger'
          " />
        </div>

        <div class="ticket-content">
          <div class="ticket-info">
            <p><strong>{{ t('ticket.type') }}:</strong> {{ ticket.type }}</p>
            <p><strong>{{ t('ticket.code') }}:</strong> {{ ticket.code }}</p>
            <p><strong>{{ t('ticket.validUntil') }}:</strong> {{ formatDate(ticket.validUntil) }}</p>
            <p v-if="ticket.price > 0"><strong>{{ t('ticket.price') }}:</strong> {{ ticket.formattedPrice }}</p>
            <p><strong>QR:</strong> {{ ticket.qrGenerated ? t('ticket.generated') : t('ticket.notGenerated') }}</p>
          </div>
        </div>

        <div class="ticket-actions">
          <pv-button 
            icon="pi pi-pencil" 
            class="p-button-rounded p-button-text" 
            @click="editTicket(ticket)" 
            v-tooltip.top="t('common.edit')"
          />
          <pv-button 
            icon="pi pi-trash" 
            class="p-button-rounded p-button-text p-button-danger" 
            @click="deleteTicket(ticket)" 
            v-tooltip.top="t('common.delete')"
          />
          <pv-button 
            icon="pi pi-chart-bar" 
            class="p-button-rounded p-button-text p-button-info" 
            @click="viewTicketStats(ticket)" 
            v-tooltip.top="t('ticket.viewStats')"
          />
          <pv-menu ref="shareMenu" :model="sharePlatforms.map(platform => ({
            label: platform.name,
            icon: platform.icon,
            command: () => shareTicket(ticket, platform.id)
          }))" :popup="true" />
          <pv-button 
            icon="pi pi-share-alt" 
            class="p-button-rounded p-button-text p-button-success" 
            @click="$refs.shareMenu.toggle($event)" 
            v-tooltip.top="t('ticket.share')"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ticket-producer {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.header h1 {
  margin: 0;
  font-size: 1.75rem;
}

.ticket-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-field {
  margin-bottom: 1rem;
}

.form-field label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1rem;
}

.tickets-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.ticket-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
}

.ticket-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.ticket-header {
  padding: 1rem;
  background-color: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.ticket-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.ticket-content {
  padding: 1rem;
}

.ticket-info p {
  margin: 0.5rem 0;
}

.ticket-actions {
  padding: 0.75rem;
  border-top: 1px solid #e9ecef;
  display: flex;
  justify-content: flex-end;
  gap: 0.25rem;
}

.loading-container, .error-container, .empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.error-message {
  color: #e74c3c;
  margin-bottom: 1rem;
}

.stats-container {
  padding: 1rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin: 1.5rem 0;
}

.stats-item {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
}

.stats-label {
  font-size: 0.875rem;
  color: #6c757d;
  margin-bottom: 0.5rem;
}

.stats-value {
  font-size: 1.5rem;
  font-weight: 600;
  color: #495057;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 1.5rem;
}

/* Responsive */
@media (max-width: 768px) {
  .ticket-producer {
    padding: 1rem;
  }
  
  .tickets-container {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>