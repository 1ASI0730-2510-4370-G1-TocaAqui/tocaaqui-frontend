<script setup>
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { evaluationService } from '@/evaluations/services/evaluation.service.js'
import EvaluationCard from '@/evaluations/components/evaluation-card.component.vue'

const router = useRouter()
const { t } = useI18n()

const evaluations = ref([])
const loading = ref(true)
const status = ref('all')

const statuses = [
  { label: t('evaluations.filters.all'),  value: 'all' },
  { label: t('evaluations.filters.done'), value: 'done' },
  { label: t('evaluations.filters.pending'), value: 'pending' }
]

const filtered = computed(() => {
  if (status.value === 'all') return evaluations.value
  if (status.value === 'done')    return evaluations.value.filter(e => e.comment)
  return evaluations.value.filter(e => !e.comment)
})

async function load () {
  loading.value = true
  evaluations.value = await evaluationService.getAll()
  loading.value = false
}

function openDetail (id) {
  router.push(`/evaluations/${id}`)
}

onMounted(load)
</script>

<template>
  <div class="p-4">
    <div class="flex justify-content-between align-items-center mb-4">
      <h2 class="text-2xl font-bold">{{ t('evaluations.title') }}</h2>

      <pv-dropdown v-model="status" :options="statuses" optionLabel="label" optionValue="value" />
    </div>

    <pv-progress-spinner v-if="loading" class="block mx-auto mt-6" />

    <div v-else class="grid">
      <div v-for="ev in filtered" :key="ev.id" class="col-12 md:col-6 lg:col-4">
        <evaluation-card
            :evaluation="ev"
            :event="ev.event"
            @view="openDetail"
        />
      </div>
    </div>
  </div>
</template>
