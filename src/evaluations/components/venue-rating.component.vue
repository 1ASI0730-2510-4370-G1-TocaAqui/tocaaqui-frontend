<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  venue: {
    type: Object,
    required: true
  },
  rating: {
    type: Number,
    default: 0
  },
  comment: {
    type: String,
    default: ''
  },
  suggestions: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['update']);

const localRating = ref(props.rating);
const localComment = ref(props.comment);
const localSuggestions = ref(props.suggestions);

// Emitir cambios automáticamente cuando se modifican los valores
const updateData = () => {
  emit('update', {
    rating: localRating.value,
    comment: localComment.value,
    suggestions: localSuggestions.value
  });
};

// Watchers para actualizar automáticamente
watch(localRating, updateData);
watch(localComment, updateData);
watch(localSuggestions, updateData);

// Emitir datos iniciales
updateData();
</script>

<template>
  <div class="venue-rating p-4">
    <div class="flex align-items-center justify-content-between mb-4">
      <div class="flex align-items-center">
        <img :src="venue.imageUrl || '/default-event.jpg'" :alt="venue.name" class="venue-photo mr-3" />
        <div>
          <h3 class="text-xl font-bold mb-2">{{ venue.name }}</h3>
          <p class="text-500">Evalúa tu experiencia en este evento</p>
        </div>
      </div>
      <pv-tag value="Evaluando" severity="info" icon="pi pi-map-marker" />
    </div>

    <div class="mb-4">
      <label class="block font-medium mb-2">Calificación del evento</label>
      <pv-rating v-model="localRating" :stars="5" :cancel="false" />
    </div>

    <div class="mb-4">
      <label class="block font-medium mb-2">Comentario sobre el evento</label>
      <pv-textarea
        v-model="localComment"
        placeholder="Escribe un comentario sobre tu experiencia en este evento..."
        rows="3"
        class="w-full"
      />
    </div>

    <div class="mb-6">
      <label class="block font-medium mb-2">Sugerencias para mejorar</label>
      <pv-textarea
        v-model="localSuggestions"
        placeholder="Comparte sugerencias para mejorar la experiencia en futuros eventos..."
        rows="3"
        class="w-full"
      />
    </div>
  </div>
</template>

<style scoped>
.venue-photo {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

:deep(.p-rating) {
  gap: 0.5rem;
}

:deep(.p-rating .p-rating-icon) {
  font-size: 1.2rem;
}

:deep(.p-rating .p-rating-icon.pi-star-fill) {
  color: var(--yellow-400);
}

:deep(.p-inputtextarea) {
  border-radius: 8px;
  border: 1px solid var(--surface-300);
  transition: border-color 0.2s;
}

:deep(.p-inputtextarea:focus) {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(var(--primary-color-rgb), 0.2);
}
</style>