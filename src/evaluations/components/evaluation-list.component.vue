<script setup>
import { ref, onMounted } from 'vue';
import { evaluationService } from '../services/evaluation.service';
import VenueRating from '../components/venue-rating.component.vue';

const evaluations = ref([]);
const loading = ref(true);
const error = ref(null);

const fetchEvaluations = async () => {
  try {
    loading.value = true;
    evaluations.value = await evaluationService.getAll();
  } catch (err) {
    error.value = 'Error al cargar las evaluaciones.';
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const updateEvaluation = async (id, rating, comment) => {
  try {
    const updatedEvaluation = await evaluationService.updateVenueRating(id, rating, comment);
    const index = evaluations.value.findIndex(e => e.id === id);
    if (index !== -1) evaluations.value[index] = updatedEvaluation;
  } catch (err) {
    console.error('Error al actualizar la evaluación:', err);
  }
};

onMounted(() => {
  fetchEvaluations();
});
</script>

<template>
  <div>
    <div v-if="loading" class="flex justify-content-center">
      <pv-progress-spinner />
    </div>
    <div v-else-if="error" class="text-center">
      <pv-message severity="error">{{ error }}</pv-message>
    </div>
    <div v-else>
      <div v-for="evaluation in evaluations" :key="evaluation.id" class="mb-4">
        <venue-rating
            :venue="selectedEvent"
            :rating="selectedEvent.rating"
            :comment="selectedEvent.comment"
            :suggestions="selectedEvent.suggestions"
            @update="(data) => {
                selectedEvent.rating = data.rating;
                selectedEvent.comment = data.comment;
                selectedEvent.suggestions = data.suggestions;
            }"
        />
      </div>
    </div>
  </div>
</template>