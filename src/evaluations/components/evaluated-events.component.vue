<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { EvaluationService } from '../services/evaluation.service';
import httpInstance from '../../shared/services/http.instance';

const router = useRouter();
const evaluationService = new EvaluationService();
const evaluatedEvents = ref([]);
const loading = ref(true);
const error = ref(null);
const user = ref(JSON.parse(localStorage.getItem('user')));

const fetchEvaluatedEvents = async () => {
  try {
    loading.value = true;
    const evaluations = await evaluationService.getEvaluatedEvents();
    // Filtrar solo las evaluaciones del usuario actual
    evaluatedEvents.value = evaluations.filter(evaluation => evaluation.userId === user.value.id);
    
    // Obtener información adicional de cada evento
    evaluatedEvents.value = await Promise.all(
      evaluatedEvents.value.map(async (evaluation) => {
        try {
          // Obtener información del evento
          const eventResponse = await httpInstance.get(`/events/${evaluation.eventId}`);
          const event = eventResponse.data;
          
          return {
            ...evaluation,
            promoterId: event.adminId,
            promoterName: event.adminName
          };
        } catch (error) {
          console.error('Error enriching evaluation:', error);
          return evaluation;
        }
      })
    );
  } catch (err) {
    error.value = 'Error al cargar los eventos evaluados.';
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const goBack = () => {
  router.push('/evaluations/venues');
};

onMounted(() => {
  fetchEvaluatedEvents();
});
</script>

<template>
  <div class="p-4">
    <pv-button
        label="Regresar"
        icon="pi pi-arrow-left"
        class="mb-4"
        @click="goBack"
    />
    <div v-if="loading" class="flex justify-content-center">
      <pv-progress-spinner />
    </div>
    <div v-else-if="error" class="text-center">
      <pv-message severity="error">{{ error }}</pv-message>
    </div>
    <div v-else class="events-grid">
      <div v-for="event in evaluatedEvents" :key="event.id" class="event-card-container">
        <pv-card class="event-card">
          <template #header>
            <div class="image-container">
              <img :src="event.imageUrl || '/default-event.jpg'" :alt="event.name" class="event-image" />
              <div class="event-title">
                <h3>{{ event.name }}</h3>
              </div>
            </div>
          </template>
          <template #content>
            <div class="event-details">
              <div class="detail-item">
                <i class="pi pi-calendar mr-2"></i>
                <strong>Fecha:</strong>
                <span>{{ new Date(event.date).toLocaleDateString() }}</span>
              </div>
              <div class="detail-item">
                <i class="pi pi-map-marker mr-2"></i>
                <strong>Ubicación:</strong>
                <span>{{ event.location }}</span>
              </div>
              <div class="detail-item">
                <i class="pi pi-comment mr-2"></i>
                <strong>Comentario:</strong>
                <p class="comment-text">{{ event.comment }}</p>
              </div>
              <div class="detail-item">
                <i class="pi pi-info-circle mr-2"></i>
                <strong>Sugerencias:</strong>
                <p class="comment-text">{{ event.suggestions }}</p>
              </div>
              <div class="rating-container">
                <strong>Calificación:</strong>
                <pv-rating :modelValue="event.rating" readonly :cancel="false" />
              </div>
            </div>
          </template>
        </pv-card>
      </div>
    </div>
  </div>
</template>

<style scoped>
.events-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  margin: 0 auto;
}

.event-card-container {
  width: 100%;
}

@media screen and (max-width: 1200px) {
  .events-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media screen and (max-width: 768px) {
  .events-grid {
    grid-template-columns: 1fr;
  }
}

.event-card {
  background: var(--surface-card);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: transform 0.2s, box-shadow 0.2s;
  overflow: hidden;
  height: 100%;
}

.event-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 16px rgba(0,0,0,0.1);
}

.image-container {
  position: relative;
  width: 100%;
  height: 300px;
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
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 1.5rem;
  background: linear-gradient(transparent, rgba(0,0,0,0.8));
}

.event-title h3 {
  color: white;
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.event-details {
  padding: 1rem;
}

.detail-item {
  margin-bottom: 1rem;
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
}

.detail-item strong {
  color: var(--primary-color);
  margin-right: 0.5rem;
}

.comment-text {
  margin: 0.5rem 0;
  line-height: 1.5;
  color: var(--text-color-secondary);
}

.rating-container {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--surface-200);
}

:deep(.p-rating) {
  gap: 0.5rem;
}

:deep(.p-rating .p-rating-item.p-rating-item-active .p-rating-icon) {
  color: var(--primary-color);
}
</style>