<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { evaluationService } from '../services/evaluation.service.js'
import EvaluationDetailCard from '../components/evaluation-detail-card.component.vue'

const route = useRoute()
const router = useRouter()

const evaluation = ref(null)

onMounted(async () => {
  evaluation.value = await evaluationService.getById(route.params.id)
})

</script>

<template>
  <div class="p-4 max-w-screen-md mx-auto">
    <pv-button icon="pi pi-arrow-left" text @click="router.back()" class="mb-3" />

    <evaluation-detail-card
        v-if="evaluation"
        :evaluation="evaluation"
        :event="evaluation.event"
    />
    <pv-progress-spinner v-else class="block mx-auto mt-6" />
  </div>
</template>
