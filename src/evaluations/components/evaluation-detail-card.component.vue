<template>
  <pv-panel :header="event.name">
    <template #headericon>
      <pv-rating :modelValue="evaluation.rating" readonly :cancel="false" />
    </template>

    <div class="mb-3">
      <i class="pi pi-calendar mr-2" />
      {{ formattedDate }}
    </div>

    <div class="mb-3 white-space-pre-line">{{ evaluation.comment }}</div>

    <ul class="p-0 ml-2">
      <li v-for="item in evaluation.checklist" :key="item.id" class="mb-1">
        <i :class="['pi', item.value ? 'pi-check-circle text-green-500' : 'pi-times-circle text-red-500', 'mr-2']"/>
        {{ item.label }}
      </li>
    </ul>
  </pv-panel>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()

const props = defineProps({
  evaluation: { type: Object, required: true },
  event     : { type: Object, required: true }
})

const formattedDate = computed(() =>
    new Date(props.evaluation.createdAt).toLocaleDateString(locale.value, { weekday:'long', year:'numeric', month:'long', day:'numeric' })
)
</script>
