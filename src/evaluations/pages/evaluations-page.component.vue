<script setup>
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { EvaluationService } from '../services/evaluation.service';
import { useRouter } from 'vue-router';
import VenueRating from '../components/venue-rating.component.vue';

const router = useRouter();
const { t } = useI18n();
const evaluationService = new EvaluationService();

const events = ref([]);
const selectedEvent = ref(null);
const loading = ref(true);
const user = ref(JSON.parse(localStorage.getItem('user')));

const goToEvaluatedEvents = () => {
  router.push('/evaluations/venues/evaluated');
};

const fetchEvents = async () => {
  try {
    loading.value = true;
    events.value = await evaluationService.getAllEvents();
  } catch (error) {
    console.error('Error fetching events:', error);
  } finally {
    loading.value = false;
  }
};

const startEvaluation = (event) => {
  selectedEvent.value = {
    ...event,
    rating: 0,
    comment: '',
    evaluationId: event.evaluationId || event.id // Usa el ID del evento si no hay evaluationId
  };
};

const saveEvaluation = async () => {
  try {
    const evaluationData = {
      userId: user.value.id,
      eventId: selectedEvent.value.id,
      eventName: selectedEvent.value.name,
      eventDate: selectedEvent.value.date,
      eventLocation: selectedEvent.value.location,
      eventImageUrl: selectedEvent.value.imageUrl,
      rating: selectedEvent.value.rating,
      comment: selectedEvent.value.comment,
      suggestions: selectedEvent.value.suggestions || '',
      type: 'venue'
    };

    await evaluationService.saveEvaluation(evaluationData);
    console.log("Evaluación creada con éxito.");
    cancelEvaluation(); // Limpia el estado después de guardar
  } catch (error) {
    console.error("Error saving evaluation:", error);
  }
};

const cancelEvaluation = () => {
  selectedEvent.value = null;
};

onMounted(() => {
  fetchEvents();
});
</script>

<template>
  <div class="p-4">
    <pv-button
        label="Ver eventos evaluados"
        icon="pi pi-list"
        class="mb-4"
        @click="goToEvaluatedEvents"
    />
    <h2 class="text-2xl font-bold mb-4">{{ t('evaluations.title') }}</h2>

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
        <div v-if="events.length === 0" class="text-center p-4">
          <i class="pi pi-info-circle text-4xl text-500 mb-3"></i>
          <h3 class="text-xl mb-2">{{ t('evaluations.noEventsToEvaluate') }}</h3>
          <p class="text-500">{{ t('evaluations.noEventsDescription') }}</p>
        </div>
        <div v-else class="grid">
          <div v-for="event in events" :key="event.id" class="col-12 md:col-6 lg:col-4">
            <pv-card>
              <template #header>
                <img :src="event.imageUrl || '/default-event.jpg'" alt="Event Image" class="w-full h-15rem" />
              </template>
              <template #content>
                <h3 class="text-xl font-bold">{{ event.name }}</h3>
                <p>{{ event.location }}</p>
                <p>{{ new Date(event.date).toLocaleDateString() }}</p>
                <pv-tag 
                  value="Pago Completado" 
                  severity="success" 
                  class="mt-2"
                  icon="pi pi-check-circle" 
                />
              </template>
              <template #footer>
                <pv-button label="Evaluar" icon="pi pi-star" @click="startEvaluation(event)" />
              </template>
            </pv-card>
          </div>
        </div>
      </div>

      <div v-else>
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
        <div class="flex justify-content-end gap-2 mt-4">
          <pv-button label="Cancelar" icon="pi pi-times" @click="cancelEvaluation" class="p-button-outlined" />
          <pv-button label="Guardar" icon="pi pi-save" @click="saveEvaluation" class="p-button-success" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.h-15rem {
  height: 15rem;
  object-fit: cover;
}
</style>