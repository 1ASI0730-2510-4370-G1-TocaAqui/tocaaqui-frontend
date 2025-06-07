<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { EventApplicationService } from '../services/event-application.service';
import { InvitationService } from '../services/invitation.service';
import EventCard from '../components/event-card.component.vue';

const router = useRouter();
const { t } = useI18n();
const eventApplicationService = new EventApplicationService();
const invitationService = new InvitationService();

const events = ref([]);
const loading = ref(true);
const error = ref(null);
const selectedEvent = ref(null);
const showEventDialog = ref(false);
const userApplications = ref([]);
const userInvitations = ref([]);

// Obtener usuario del localStorage
const user = ref(null);
try {
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    user.value = JSON.parse(storedUser);
  }
} catch (error) {
  console.error('Error parsing user from localStorage:', error);
}

// Filtros
const filters = ref({
  name: '',
  location: '',
  genre: '',
  dateFrom: '',
  dateTo: ''
});

// Opciones de género musical
const genreOptions = [
  'Rock', 'Pop', 'Jazz', 'Electrónica', 'Hip Hop', 'Reggaeton', 
  'Salsa', 'Cumbia', 'Clásica', 'Folk', 'Metal', 'Blues', 'Otro'
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
    
    // Filtrar por género
    if (filters.value.genre && event.genre !== filters.value.genre) {
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
    loading.value = true;
    const data = await eventApplicationService.getAll();
    // Mostrar todos los eventos disponibles
    events.value = data;
    
    // Obtener las postulaciones del usuario actual
    if (user.value?.id) {
      const applicants = await eventApplicationService.getUserApplications(user.value.id);
      userApplications.value = applicants;
      
      // Obtener las invitaciones del usuario actual
      const invitations = await invitationService.getInvitationsByArtist(user.value.id);
      userInvitations.value = invitations;
    }
  } catch (err) {
    error.value = err.message;
    console.error('Error loading events:', err);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchEvents);

const applyFilters = () => {
  // Los filtros ya se aplican a través del computed property filteredEvents
};

const clearFilters = () => {
  filters.value = {
    name: '',
    location: '',
    genre: '',
    dateFrom: '',
    dateTo: ''
  };
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('es-ES', options);
};

const viewEventDetail = (event) => {
  selectedEvent.value = event;
  showEventDialog.value = true;
};

const hasApplied = (eventId) => {
  return userApplications.value.some(app => 
    app.eventId === eventId && app.status !== 'rejected'
  );
};

const isInvited = (eventId) => {
  return userInvitations.value.some(invitation => 
    invitation.eventId === eventId
  );
};

const getEventStatus = (eventId) => {
  if (isInvited(eventId)) {
    return 'invited';
  } else if (hasApplied(eventId)) {
    return 'applied';
  }
  return 'available';
};

const applyToEvent = async () => {
  try {
    if (!user.value?.id || !selectedEvent.value?.id) return;
    
    await eventApplicationService.applyToEvent(selectedEvent.value.id, user.value.id);
    showEventDialog.value = false;
    
    // Actualizar la lista de postulaciones
    const applicants = await eventApplicationService.getUserApplications(user.value.id);
    userApplications.value = applicants;
    
    // Actualizar la lista de invitaciones (por si cambió algo)
    const invitations = await invitationService.getInvitationsByArtist(user.value.id);
    userInvitations.value = invitations;
  } catch (error) {
    console.error('Error applying to event:', error);
  }
};
</script>

<template>
  <div class="search-container">
    <!-- Filtros -->
    <pv-card class="filter-card mb-4">
      <template #title>
        <div class="flex align-items-center">
          <i class="pi pi-filter mr-2"></i>
          <span>{{ $t('eventApplications.searchEvents') }}</span>
        </div>
      </template>
      <template #content>
        <div class="grid">
          <div class="col-12 md:col-3">
            <div class="p-field">
              <label for="name">{{ $t('common.search') }}</label>
              <pv-input-text 
                id="name" 
                v-model="filters.name" 
                :placeholder="$t('eventApplications.searchPlaceholder')"
                class="w-full" 
              ></pv-input-text>
            </div>
          </div>
          <div class="col-12 md:col-3">
            <div class="p-field">
              <label for="location">{{ $t('applicationDetail.location') }}</label>
              <pv-input-text 
                id="location" 
                v-model="filters.location" 
                :placeholder="$t('eventApplications.locationPlaceholder')"
                class="w-full" 
              ></pv-input-text>
            </div>
          </div>
          <div class="col-12 md:col-3">
            <div class="p-field">
              <label for="genre">{{ $t('applicationDetail.genre') }}</label>
              <pv-dropdown 
                id="genre" 
                v-model="filters.genre" 
                :options="genreOptions" 
                :placeholder="$t('eventApplications.genrePlaceholder')"
                class="w-full" 
              ></pv-dropdown>
            </div>
          </div>
          <div class="col-12 md:col-3">
            <div class="p-field">
              <label for="dateFrom">{{ $t('eventApplications.dateFrom') }}</label>
              <pv-calendar 
                id="dateFrom"
                v-model="filters.dateFrom"
                :showIcon="true"
                class="w-full"
              ></pv-calendar>
            </div>
          </div>
          <div class="col-12 flex justify-content-end">
            <pv-button 
              :label="$t('common.clear')" 
              icon="pi pi-times" 
              class="p-button-outlined mr-2" 
              @click="clearFilters" 
            ></pv-button>
            <pv-button 
              :label="$t('common.apply')" 
              icon="pi pi-search" 
              @click="applyFilters" 
            ></pv-button>
          </div>
        </div>
      </template>
    </pv-card>

    <!-- Lista de Eventos -->
    <div v-if="loading" class="flex justify-content-center">
      <pv-progress-spinner></pv-progress-spinner>
    </div>

    <div v-else-if="error" class="text-center">
      <pv-message severity="error" :closable="false">{{ error }}</pv-message>
    </div>

    <div v-else-if="filteredEvents.length === 0" class="text-center">
      <pv-message severity="info" :closable="false">{{ $t('eventApplications.noEvents') }}</pv-message>
    </div>

    <div v-else class="grid">
      <div v-for="event in filteredEvents" :key="event.id" class="col-12 md:col-6 lg:col-4 xl:col-4">
        <pv-card class="h-full">
          <template #header>
            <div class="relative">
              <img 
                :src="event.imageUrl || 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14'" 
                :alt="event.name"
                class="w-full h-15rem"
                style="object-fit: cover;"
              ></img>
              <pv-tag 
                v-if="getEventStatus(event.id) !== 'available'" 
                :severity="getEventStatus(event.id) === 'invited' ? 'success' : 'info'"
                class="absolute top-0 right-0 m-2"
                :value="getEventStatus(event.id) === 'invited' ? $t('eventApplications.invited') : $t('eventApplications.alreadyApplied')"
              ></pv-tag>
            </div>
          </template>
          <template #title>
            <div class="text-xl font-bold">{{ event.name }}</div>
          </template>
          <template #content>
            <div class="flex flex-column gap-2">
              <div class="flex align-items-center">
                <i class="pi pi-calendar mr-2 text-primary"></i>
                <span>{{ formatDate(event.date) }}</span>
              </div>
              <div class="flex align-items-center">
                <i class="pi pi-map-marker mr-2 text-primary"></i>
                <span>{{ event.location }}</span>
              </div>
              <div class="flex align-items-center">
                <i class="pi pi-tag mr-2 text-primary"></i>
                <span>{{ event.genre }}</span>
              </div>
              <div class="flex justify-content-end mt-3">
                <pv-button 
                  :label="getEventStatus(event.id) === 'available' ? $t('eventApplications.viewInfo') : 
                          (getEventStatus(event.id) === 'invited' ? $t('eventApplications.invited') : $t('eventApplications.alreadyApplied'))"
                  :class="{'p-button-secondary': getEventStatus(event.id) !== 'available'}"
                  :disabled="getEventStatus(event.id) !== 'available'"
                  @click="viewEventDetail(event)"
                ></pv-button>
              </div>
            </div>
          </template>
        </pv-card>
      </div>
    </div>

    <!-- Diálogo de detalles del evento -->
    <pv-dialog 
      v-model:visible="showEventDialog"
      :modal="true"
      :style="{ width: '50rem' }"
      :header="selectedEvent?.name"
    >
      <div v-if="selectedEvent" class="grid">
        <div class="col-12">
          <img 
            :src="selectedEvent.imageUrl || 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14'" 
            :alt="selectedEvent.name"
            class="w-full h-20rem mb-4"
            style="object-fit: cover;"
          ></img>
        </div>
        
        <div class="col-12 md:col-6">
          <h3>{{ $t('applicationDetail.eventDetails') }}</h3>
          <div class="flex flex-column gap-2">
            <div class="flex align-items-center">
              <i class="pi pi-calendar mr-2"></i>
              <span class="font-semibold">{{ $t('applicationDetail.eventDate') }}:</span>
              <span class="ml-2">{{ formatDate(selectedEvent.date) }}</span>
            </div>
            <div class="flex align-items-center">
              <i class="pi pi-clock mr-2"></i>
              <span class="font-semibold">{{ $t('applicationDetail.eventTime') }}:</span>
              <span class="ml-2">{{ selectedEvent.time }}</span>
            </div>
            <div class="flex align-items-center">
              <i class="pi pi-map-marker mr-2"></i>
              <span class="font-semibold">{{ $t('applicationDetail.location') }}:</span>
              <span class="ml-2">{{ selectedEvent.location }}</span>
            </div>
            <div class="flex align-items-center">
              <i class="pi pi-tag mr-2"></i>
              <span class="font-semibold">{{ $t('applicationDetail.genre') }}:</span>
              <span class="ml-2">{{ selectedEvent.genre }}</span>
            </div>
          </div>
        </div>
        
        <div class="col-12 md:col-6">
          <h3>{{ $t('applicationDetail.technicalDetails') }}</h3>
          <div class="flex flex-column gap-2">
            <div class="flex align-items-center">
              <i class="pi pi-clock mr-2"></i>
              <span class="font-semibold">{{ $t('applicationDetail.duration') }}:</span>
              <span class="ml-2">{{ selectedEvent.duration }} {{ $t('applicationDetail.hours') }}</span>
            </div>
            <div class="flex align-items-center">
              <i class="pi pi-users mr-2"></i>
              <span class="font-semibold">{{ $t('applicationDetail.venueCapacity') }}:</span>
              <span class="ml-2">{{ selectedEvent.capacity }}</span>
            </div>
            <div class="flex align-items-center">
              <i class="pi pi-dollar mr-2"></i>
              <span class="font-semibold">{{ $t('applicationDetail.payment') }}:</span>
              <span class="ml-2">{{ selectedEvent.payment }}</span>
            </div>
          </div>
        </div>
        
        <div class="col-12">
          <h3>{{ $t('applicationDetail.requirements') }}</h3>
          <p>{{ selectedEvent.requirements }}</p>
          
          <h3 class="mt-4">{{ $t('applicationDetail.description') }}</h3>
          <p>{{ selectedEvent.description }}</p>
        </div>
        
        <div class="col-12 flex justify-content-end mt-4">
          <div v-if="getEventStatus(selectedEvent?.id) === 'invited'" class="text-center">
            <pv-message severity="success" :closable="false">
              {{ $t('eventApplications.invitedMessage') }}
            </pv-message>
          </div>
          <div v-else-if="getEventStatus(selectedEvent?.id) === 'applied'" class="text-center">
            <pv-message severity="info" :closable="false">
              {{ $t('eventApplications.appliedMessage') }}
            </pv-message>
          </div>
          <pv-button 
            v-else
            :label="$t('eventApplications.apply')"
            icon="pi pi-check"
            @click="applyToEvent"
          ></pv-button>
        </div>
      </div>
    </pv-dialog>
  </div>
</template>

<style scoped>
.search-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1.5rem;
}

:deep(.p-dropdown),
:deep(.p-calendar) {
  background: var(--surface-card);
}

:deep(.p-tag) {
  font-size: 0.875rem;
  padding: 0.3rem 0.75rem;
}

.h-15rem {
  height: 15rem;
}

.h-20rem {
  height: 20rem;
}

.relative {
  position: relative;
}

.absolute {
  position: absolute;
}

.top-0 {
  top: 0;
}

.right-0 {
  right: 0;
}

.m-2 {
  margin: 0.5rem;
}
</style> 