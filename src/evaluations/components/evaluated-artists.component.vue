<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { EvaluationService } from '../services/evaluation.service';

const router = useRouter();
const { t } = useI18n();
const evaluationService = new EvaluationService();
const evaluatedArtists = ref([]);
const loading = ref(true);
const error = ref(null);
const user = ref(JSON.parse(localStorage.getItem('user')));

const fetchEvaluatedArtists = async () => {
  try {
    loading.value = true;
    evaluatedArtists.value = await evaluationService.getArtistEvaluationsByPromoter(user.value.id);
  } catch (err) {
    error.value = t('evaluations.errorLoadingArtists');
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const goBack = () => {
  router.push('/evaluations/artists');
};

onMounted(() => {
  fetchEvaluatedArtists();
});
</script>

<template>
  <div class="p-6 min-h-screen bg-surface-ground">
    <div class="mb-6">
      <pv-button
        :label="t('common.back')"
        icon="pi pi-arrow-left"
        class="p-button-outlined"
        @click="goBack"
      />
    </div>

    <div class="mb-6">
      <h2 class="text-3xl font-bold text-color mb-2">{{ t('evaluations.evaluatedArtists') }}</h2>
      <p class="text-color-secondary text-lg">Historial de evaluaciones realizadas a artistas</p>
    </div>

    <div v-if="loading" class="flex justify-content-center align-items-center" style="min-height: 400px;">
      <div class="text-center">
        <pv-progress-spinner strokeWidth="3" style="width: 50px; height: 50px;" />
        <p class="mt-3 text-color-secondary">Cargando evaluaciones...</p>
      </div>
    </div>

    <div v-else-if="error" class="flex justify-content-center align-items-center" style="min-height: 400px;">
      <pv-message severity="error" :closable="false" class="w-full max-w-md">{{ error }}</pv-message>
    </div>

    <div v-else-if="evaluatedArtists.length === 0" class="text-center" style="min-height: 400px;">
      <div class="flex flex-column align-items-center justify-content-center h-full">
        <i class="pi pi-star text-6xl text-color-secondary mb-4"></i>
        <h3 class="text-2xl font-semibold text-color mb-3">No hay evaluaciones realizadas</h3>
        <p class="text-color-secondary text-lg mb-4">Las evaluaciones de artistas aparecerán aquí una vez que las realices.</p>
        <pv-button 
          label="Ir a evaluaciones pendientes" 
          icon="pi pi-arrow-right" 
          @click="goBack"
        />
      </div>
    </div>

    <div v-else class="evaluation-grid">
      <div v-for="evaluation in evaluatedArtists" :key="evaluation.id" class="evaluation-card-wrapper">
        <pv-card class="evaluation-card h-full">
          <template #header>
            <div class="card-header">
              <div class="artist-info">
                <div class="artist-avatar-container">
                  <img 
                    :src="evaluation.artist?.imageUrl || '/default-artist.jpg'" 
                    :alt="evaluation.artist?.name"
                    class="artist-avatar" 
                  />
                  <div class="rating-badge">
                    <i class="pi pi-star-fill"></i>
                    <span>{{ evaluation.rating }}</span>
                  </div>
                </div>
                <div class="artist-details">
                  <h3 class="artist-name">{{ evaluation.artist?.name || 'Artista' }}</h3>
                  <div class="event-info">
                    <i class="pi pi-calendar mr-1"></i>
                    <span class="event-name">{{ evaluation.event?.name || 'Evento' }}</span>
                  </div>
                  <div class="event-date">
                    <i class="pi pi-clock mr-1"></i>
                    <span>{{ evaluation.event?.date ? new Date(evaluation.event.date).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long', 
                      day: 'numeric'
                    }) : 'Fecha no disponible' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </template>
          
          <template #content>
            <div class="card-content">
              <!-- Rating Stars -->
              <div class="section">
                <h4 class="section-title">
                  <i class="pi pi-star mr-2"></i>
                  {{ t('evaluations.rating') }}
                </h4>
                <div class="rating-container">
                  <pv-rating :modelValue="evaluation.rating" readonly :cancel="false" />
                  <span class="rating-text">{{ evaluation.rating }}/5 estrellas</span>
                </div>
              </div>

              <!-- Comment -->
              <div class="section">
                <h4 class="section-title">
                  <i class="pi pi-comment mr-2"></i>
                  {{ t('evaluations.comment') }}
                </h4>
                <div class="comment-box">
                  <p>{{ evaluation.comment || 'Sin comentarios adicionales' }}</p>
                </div>
              </div>

              <!-- Checklist -->
              <div class="section">
                <h4 class="section-title">
                  <i class="pi pi-check-square mr-2"></i>
                  {{ t('evaluations.checklist') }}
                </h4>
                <div class="checklist-container">
                  <div v-for="item in evaluation.artistChecklist" :key="item.id" class="checklist-item">
                    <i :class="[
                      'checklist-icon', 
                      'pi', 
                      item.value ? 'pi-check-circle' : 'pi-times-circle'
                    ]" />
                    <span class="checklist-label">{{ item.label }}</span>
                  </div>
                </div>
              </div>
            </div>
          </template>

          <template #footer>
            <div class="card-footer">
              <pv-tag 
                value="Evaluado" 
                severity="success" 
                icon="pi pi-check" 
              />
              <small class="text-color-secondary">
                Evaluado el {{ new Date(evaluation.createdAt || Date.now()).toLocaleDateString('es-ES') }}
              </small>
            </div>
          </template>
        </pv-card>
      </div>
    </div>
  </div>
</template>

<style scoped>
.evaluation-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(420px, 1fr));
  gap: 2rem;
}

.evaluation-card-wrapper {
  display: flex;
}

.evaluation-card {
  width: 100%;
  background: var(--surface-card);
  border: 1px solid var(--surface-border);
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.evaluation-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.card-header {
  padding: 1.5rem;
  background: linear-gradient(135deg, var(--primary-50) 0%, var(--primary-100) 100%);
}

.artist-info {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.artist-avatar-container {
  position: relative;
  flex-shrink: 0;
}

.artist-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.rating-badge {
  position: absolute;
  bottom: -5px;
  right: -5px;
  background: var(--yellow-400);
  color: white;
  border-radius: 20px;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.artist-details {
  flex: 1;
  min-width: 0;
}

.artist-name {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-color);
  margin: 0 0 0.5rem 0;
  line-height: 1.2;
}

.event-info, .event-date {
  display: flex;
  align-items: center;
  margin-bottom: 0.25rem;
  color: var(--text-color-secondary);
  font-size: 0.9rem;
}

.event-name {
  font-weight: 600;
  color: var(--primary-color);
}

.card-content {
  padding: 1.5rem;
}

.section {
  margin-bottom: 1.5rem;
}

.section:last-child {
  margin-bottom: 0;
}

.section-title {
  display: flex;
  align-items: center;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 0.75rem;
}

.rating-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.rating-text {
  font-size: 0.9rem;
  color: var(--text-color-secondary);
  font-weight: 500;
}

.comment-box {
  background: var(--surface-100);
  border-radius: 8px;
  padding: 1rem;
  border-left: 4px solid var(--primary-color);
}

.comment-box p {
  margin: 0;
  line-height: 1.6;
  color: var(--text-color);
  font-style: italic;
}

.checklist-container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.checklist-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  border-radius: 6px;
  background: var(--surface-50);
  transition: background-color 0.2s ease;
}

.checklist-item:hover {
  background: var(--surface-100);
}

.checklist-icon {
  font-size: 1.1rem;
  width: 20px;
  text-align: center;
}

.checklist-icon.pi-check-circle {
  color: var(--green-500);
}

.checklist-icon.pi-times-circle {
  color: var(--red-500);
}

.checklist-label {
  font-weight: 500;
  color: var(--text-color);
}

.card-footer {
  padding: 1rem 1.5rem;
  background: var(--surface-50);
  border-top: 1px solid var(--surface-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

:deep(.p-rating) {
  gap: 0.25rem;
}

:deep(.p-rating .p-rating-icon) {
  font-size: 1.2rem;
}

:deep(.p-rating .p-rating-icon.pi-star-fill) {
  color: var(--yellow-400);
}

/* Responsive */
@media (max-width: 768px) {
  .evaluation-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .card-header {
    padding: 1rem;
  }
  
  .artist-info {
    flex-direction: column;
    text-align: center;
  }
  
  .artist-details {
    text-align: center;
  }
  
  .card-content {
    padding: 1rem;
  }
  
  .card-footer {
    padding: 0.75rem 1rem;
    flex-direction: column;
    gap: 0.5rem;
    align-items: flex-start;
  }
}
</style> 