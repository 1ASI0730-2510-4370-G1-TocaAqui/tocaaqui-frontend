<script setup>
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import { evaluationService } from '../services/evaluation.service';
import { useI18n } from 'vue-i18n';

const route = useRoute();
const { t } = useI18n();

const evaluation = ref(null);
const venueRating = ref(0);
const venueComment = ref('');
const loading = ref(true);
const error = ref(null);

const fetchEvaluation = async () => {
  try {
    loading.value = true;
    evaluation.value = await evaluationService.getById(route.params.eventId, route.params.evaluationId);
    venueRating.value = evaluation.value.venueRating || 0;
    venueComment.value = evaluation.value.venueComment || '';
  } catch (err) {
    error.value = t('evaluationDetail.errorLoading');
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const submitVenueRating = async () => {
  try {
    await evaluationService.saveEvaluation(route.params.eventId, evaluation.value.id, {
      venueRating: venueRating.value,
      venueComment: venueComment.value
    });
    alert(t('evaluationDetail.ratingSuccess'));
  } catch (err) {
    console.error(err);
    alert(t('evaluationDetail.ratingError'));
  }
};

fetchEvaluation();
</script>

<template>
  <div v-if="loading" class="flex justify-content-center">
    <pv-progress-spinner />
  </div>
  <div v-else-if="error" class="text-center">
    <pv-message severity="error" :closable="false">{{ error }}</pv-message>
  </div>
  <div v-else>
    <pv-panel :header="evaluation.event.name">
      <div class="mb-3">
        <h3>{{ t('evaluationDetail.rateVenue') }}</h3>
        <pv-rating v-model="venueRating" :cancel="false" />
        <pv-textarea v-model="venueComment" :placeholder="t('evaluationDetail.commentPlaceholder')" rows="3" />
        <pv-button label="Enviar" icon="pi pi-check" @click="submitVenueRating" class="mt-2" />
      </div>
    </pv-panel>
  </div>
</template>

<style scoped>
.mb-3 {
  margin-bottom: 1rem;
}
</style>