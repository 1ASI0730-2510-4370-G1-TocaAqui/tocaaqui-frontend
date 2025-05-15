<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { EventApplicationService } from '../services/event-application.service';
import EventCard from '../components/event-card.component.vue';

const router = useRouter();
const { t } = useI18n();
const eventApplicationService = new EventApplicationService();

const userApplications = ref([]);
const loading = ref(true);
const statusFilter = ref('');

// Usuario hardcodeado para pruebas (en una aplicación real vendría del sistema de autenticación)
const currentUserId = 1;

const statusOptions = [
  { label: t('eventApplications.allStatuses'), value: '' },
  { label: t('eventApplications.status.pending'), value: 'pending' },
  { label: t('eventApplications.status.accepted'), value: 'accepted' },
  { label: t('eventApplications.status.rejected'), value: 'rejected' }
];

const filteredApplications = computed(() => {
  if (!statusFilter.value) return userApplications.value;
  return userApplications.value.filter(application => application.status === statusFilter.value);
});

const fetchUserApplications = async () => {
  try {
    loading.value = true;
    // Obtener las postulaciones del usuario
    const applicants = await eventApplicationService.getUserApplications(currentUserId);
    
    // Obtener los detalles de los eventos correspondientes
    const eventPromises = applicants.map(applicant => 
      eventApplicationService.getById(applicant.eventId)
        .then(event => ({
          ...event,
          status: applicant.status,
          applicationDate: applicant.applicationDate,
          contractSigned: applicant.contractSigned,
          riderUploaded: applicant.riderUploaded
        }))
    );
    
    userApplications.value = await Promise.all(eventPromises);
  } catch (error) {
    console.error('Error fetching user applications:', error);
  } finally {
    loading.value = false;
  }
};

const viewApplicationDetail = (applicationId) => {
  router.push(`/applications/${applicationId}`);
};

onMounted(() => {
  fetchUserApplications();
});
</script>

<template>
  <div class="postulaciones-container">
    <div class="flex justify-content-between align-items-center mb-4">
      <h1 class="text-2xl font-bold">{{ $t('eventApplications.title') }}</h1>
      <pv-dropdown
        v-model="statusFilter"
        :options="statusOptions"
        optionLabel="label"
        optionValue="value"
        :placeholder="$t('eventApplications.allStatuses')"
        class="w-12rem"
      />
    </div>

    <div v-if="loading" class="flex justify-content-center">
      <pv-progress-spinner />
    </div>

    <div v-else-if="userApplications.length === 0" class="text-center">
      <pv-message severity="info" :closable="false">{{ $t('eventApplications.noApplications') }}</pv-message>
    </div>

    <div v-else class="grid">
      <div v-for="application in filteredApplications" :key="application.id" class="col-12 md:col-6 lg:col-4 xl:col-4">
        <event-card 
          :event="application"
          @view-detail="viewApplicationDetail"
        />
      </div>
    </div>
  </div>
</template>

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