<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { EvaluationService } from '../services/evaluation.service';

const router = useRouter();
const evaluationService = new EvaluationService();
const evaluatedEvents = ref([]);
const loading = ref(true);
const error = ref(null);

const fetchEvaluatedEvents = async () => {
  try {
    loading.value = true;
    evaluatedEvents.value = await evaluationService.getEvaluatedEvents();
  } catch (err) {
    error.value = 'Error al cargar los eventos evaluados.';
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const goBack = () => {
  router.push('/evaluations');
};

onMounted(() => {
  fetchEvaluatedEvents();
});
</script>

<template>
  <div>
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
    <div v-else>
      <div v-for="event in evaluatedEvents" :key="event.id" class="mb-4">
        <pv-card>
          <template #header>
            <img :src="event.imageUrl || '/default-event.jpg'" alt="Event Image" class="w-full h-15rem" />
            <h3>{{ event.name }}</h3>
          </template>
          <template #content>
            <p><strong>Fecha:</strong> {{ new Date(event.date).toLocaleDateString() }}</p>
            <p><strong>Ubicación:</strong> {{ event.location }}</p>
            <p><strong>Comentario:</strong> {{ event.comment }}</p>
            <p><strong>Sugerencias:</strong> {{ event.suggestions }}</p>
            <pv-rating :modelValue="event.rating" readonly :cancel="false" />
          </template>
        </pv-card>
      </div>
    </div>
  </div>
</template>

<style scoped>
.mb-4 {
  margin-bottom: 1rem;
}
</style>