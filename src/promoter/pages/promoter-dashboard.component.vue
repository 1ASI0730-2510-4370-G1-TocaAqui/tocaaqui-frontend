<script setup>
import { ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { PromoterEventService } from '../services/promoter-event.service.js';

const { t } = useI18n();
const promoterEventService = new PromoterEventService();
const events = ref([]);
const isLoading = ref(true);
const error = ref(null);

// Filtros
const filters = ref({
  name: '',
  location: '',
  status: '',
  dateFrom: '',
  dateTo: ''
});

const statusOptions = [
  { label: t('eventApplications.allStatuses'), value: '' },
  { label: t('eventApplications.status.pending'), value: 'pending' },
  { label: t('eventApplications.status.accepted'), value: 'accepted' },
  { label: t('eventApplications.status.rejected'), value: 'rejected' }
];

// Eventos filtrados
const filteredEvents = computed(() => {
  if (!events.value) return [];
  
  return events.value.filter(event => {
    // Filtrar por nombre
    if (filters.value.name && !event.name.toLowerCase().includes(filters.value.name.toLowerCase())) {
      return false;
    }
    
    // Filtrar por ubicación
    if (filters.value.location && !event.location.toLowerCase().includes(filters.value.location.toLowerCase())) {
      return false;
    }
    
    // Filtrar por estado
    if (filters.value.status && event.status !== filters.value.status) {
      return false;
    }
    
    // Filtrar por fecha desde
    if (filters.value.dateFrom) {
      const eventDate = new Date(event.date);
      const fromDate = new Date(filters.value.dateFrom);
      if (eventDate < fromDate) {
        return false;
      }
    }
    
    // Filtrar por fecha hasta
    if (filters.value.dateTo) {
      const eventDate = new Date(event.date);
      const toDate = new Date(filters.value.dateTo);
      if (eventDate > toDate) {
        return false;
      }
    }
    
    return true;
  });
});

const fetchEvents = async () => {
  try {
    isLoading.value = true;
    const data = await promoterEventService.getAll();
    events.value = data;
  } catch (err) {
    error.value = err.message;
    console.error('Error loading events:', err);
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchEvents);

const applyFilters = async () => {
  try {
    isLoading.value = true;
    const data = await promoterEventService.filterEvents(filters.value);
    events.value = data;
  } catch (err) {
    error.value = err.message;
    console.error('Error filtering events:', err);
  } finally {
    isLoading.value = false;
  }
};

const clearFilters = () => {
  filters.value = {
    name: '',
    location: '',
    status: '',
    dateFrom: '',
    dateTo: ''
  };
  fetchEvents();
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('es-ES', options);
};

const getDayName = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const options = { weekday: 'long' };
  return date.toLocaleDateString('es-ES', options);
};

const getMonthDay = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const options = { month: 'short', day: 'numeric' };
  return date.toLocaleDateString('es-ES', options);
};
</script>

<template>
  <div class="promoter-dashboard">
    
    <div class="dashboard-content">
      <!-- Filtros -->
      <pv-card class="filter-card mb-4">
        <template #title>
          <div class="flex align-items-center">
            <i class="pi pi-filter mr-2"></i>
            <span>{{ t('eventApplications.title') }}</span>
          </div>
        </template>
        <template #content>
          <div class="grid">
            <div class="col-12 md:col-4">
              <div class="p-field">
                <label for="name">{{ t('common.search') }}</label>
                <pv-input-text 
                  id="name" 
                  v-model="filters.name" 
                  :placeholder="t('eventApplications.searchPlaceholder')"
                  class="w-full" 
                />
              </div>
            </div>
            <div class="col-12 md:col-4">
              <div class="p-field">
                <label for="location">{{ t('applicationDetail.location') }}</label>
                <pv-input-text 
                  id="location" 
                  v-model="filters.location" 
                  :placeholder="t('eventApplications.locationPlaceholder')"
                 
                  class="w-full" 
                />
              </div>
            </div>
            <div class="col-12 md:col-4">
              <div class="p-field">
                <label for="status">{{ t('common.status') }}</label>
                <pv-dropdown 
                  id="status" 
                   :placeholder="t('eventApplications.statePlaceholder')"
                  v-model="filters.status" 
                  :options="statusOptions" 
                  optionLabel="label" 
                  optionValue="value" 
                  class="w-full" 
                />
              </div>
            </div>
            <div class="col-12 flex justify-content-end">
              <pv-button 
                label="Limpiar" 
                icon="pi pi-times" 
                class="p-button-outlined mr-2" 
                @click="clearFilters" 
              />
              <pv-button 
                label="Aplicar" 
                icon="pi pi-search" 
                @click="applyFilters" 
              />
            </div>
          </div>
        </template>
      </pv-card>

      <!-- Eventos -->
      <div v-if="isLoading" class="loading-container">
        <pv-progress-spinner />
        <p>{{ t('common.loading') }}</p>
      </div>

      <div v-else-if="error" class="error-container">
        <p class="error-message">{{ error }}</p>
        <pv-button label="Reintentar" icon="pi pi-refresh" @click="fetchEvents" />
      </div>

      <div v-else-if="filteredEvents.length === 0" class="empty-container">
        <p>{{ t('eventApplications.noApplications') }}</p>
      </div>

      <div v-else class="events-grid">
        <div v-for="event in filteredEvents" :key="event.id" class="event-card">
          <div class="event-image">
            <img :src="event.imageUrl" :alt="event.name" />
          </div>
          <div class="event-content">
            <h3 class="event-title">{{ event.name }}</h3>
            <p class="event-date">{{ getDayName(event.date) }}, {{ getMonthDay(event.date) }}</p>
            <p class="event-location">{{ event.location }}</p>
            <pv-button 
              label="Postular" 
              class="event-apply-btn" 
              @click="$router.push(`/applications/${event.id}`)" 
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.promoter-dashboard {
  min-height: 100vh;
  background-color: var(--surface-ground);
}



.dashboard-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem 2rem;
}

.filter-card {
  margin-bottom: 2rem;
}

.p-field {
  margin-bottom: 1rem;
}

.p-field label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.events-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.event-card {
  background-color: var(--surface-card);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s, box-shadow 0.2s;
}

.event-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.event-image {
  height: 180px;
  overflow: hidden;
}

.event-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.event-card:hover .event-image img {
  transform: scale(1.05);
}

.event-content {
  padding: 1.25rem;
}

.event-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 0.5rem;
}

.event-date, .event-location {
  color: var(--text-color-secondary);
  margin: 0.25rem 0;
  font-size: 0.9rem;
}

.event-apply-btn {
  margin-top: 1rem;
  width: 100%;
}

.loading-container, .error-container, .empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
}

.error-message {
  color: var(--red-500);
  margin-bottom: 1rem;
}

@media (max-width: 768px) {
  .events-grid {
    grid-template-columns: 1fr;
  }
  
  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
}
</style>