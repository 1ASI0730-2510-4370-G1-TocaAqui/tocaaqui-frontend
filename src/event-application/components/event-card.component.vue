<script setup>
import { useI18n } from 'vue-i18n';
import { computed } from 'vue';

const { t, locale } = useI18n();

const props = defineProps({
  event: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['view-detail']);

const formattedDate = computed(() => {
  if (!props.event.date) return '';
  return new Date(props.event.date).toLocaleDateString(locale.value, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

const getStatusSeverity = (status) => {
  const severities = {
    pending: 'warning',
    accepted: 'success',
    rejected: 'danger'
  };
  return severities[status] || 'info';
};
</script>

<template>
  <div class="relative">
    <img 
      :src="event.imageUrl || '/default-event.jpg'" 
      :alt="event.name"
      class="w-full h-15rem border-round-top-xl"
      style="object-fit: cover;"
    />
    <div class="absolute top-0 right-0 m-2">
      <pv-tag 
        :value="$t(`eventApplications.status.${event.status}`)"
        :severity="getStatusSeverity(event.status)"
        class="font-semibold"
      />
    </div>
  </div>
  
  <div class="p-4">
    <h2 class="text-xl font-bold mb-2 text-900">{{ event.name }}</h2>
    
    <div class="flex align-items-center mb-2">
      <i class="pi pi-calendar mr-2 text-500"></i>
      <span class="text-600">{{ formattedDate }}</span>
    </div>
    
    <div class="flex align-items-center mb-3">
      <i class="pi pi-map-marker mr-2 text-500"></i>
      <span class="text-600">{{ event.location }}</span>
    </div>

    <pv-button 
      @click="$emit('view-detail', event.id)"
      :label="$t('eventApplications.viewApplication')"
      icon="pi pi-eye"
      class="w-full p-button-outlined"
    />
  </div>
</template>

<style scoped>
.h-15rem {
  height: 15rem;
}
</style> 