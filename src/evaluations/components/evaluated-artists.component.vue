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
  <div class="p-4">
    <pv-button
      :label="t('common.back')"
      icon="pi pi-arrow-left"
      class="mb-4"
      @click="goBack"
    />
    <h2 class="text-2xl font-bold mb-4">{{ t('evaluations.evaluatedArtists') }}</h2>

    <div v-if="loading" class="flex justify-content-center">
      <pv-progress-spinner />
    </div>
    <div v-else-if="error" class="text-center">
      <pv-message severity="error" :closable="false">{{ error }}</pv-message>
    </div>
    <div v-else>
      <div v-for="evaluation in evaluatedArtists" :key="evaluation.id" class="mb-4">
        <pv-card>
          <template #header>
            <div class="flex align-items-center p-3">
              <img :src="evaluation.artist?.imageUrl || '/default-artist.jpg'" 
                   :alt="evaluation.artist?.name"
                   class="artist-image" />
              <div class="ml-3">
                <h3 class="text-xl mb-1">{{ evaluation.artist?.name || 'Artista' }}</h3>
                <p class="text-500">
                  {{ evaluation.event?.name || 'Evento' }}
                  {{ evaluation.event?.date ? ` - ${new Date(evaluation.event.date).toLocaleDateString()}` : '' }}
                </p>
              </div>
            </div>
          </template>
          <template #content>
            <div class="mb-3">
              <label class="font-medium block mb-2">{{ t('evaluations.rating') }}</label>
              <pv-rating :modelValue="evaluation.rating" readonly :cancel="false" />
            </div>
            <div class="mb-3">
              <label class="font-medium block mb-2">{{ t('evaluations.comment') }}</label>
              <p>{{ evaluation.comment }}</p>
            </div>
            <div>
              <label class="font-medium block mb-2">{{ t('evaluations.checklist') }}</label>
              <ul class="list-none p-0 m-0">
                <li v-for="item in evaluation.artistChecklist" :key="item.id" class="mb-2">
                  <i :class="['pi', item.value ? 'pi-check-circle text-green-500' : 'pi-times-circle text-red-500', 'mr-2']" />
                  {{ item.label }}
                </li>
              </ul>
            </div>
          </template>
        </pv-card>
      </div>
    </div>
  </div>
</template>

<style scoped>
.artist-image {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--primary-100);
}

:deep(.p-card) {
  margin-bottom: 1rem;
  background: var(--surface-card);
  border-radius: 8px;
  box-shadow: 0 2px 1px -1px rgba(0,0,0,0.2);
}

:deep(.p-rating) {
  gap: 0.5rem;
}
</style> 