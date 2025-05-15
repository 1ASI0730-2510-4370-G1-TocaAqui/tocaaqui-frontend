<!-- @summary “Eventos confirmados” con estilo PrimeVue + borde azul -->
<script setup>
import { ref, onMounted } from 'vue';
import EventService from '../../schedule/services/event-calendar.service.js';

import Button from 'primevue/button';
import Tag    from 'primevue/tag';

const confirmed = ref([]);

onMounted(async () => confirmed.value = await EventService.getConfirmed());
</script>

<template>
  <section class="confirmed-wrapper">
    <h3 class="section-title">Eventos Confirmados</h3>

    <article
        v-for="ev in confirmed"
        :key="ev.id"
        class="event-card"
    >
      <!-- datos -->
      <div>
        <h4 class="m-0">{{ ev.name }}</h4>
        <p class="m-0">{{ new Date(ev.date).toLocaleDateString() }}, {{ ev.time }}</p>
        <p class="m-0">{{ ev.location }}</p>

        <div class="mt-2 flex gap-2">
          <Tag value="Contrato firmado" severity="success" v-if="ev.contractSigned"  />
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

    <p v-if="!confirmed.length" class="text-secondary">- Sin eventos confirmados -</p>
  </section>
</template>

<style scoped>
.section-title{font-weight:600;margin:0 0 .75rem;}
.confirmed-wrapper{margin-top:2rem;}
.event-card{
  border:3px solid var(--blue-400);
  border-radius:6px;
  background:var(--surface-card);
  padding:1rem;
  display:flex;
  justify-content:space-between;
  align-items:flex-start;
  margin-bottom:1rem;
}
</style>
