<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import httpInstance from '../../shared/services/http.instance';
import { InvitationService } from '../services/invitation.service';
import { EventApplicationService } from '../services/event-application.service';
import { EvaluationService } from '../../evaluations/services/evaluation.service';
import { getMusicGenreOptions } from '../../utils/musicGenres';

const router = useRouter();
const { t } = useI18n();
const toast = useToast();
const invitationService = new InvitationService();
const eventApplicationService = new EventApplicationService();
const evaluationService = new EvaluationService();

const artists = ref([]);
const loading = ref(true);
const error = ref(null);
const selectedArtist = ref(null);
const showArtistDialog = ref(false);
const showInviteDialog = ref(false);
const artistRating = ref(0);
const loadingRating = ref(false);
const promoterEvents = ref([]);
const loadingEvents = ref(false);
const invitedEventsCount = ref(0);

// Form para enviar invitación
const inviteForm = ref({
  eventId: null,
  message: ''
});

// Función para formatear fecha del evento
const formatEventDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('es-ES', options);
};

// Función para obtener evento seleccionado
const getSelectedEvent = (eventId) => {
  return promoterEvents.value.find(event => event.id === eventId);
};

// Eventos disponibles (no invitados)
const availableEvents = computed(() => {
  return promoterEvents.value.filter(event => !event.isInvited);
});

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
  genre: '',
  type: '',
  location: ''
});

// Opciones de género musical
const genreOptions = computed(() => getMusicGenreOptions(t));

// Opciones de tipo
const typeOptions = [
  { label: 'Solista', value: 'solista' },
  { label: 'Banda', value: 'banda' }
];

// Artistas filtrados
const filteredArtists = computed(() => {
  if (!artists.value) return [];
  
  return artists.value.filter(artist => {
    // Filtrar por nombre
    if (filters.value.name && !artist.name.toLowerCase().includes(filters.value.name.toLowerCase())) {
      return false;
    }
    
    // Filtrar por género
    if (filters.value.genre && artist.genre !== filters.value.genre) {
      return false;
    }
    
    // Filtrar por tipo
    if (filters.value.type && artist.type !== filters.value.type) {
      return false;
    }
    
    return true;
  });
});

const fetchArtists = async () => {
  try {
    loading.value = true;
    const response = await httpInstance.get('/api/v1/users');
    // Filtrar solo usuarios con rol de músico
    artists.value = response.data.filter(user => user.role === 'musico');
  } catch (err) {
    error.value = err.message;
    console.error('Error loading artists:', err);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchArtists);

const clearFilters = () => {
  filters.value = {
    name: '',
    genre: '',
    type: '',
    location: ''
  };
};

const viewArtistDetail = async (artist) => {
  selectedArtist.value = artist;
  showArtistDialog.value = true;
  await loadArtistRating(artist.id);
};

const loadArtistRating = async (artistId) => {
  try {
    loadingRating.value = true;
    artistRating.value = 0;
    
    // Obtener todas las evaluaciones del artista
    const evaluations = await evaluationService.getEvaluatedArtists();
    const artistEvaluations = evaluations.filter(evaluation => evaluation.musicianId === artistId);
    
    if (artistEvaluations.length > 0) {
      // Calcular promedio de calificaciones
      const totalRating = artistEvaluations.reduce((sum, evaluation) => sum + evaluation.rating, 0);
      artistRating.value = totalRating / artistEvaluations.length;
    }
  } catch (error) {
    console.error('Error loading artist rating:', error);
    artistRating.value = 0;
  } finally {
    loadingRating.value = false;
  }
};

const contactArtist = (artist) => {
  selectedArtist.value = artist;
  showInviteDialog.value = true;
  loadPromoterEvents();
};

const loadPromoterEvents = async () => {
  try {
    loadingEvents.value = true;
    const events = await eventApplicationService.getEventsByPromoter(user.value.id);
    
    // Obtener invitaciones existentes para este artista
    try {
      const existingInvitations = await invitationService.getInvitationsByPromoter(user.value.id);
      const artistInvitations = existingInvitations.filter(inv => 
        inv.artistId === selectedArtist.value.id
      );
      
      // Marcar eventos ya invitados y agregar información detallada
      promoterEvents.value = events.map(event => ({
        ...event,
        isInvited: artistInvitations.some(inv => inv.eventId === event.id),
        displayText: `${event.name} - ${formatEventDate(event.date)} - ${event.location}`,
        formattedDate: formatEventDate(event.date)
      }));
      
      // Contar invitaciones a este artista
      invitedEventsCount.value = artistInvitations.length;
      
    } catch (invErr) {
      console.warn('Error loading invitations, proceeding without invitation status:', invErr);
      // Si falla la carga de invitaciones, cargar eventos sin estado de invitación
      promoterEvents.value = events.map(event => ({
        ...event,
        isInvited: false,
        displayText: `${event.name} - ${formatEventDate(event.date)} - ${event.location}`,
        formattedDate: formatEventDate(event.date)
      }));
      invitedEventsCount.value = 0;
    }
    
  } catch (err) {
    console.error('Error loading promoter events:', err);
    toast.add({
      severity: 'error',
      summary: t('common.error'),
      detail: 'Error al cargar los eventos',
      life: 3000
    });
  } finally {
    loadingEvents.value = false;
  }
};

const sendInvitation = async () => {
  if (!inviteForm.value.eventId || !selectedArtist.value) {
    toast.add({
      severity: 'warn',
      summary: t('common.error'),
      detail: 'Por favor selecciona un evento',
      life: 3000
    });
    return;
  }

  try {
    const selectedEvent = promoterEvents.value.find(e => e.id === inviteForm.value.eventId);
    
    console.log('Creando invitación para:');
    console.log('- Artista seleccionado:', selectedArtist.value);
    console.log('- Artista ID:', selectedArtist.value.id);
    console.log('- Evento ID:', inviteForm.value.eventId);
    console.log('- Promoter ID:', user.value.id);
    
    const invitationData = {
      EventId: inviteForm.value.eventId,
      ArtistId: selectedArtist.value.id,
      PromoterId: user.value.id,
      Message: inviteForm.value.message
    };

    console.log('Datos de invitación a enviar:', invitationData);
    await invitationService.sendInvitation(invitationData);
    
    toast.add({
      severity: 'success',
      summary: t('common.success'),
      detail: `Invitación enviada a ${selectedArtist.value.name}`,
      life: 3000
    });

    // Actualizar la lista de eventos para reflejar el nuevo estado
    await loadPromoterEvents();

    showInviteDialog.value = false;
    inviteForm.value = { eventId: null, message: '' };
  } catch (error) {
    console.error('Error sending invitation:', error);
    toast.add({
      severity: 'error',
      summary: t('common.error'),
      detail: error.message || 'Error al enviar la invitación',
      life: 3000
    });
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
          <span>{{ $t('artistSearch.searchArtists') }}</span>
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
                :placeholder="$t('artistSearch.searchPlaceholder')"
                class="w-full" 
              />
            </div>
          </div>
          <div class="col-12 md:col-3">
            <div class="p-field">
              <label for="genre">{{ $t('applicationDetail.genre') }}</label>
              <pv-dropdown 
                id="genre" 
                v-model="filters.genre" 
                :options="genreOptions" 
                option-label="label"
                option-value="value"
                :placeholder="$t('artistSearch.genrePlaceholder')"
                class="w-full" 
              />
            </div>
          </div>
          <div class="col-12 md:col-3">
            <div class="p-field">
              <label for="type">{{ $t('profile.type') }}</label>
              <pv-dropdown 
                id="type" 
                v-model="filters.type" 
                :options="typeOptions" 
                optionLabel="label"
                optionValue="value"
                :placeholder="$t('artistSearch.typePlaceholder')"
                class="w-full" 
              />
            </div>
          </div>
          <div class="col-12 md:col-3">
            <div class="p-field flex align-items-end">
              <pv-button 
                :label="$t('common.clear')" 
                icon="pi pi-times" 
                @click="clearFilters"
                class="w-full"
                outlined
              />
            </div>
          </div>
        </div>
      </template>
    </pv-card>

    <!-- Resultados -->
    <div v-if="loading" class="flex justify-content-center">
      <pv-progress-spinner />
    </div>

    <div v-else-if="error" class="text-center">
      <pv-message severity="error" :closable="false">
        {{ error }}
      </pv-message>
    </div>

    <div v-else class="grid">
      <div v-for="artist in filteredArtists" :key="artist.id" class="col-12 md:col-6 lg:col-4 xl:col-3">
        <pv-card class="h-full artist-card">
          <template #header>
            <div class="relative">
              <img 
                :src="artist.imageUrl || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'" 
                :alt="artist.name"
                class="w-full h-15rem artist-image"
              />
            </div>
          </template>
          <template #title>
            <div class="text-xl font-bold">{{ artist.name }}</div>
          </template>
          <template #subtitle>
            <div class="flex align-items-center text-600 mb-2">
              <i class="pi pi-tag mr-2"></i>
              <span>{{ artist.genre || 'No especificado' }}</span>
            </div>
            <div class="flex align-items-center text-600 mb-2">
              <i class="pi pi-users mr-2"></i>
              <span>{{ artist.type || 'No especificado' }}</span>
            </div>
          </template>
          <template #content>
            <p class="text-600 line-height-3">
              {{ artist.description || 'Sin descripción disponible' }}
            </p>
          </template>
          <template #footer>
            <div class="flex flex-column gap-2">
              <pv-button 
                :label="$t('common.viewProfile')" 
                icon="pi pi-eye" 
                @click="viewArtistDetail(artist)"
                class="w-full"
                outlined
              />
              <pv-button 
                :label="$t('invitations.invite')" 
                icon="pi pi-send" 
                @click="contactArtist(artist)"
                class="w-full"
              />
            </div>
          </template>
        </pv-card>
      </div>
      
      <!-- Mensaje cuando no hay resultados -->
      <div v-if="filteredArtists.length === 0" class="col-12 text-center">
        <i class="pi pi-search text-4xl text-500 mb-3"></i>
        <h3 class="text-xl mb-2">{{ $t('artistSearch.noResults') }}</h3>
        <p class="text-500">{{ $t('artistSearch.noResultsDescription') }}</p>
      </div>
    </div>

    <!-- Diálogo de detalles del artista -->
    <pv-dialog 
      v-model:visible="showArtistDialog"
      :modal="true"
      :style="{ width: '50rem' }"
      :header="selectedArtist?.name"
    >
      <div v-if="selectedArtist" class="grid">
        <div class="col-12 text-center mb-4">
          <img 
            :src="selectedArtist.imageUrl || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'" 
            :alt="selectedArtist.name"
            class="w-8rem h-8rem border-circle"
            style="object-fit: cover;"
          />
        </div>
        
        <div class="col-12">
          <h3>{{ $t('artistSearch.artistDetails') }}</h3>
          <div class="flex flex-column gap-3">
            <div class="flex align-items-center">
              <i class="pi pi-user mr-2"></i>
              <span class="font-semibold">{{ $t('profile.name') }}:</span>
              <span class="ml-2">{{ selectedArtist.name }}</span>
            </div>
            <div class="flex align-items-center">
              <i class="pi pi-envelope mr-2"></i>
              <span class="font-semibold">{{ $t('profile.email') }}:</span>
              <span class="ml-2">{{ selectedArtist.email }}</span>
            </div>
            <div class="flex align-items-center">
              <i class="pi pi-tag mr-2"></i>
              <span class="font-semibold">{{ $t('profile.genre') }}:</span>
              <span class="ml-2">{{ selectedArtist.genre || 'No especificado' }}</span>
            </div>
            <div class="flex align-items-center">
              <i class="pi pi-users mr-2"></i>
              <span class="font-semibold">{{ $t('profile.type') }}:</span>
              <span class="ml-2">{{ selectedArtist.type || 'No especificado' }}</span>
            </div>
            <div class="flex align-items-center">
              <i class="pi pi-star mr-2"></i>
              <span class="font-semibold">{{ $t('evaluations.rating') }}:</span>
              <span class="ml-2" v-if="loadingRating">Cargando...</span>
              <div v-else-if="artistRating > 0" class="flex align-items-center ml-2">
                <pv-rating 
                  v-model="artistRating" 
                  readonly 
                  :cancel="false"
                  class="mr-2"
                />
                <span class="text-600">({{ artistRating.toFixed(1) }})</span>
              </div>
              <span v-else class="ml-2 text-600">Sin calificaciones</span>
            </div>
            <div v-if="selectedArtist.description">
              <div class="flex align-items-start">
                <i class="pi pi-info-circle mr-2 mt-1"></i>
                <div>
                  <span class="font-semibold">{{ $t('profile.description') }}:</span>
                  <p class="mt-2 line-height-3">{{ selectedArtist.description }}</p>
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
            @click="showArtistDialog = false" 
            outlined 
          />
          <pv-button 
            :label="$t('invitations.invite')" 
            icon="pi pi-send" 
            @click="contactArtist(selectedArtist)" 
          />
        </div>
      </template>
    </pv-dialog>

    <!-- Diálogo para enviar invitación -->
    <pv-dialog 
      v-model:visible="showInviteDialog"
      :modal="true"
      :style="{ width: '50rem' }"
      :header="$t('invitations.inviteArtist')"
    >
      <div v-if="selectedArtist">
        <!-- Mensaje de invitación -->
        <div class="mb-4">
          <h4 class="text-green-500 mb-2">{{ $t('invitations.invitingTo') }}: {{ selectedArtist.name }}</h4>
        </div>


        
        <div class="grid">
          <div class="col-12">
            <div class="p-field mb-4">
              <label for="event">{{ $t('invitations.selectEvent') }}</label>
              <pv-dropdown 
                id="event"
                v-model="inviteForm.eventId"
                :options="promoterEvents"
                optionLabel="name"
                optionValue="id"
                :optionDisabled="(option) => option.isInvited"
                :placeholder="$t('invitations.selectEventPlaceholder')"
                class="w-full"
                :loading="loadingEvents"
              >
                <template #option="slotProps">
                  <div 
                    class="flex align-items-center justify-content-between w-full h-full"
                    :class="{ 'is-invited': slotProps.option.isInvited }"
                  >
                    <div>
                      <div class="font-semibold" :class="{ 'text-green-500': slotProps.option.isInvited }">
                        {{ slotProps.option.name }}
                      </div>
                      <div class="text-sm text-600">
                        {{ slotProps.option.formattedDate }} - {{ slotProps.option.location }}
                      </div>
                    </div>
                    <div v-if="slotProps.option.isInvited" class="text-orange-500 text-sm font-semibold">
                      {{ $t('invitations.alreadyInvited') }}
                    </div>
                  </div>
                </template>
                <template #value="slotProps">
                  <div v-if="slotProps.value">
                    <div class="font-semibold">{{ getSelectedEvent(slotProps.value)?.name }}</div>
                    <div class="text-sm text-600">{{ getSelectedEvent(slotProps.value)?.formattedDate }}</div>
                  </div>
                  <span v-else>{{ $t('invitations.selectEventPlaceholder') }}</span>
                </template>
              </pv-dropdown>
            </div>
            
            <!-- Mensaje de advertencia removido -->
            
            <div class="p-field">
              <pv-textarea
                id="message"
                v-model="inviteForm.message"
                :placeholder="$t('invitations.messagePlaceholder')"
                rows="4"
                class="w-full"
              />
            </div>
          </div>
        </div>
      </div>
      
      <template #footer>
        <div class="flex justify-content-end gap-2">
          <pv-button 
            :label="$t('common.cancel')" 
            icon="pi pi-times" 
            @click="showInviteDialog = false" 
            outlined 
          />
          <pv-button 
            :label="$t('invitations.sendInvitation')" 
            icon="pi pi-send" 
            @click="sendInvitation"
            :disabled="!inviteForm.eventId"
          />
        </div>
      </template>
    </pv-dialog>
  </div>
</template>

<style scoped>
.search-container {
  padding: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
}

.filter-card {
  background: var(--surface-card);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.artist-card {
  background: var(--surface-card);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: transform 0.2s, box-shadow 0.2s;
  height: 100%;
  overflow: hidden;
}

.artist-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 16px rgba(0,0,0,0.1);
}

.artist-image {
  object-fit: cover;
  object-position: center;
  transition: transform 0.3s ease;
}

.artist-card:hover .artist-image {
  transform: scale(1.05);
}

.h-15rem {
  height: 15rem;
}

.w-8rem {
  width: 8rem;
}

.h-8rem {
  height: 8rem;
}

.border-circle {
  border-radius: 50%;
}

.line-height-3 {
  line-height: 1.5;
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

/* Aplicar fondo gris al item completo cuando contiene elemento invited */
:deep(.p-dropdown-item:has(.is-invited)) {
  background-color: var(--surface-200) !important;
}

/* Fallback para navegadores que no soportan :has */
:deep(.p-dropdown-item .is-invited) {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--surface-200);
  z-index: -1;
}

:deep(.p-dropdown-item) {
  position: relative;
}
  </style>  