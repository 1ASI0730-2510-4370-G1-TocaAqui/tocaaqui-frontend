<script setup>
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps({
  artist: {
    type: Object,
    required: true
  },
  event: {
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
  }
});

const emit = defineEmits(['update']);

const localRating = ref(props.rating);
const localComment = ref(props.comment);
const checklist = ref([
  { id: 'punctual', label: t('evaluations.checklistItems.punctual'), value: false }
]);

// Emitir cambios automáticamente cuando se modifican los valores
const updateData = () => {
  emit('update', {
    rating: localRating.value,
    comment: localComment.value,
    checklist: checklist.value
  });
};

// Watchers para actualizar automáticamente
watch(localRating, updateData);
watch(localComment, updateData);
watch(checklist, updateData, { deep: true });

// Emitir datos iniciales
updateData();
</script>

<template>
  <div class="artist-rating p-4">
    <div class="flex align-items-center justify-content-between mb-4">
      <div class="flex align-items-center">
        <img :src="artist.imageUrl || 'default-artist.jpg'" :alt="artist.name" class="artist-photo mr-3" />
        <div>
          <h3 class="text-xl font-bold mb-2">{{ artist.name }}</h3>
          <p class="text-500">{{ event.name }} - {{ new Date(event.date).toLocaleDateString() }}</p>
        </div>
      </div>
      <pv-tag value="Evaluando" severity="info" icon="pi pi-star" />
    </div>

    <div class="mb-4">
      <label class="block font-medium mb-2">{{ t('evaluations.rating') }}</label>
      <pv-rating v-model="localRating" :stars="5" :cancel="false" />
    </div>

    <div class="mb-4">
      <label class="block font-medium mb-2">{{ t('evaluations.comment') }}</label>
      <pv-textarea
        v-model="localComment"
        :placeholder="`Evalúa tu experiencia con ${artist.name}`"
        rows="3"
        class="w-full"
      />
    </div>

    <div class="mb-6">
      <label class="block font-medium mb-2">{{ t('evaluations.checklist') }}</label>
      <div class="flex flex-column gap-3">
        <div class="flex align-items-center p-3 border-1 border-200 border-round transition-colors transition-duration-200 hover:bg-primary-50">
          <pv-checkbox v-model="checklist[0].value" :binary="true" :id="checklist[0].id" />
          <label :for="checklist[0].id" class="ml-2 font-medium">{{ checklist[0].label }}</label>
        </div>
      </div>
    </div>


  </div>
</template>

<style scoped>
.artist-photo {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
}

:deep(.p-rating) {
  gap: 0.5rem;
}

:deep(.p-checkbox) {
  margin-right: 0.5rem;
}
</style> 