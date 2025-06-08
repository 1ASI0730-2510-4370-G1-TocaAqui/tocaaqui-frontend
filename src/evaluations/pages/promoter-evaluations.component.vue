<script setup>
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { EvaluationService } from '../services/evaluation.service';
import { EventApplicationService } from '../../events/services/event-application.service';
import ArtistRating from '../components/artist-rating.component.vue';

const router = useRouter();
const { t } = useI18n();
const toast = useToast();
const evaluationService = new EvaluationService();
const eventApplicationService = new EventApplicationService();

const events = ref([]);
const selectedEvent = ref(null);
const loading = ref(true);
const user = ref(JSON.parse(localStorage.getItem('user')));

const goToEvaluatedArtists = () => {
  router.push('/evaluations/artists/evaluated');
};

const fetchCompletedEvents = async () => {
  try {
    loading.value = true;
    // Usar el nuevo método que verifica pagos completados
    events.value = await evaluationService.getCompletedEventsByPromoter(user.value.id);
  } catch (error) {
    console.error('Error fetching events:', error);
  } finally {
    loading.value = false;
  }
};

const startEvaluation = (event, artist) => {
  selectedEvent.value = {
    event,
    artist,
    rating: 0,
    comment: '',
    checklist: []
  };
};

const saveEvaluation = async () => {
  try {
    const evaluationData = {
      eventId: selectedEvent.value.event.id,
      musicianId: selectedEvent.value.artist.userId,
      promoterId: user.value.id,
      rating: selectedEvent.value.rating,
      comment: selectedEvent.value.comment,
      artistChecklist: selectedEvent.value.checklist,
      type: 'artist'
    };

    await evaluationService.saveArtistEvaluation(evaluationData);
    
    // Mostrar mensaje de éxito
    toast.add({
      severity: 'success',
      summary: '¡Evaluación guardada!',
      detail: `Has evaluado exitosamente a ${selectedEvent.value.artist.name}`,
      life: 4000
    });
    
    selectedEvent.value = null;
    await fetchCompletedEvents();
  } catch (error) {
    console.error("Error saving evaluation:", error);
    
    // Mostrar mensaje de error
    toast.add({
      severity: 'error',
      summary: 'Error al guardar',
      detail: 'No se pudo guardar la evaluación. Inténtalo de nuevo.',
      life: 4000
    });
  }
};

const cancelEvaluation = () => {
  selectedEvent.value = null;
};

onMounted(() => {
  fetchCompletedEvents();
});
</script>

<template>
  <pv-toast />
  <div class="p-4">
    <pv-button
      :label="t('evaluations.viewEvaluatedArtists')"
      icon="pi pi-list"
      class="mb-4"
      @click="goToEvaluatedArtists"
    />
    <h2 class="text-2xl font-bold mb-4">{{ t('evaluations.artistEvaluations') }}</h2>

    <!-- Mensaje informativo -->
    <pv-message 
      severity="info" 
      :closable="false" 
      class="mb-4"
    >
      <span>{{ t('evaluations.paymentCompletedInfo') }}</span>
    </pv-message>

    <div v-if="loading" class="flex justify-content-center">
      <pv-progress-spinner />
    </div>

    <div v-else>
      <div v-if="!selectedEvent">
        <div v-if="events.length === 0" class="text-center p-6">
          <i class="pi pi-star text-6xl text-400 mb-4"></i>
          <h3 class="text-2xl font-semibold mb-3">{{ t('evaluations.noEventsToEvaluate') }}</h3>
          <p class="text-500 text-lg mb-4">{{ t('evaluations.noEventsDescription') }}</p>
          <div class="bg-blue-50 border-left-3 border-blue-500 p-4 mb-4 text-left">
            <p class="text-blue-800 font-medium mb-2">Para que aparezcan eventos aquí necesitas:</p>
            <ul class="text-blue-700 list-disc list-inside">
              <li>Tener eventos finalizados con contratos firmados</li>
              <li>Haber completado los pagos a los artistas</li>
              <li>Que los artistas no hayan sido evaluados previamente</li>
            </ul>
          </div>
          <pv-button 
            label="Ver artistas evaluados" 
            icon="pi pi-list" 
            class="p-button-outlined"
            @click="goToEvaluatedArtists"
          />
        </div>
        <div v-else class="grid">
          <div v-for="event in events" :key="event.id" class="col-12 md:col-6 xl:col-4 mb-4">
            <pv-card class="event-card h-full">
              <template #header>
                <div class="image-container">
                  <img :src="event.imageUrl || '/default-event.jpg'" :alt="event.name" class="event-image" />
                </div>
              </template>
              <template #title>
                <div class="event-title">{{ event.name }}</div>
              </template>
              <template #subtitle>
                <div class="event-subtitle">
                  <i class="pi pi-calendar mr-2"></i>
                  {{ new Date(event.date).toLocaleDateString() }}
                  <i class="pi pi-map-marker ml-3 mr-2"></i>
                  {{ event.location }}
                </div>
                <pv-tag 
                  value="Pago Completado" 
                  severity="success" 
                  class="mt-2"
                  icon="pi pi-check-circle" 
                />
              </template>
              <template #content>
                <h3 class="text-lg font-semibold mb-3">{{ t('evaluations.artists') }}</h3>
                <div class="artists-container">
                  <div v-for="artist in event.artists" :key="artist.userId" class="artist-item">
                    <div class="artist-info">
                      <img :src="artist.imageUrl || '/default-artist.jpg'" :alt="artist.name" 
                           class="artist-avatar" />
                      <span class="artist-name">{{ artist.name }}</span>
                    </div>
                    <pv-button 
                      :label="t('evaluations.evaluate')"
                      icon="pi pi-star"
                      @click="startEvaluation(event, artist)"
                      class="p-button-sm p-button-rounded"
                    />
                  </div>
                </div>
              </template>
            </pv-card>
          </div>
        </div>
      </div>

      <div v-else>
        <artist-rating
          :artist="selectedEvent.artist"
          :event="selectedEvent.event"
          :rating="selectedEvent.rating"
          :comment="selectedEvent.comment"
          @update="(data) => {
            selectedEvent.rating = data.rating;
            selectedEvent.comment = data.comment;
            selectedEvent.checklist = data.checklist;
          }"
        />
        <div class="flex justify-content-end gap-2 mt-4">
          <pv-button :label="t('common.cancel')" icon="pi pi-times" @click="cancelEvaluation" class="p-button-outlined" />
          <pv-button :label="t('common.save')" icon="pi pi-save" @click="saveEvaluation" class="p-button-success" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.event-card {
  background: var(--surface-card);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: transform 0.2s, box-shadow 0.2s;
  height: 100%;
  overflow: hidden;
}

.event-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 16px rgba(0,0,0,0.1);
}

.image-container {
  width: 100%;
  height: 180px;
  overflow: hidden;
}

.event-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  transition: transform 0.3s ease;
}

.event-card:hover .event-image {
  transform: scale(1.05);
}

.event-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-color);
  margin: 0.5rem 0;
}

.event-subtitle {
  color: var(--text-color-secondary);
  display: flex;
  align-items: center;
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.artists-container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.artist-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0.75rem;
  background: var(--surface-50);
  border-radius: 8px;
  transition: all 0.2s ease;
  border: 1px solid var(--surface-200);
}

.artist-item:hover {
  background: var(--surface-100);
  transform: translateX(2px);
}

.artist-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.artist-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--primary-100);
}

.artist-name {
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--text-color);
}

:deep(.p-button-sm) {
  padding: 0.35rem 0.75rem;
  font-size: 0.875rem;
}

:deep(.p-card-content) {
  padding: 1rem 1.5rem 1.5rem;
}

:deep(.p-card-title) {
  padding: 0 1.5rem;
  margin-bottom: 0;
}

:deep(.p-card-subtitle) {
  padding: 0 1.5rem;
  margin-bottom: 0.5rem;
}

:deep(.p-button-rounded.p-button-sm) {
  border-radius: 20px;
}
</style> 