<script setup>
import { ref } from 'vue';

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

const saveRating = () => {
  emit('update', {
    rating: localRating.value,
    comment: localComment.value,
    suggestions: localSuggestions.value
  });
};
</script>

<template>
  <div class="venue-rating">
    <img :src="venue.imageUrl" :alt="venue.name" class="venue-photo" />
    <h3>{{ venue.name }}</h3>
    <pv-rating v-model="localRating" :stars="5" :cancel="false" />
    <textarea
        v-model="localComment"
        placeholder="Escribe un comentario..."
        class="comment-box">
    </textarea>
    <textarea
        v-model="localSuggestions"
        placeholder="Escribe tus sugerencias..."
        class="suggestion-box">
    </textarea>
    <pv-button
        label="Confirmar cambios"
        icon="pi pi-save"
        @click="saveRating"
    />
  </div>
</template>

<style scoped>
.venue-photo {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 1rem;
}
.comment-box, .suggestion-box {
  width: 100%;
  height: 80px;
  margin-top: 1rem;
  padding: 0.5rem;
  border: 1px solid var(--surface-border);
  border-radius: var(--border-radius);
}
</style>