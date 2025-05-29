<!-- @summary "Eventos confirmados" con estilo PrimeVue + borde azul -->
<script setup>
import { ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import EventService from '../services/event-calendar.service.js';

import Button from 'primevue/button';
import Tag    from 'primevue/tag';

const { t } = useI18n();
const confirmed = ref([]);

// Separar eventos principales de soundchecks
const mainEvents = computed(() => 
  confirmed.value.filter(ev => ev.eventType !== 'soundcheck')
);

const soundchecks = computed(() => 
  confirmed.value.filter(ev => ev.eventType === 'soundcheck')
);

onMounted(async () => confirmed.value = await EventService.getConfirmed());
</script>

<template>
  <section class="confirmed-wrapper">
    <h3 class="section-title">{{ t('calendar.legend.contractSigned') }}</h3>

    <!-- Eventos principales -->
    <div v-if="mainEvents.length > 0">
      <h4 class="subsection-title">{{ t('calendar.eventTypes.event') }}s</h4>
      <article
          v-for="ev in mainEvents"
          :key="ev.id"
          class="event-card"
      >
        <!-- datos -->
        <div>
          <h4 class="m-0">{{ ev.name }}</h4>
          <p class="m-0">{{ new Date(ev.date).toLocaleDateString() }}, {{ ev.time }}</p>
          <p class="m-0">{{ ev.location }}</p>

          <div class="mt-2 flex gap-2">
            <Tag :value="t('calendar.eventStatus.signed')" severity="success" v-if="ev.contractSigned" />
            <Tag :value="`Pago ${ev.paidPercent}%`" severity="info" v-if="ev.paidPercent" />
          </div>
        </div>

        <!-- acciones -->
        <div class="flex gap-3">
          <Button icon="pi pi-camera" text rounded severity="secondary" />
          <Button icon="pi pi-file"   text rounded severity="secondary" />
          <Button icon="pi pi-cog"    text rounded severity="secondary" />
        </div>
      </article>
    </div>

    <!-- Soundchecks -->
    <div v-if="soundchecks.length > 0" class="mt-4">
      <h4 class="subsection-title">{{ t('calendar.legend.soundchecks') }}</h4>
      <article
          v-for="ev in soundchecks"
          :key="ev.id"
          class="event-card soundcheck-card"
      >
        <!-- datos -->
        <div>
          <h4 class="m-0">
            <i class="pi pi-volume-up mr-2"></i>
            {{ ev.name.replace('🎵 Soundcheck: ', '') }}
          </h4>
          <p class="m-0">{{ new Date(ev.date).toLocaleDateString() }}, {{ ev.time }}</p>
          <p class="m-0">{{ ev.location }}</p>

          <div class="mt-2 flex gap-2">
            <Tag :value="t('calendar.eventTypes.soundcheck')" severity="info" />
            <Tag :value="t('calendar.eventStatus.signed')" severity="success" v-if="ev.contractSigned" />
          </div>
        </div>

        <!-- acciones -->
        <div class="flex gap-3">
          <Button icon="pi pi-volume-up" text rounded severity="info" />
          <Button icon="pi pi-clock" text rounded severity="secondary" />
        </div>
      </article>
    </div>

    <p v-if="!confirmed.length" class="text-secondary">- {{ t('schedule.noConfirmed') }} -</p>
  </section>
</template>

<style scoped>
.section-title {
  font-weight: 600;
  margin: 0 0 .75rem;
}

.subsection-title {
  font-weight: 500;
  margin: 1rem 0 .5rem;
  color: var(--text-color-secondary);
  font-size: 1rem;
}

.confirmed-wrapper {
  margin-top: 2rem;
}

.event-card {
  border: 3px solid var(--blue-400);
  border-radius: 6px;
  background: var(--surface-card);
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.soundcheck-card {
  border-color: var(--cyan-400);
  background: var(--cyan-50);
}

.soundcheck-card h4 {
  color: var(--cyan-700);
}
</style>
