<template>
  <div class="relative">
    <img 
      :src="event.imageUrl || '/default-event.jpg'" 
      :alt="event.eventName"
      class="w-full h-15rem border-round-top-xl"
      style="object-fit: cover;"
    />
    <div class="absolute top-0 right-0 m-2">
      <pv-tag 
        :value="getStatusLabel(event.status)"
        :severity="getStatusSeverity(event.status)"
        class="font-semibold"
      />
    </div>
  </div>
  
  <div class="p-4">
    <h2 class="text-xl font-bold mb-2 text-900">{{ event.eventName }}</h2>
    
    <div class="flex align-items-center mb-2">
      <i class="pi pi-calendar mr-2 text-500"></i>
      <span class="text-600">{{ formatDate(event.eventDate) }}</span>
    </div>
    
    <div class="flex align-items-center mb-3">
      <i class="pi pi-map-marker mr-2 text-500"></i>
      <span class="text-600">{{ event.location }}</span>
    </div>

    <pv-button 
      @click="$emit('view-detail', event.id)"
      label="Ver postulación"
      icon="pi pi-eye"
      class="w-full p-button-outlined"
    />
  </div>
</template>

<script setup lang="ts">
import type { EventApplication } from '../model/event-application.model';

const props = defineProps<{
  event: EventApplication
}>();

const emit = defineEmits<{
  (e: 'view-detail', id: string): void
}>();

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });
};

const getStatusLabel = (status: string) => {
  const labels = {
    pending: 'Pendiente',
    accepted: 'Aceptado',
    rejected: 'Rechazado'
  };
  return labels[status as keyof typeof labels] || status;
};

const getStatusSeverity = (status: string) => {
  const severities = {
    pending: 'warning',
    accepted: 'success',
    rejected: 'danger'
  };
  return severities[status as keyof typeof severities] || 'info';
};
</script>

<style scoped>
.h-15rem {
  height: 15rem;
}
</style> 