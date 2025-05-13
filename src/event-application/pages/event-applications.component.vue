<template>
  <div class="postulaciones-container">
    <div class="flex justify-content-between align-items-center mb-4">
      <h1 class="text-2xl font-bold">Solicitudes de Eventos</h1>
      <pv-dropdown
        v-model="statusFilter"
        :options="statusOptions"
        optionLabel="label"
        optionValue="value"
        placeholder="Todos los eventos"
        class="w-12rem"
      />
    </div>

    <div v-if="loading" class="flex justify-content-center">
      <pv-progress-spinner />
    </div>

    <div v-else-if="applications.length === 0" class="text-center">
      <pv-message severity="info" :closable="false">No hay eventos disponibles</pv-message>
    </div>

    <div v-else class="grid">
      <div v-for="event in filteredEvents" :key="event.id" class="col-12 md:col-6 lg:col-4 xl:col-4">
        <event-card 
          :event="event"
          @view-detail="viewApplicationDetail"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { EventApplication } from '../model/event-application.model';
import { EventApplicationService } from '../services/event-application.service';
import EventCard from '../components/event-card.component.vue';

const router = useRouter();
const { t } = useI18n();
const eventApplicationService = new EventApplicationService();

const applications = ref([]);
const loading = ref(true);
const statusFilter = ref('');

const statusOptions = [
  { label: t('event.status.all'), value: '' },
  { label: t('event.status.pending'), value: 'pending' },
  { label: t('event.status.accepted'), value: 'accepted' },
  { label: t('event.status.rejected'), value: 'rejected' }
];

const filteredEvents = computed(() => {
  if (!statusFilter.value) return applications.value;
  return applications.value.filter(event => event.status === statusFilter.value);
});

const fetchEvents = async () => {
  try {
    loading.value = true;
    applications.value = await eventApplicationService.getAll();
  } catch (error) {
    console.error('Error fetching events:', error);
  } finally {
    loading.value = false;
  }
};

const viewApplicationDetail = (eventId) => {
  router.push(`/applications/${eventId}`);
};

onMounted(() => {
  fetchEvents();
});
</script>

<style scoped>
.postulaciones-container {
  padding: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
}

:deep(.p-dropdown) {
  background: var(--surface-card);
}

:deep(.p-tag) {
  font-size: 0.875rem;
  padding: 0.3rem 0.75rem;
}

.h-15rem {
  height: 15rem;
}
</style> 