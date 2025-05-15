<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import MusicianEventApplications from './musician-event-applications.component.vue';
import PromoterEventCreation from './promoter-event-creation.component.vue';

const router = useRouter();
const { t } = useI18n();

// Get user from localStorage
const user = ref(null);
const userRole = computed(() => user.value?.role || '');

onMounted(() => {
  try {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      user.value = JSON.parse(storedUser);
    }
  } catch (error) {
    console.error('Error parsing user from localStorage:', error);
  }
});
</script>

<template>
  <div class="applications-container">
    <!-- Show different components based on user role -->
    <template v-if="userRole === 'musico'">
      <musician-event-applications />
    </template>
    
    <template v-else-if="userRole === 'promotor'">
      <promoter-event-creation />
    </template>
    
    <!-- Fallback if no role or unknown role -->
    <div v-else class="text-center">
      <pv-message severity="error" :closable="false">
        {{ $t('common.error') }}: {{ $t('eventApplications.noApplications') }}
      </pv-message>
    </div>
  </div>
</template>

<style scoped>
.applications-container {
  padding: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
}
</style>