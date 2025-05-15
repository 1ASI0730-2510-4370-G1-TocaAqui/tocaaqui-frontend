<!-- src/schedule/components/week-grid.component.vue                 -->
<!-- @summary Calendario semanal con cabecera estática “Abril 2025”  -->
<!-- @author Juan Paul Llamccaya Arone                               -->
<script setup>
import { ref, computed } from 'vue'

const pivot = ref(new Date())           // ancla de la semana

/* ---------- helpers ---------- */
const MS_IN_DAY = 86_400_000            // milisegundos en un día

const days = computed(() => {
  const start = new Date(pivot.value)
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7)) // lunes
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    return d
  })
})

/* ---------- navegación (crear NUEVA fecha) ---------- */
function prevWeek () {
  pivot.value = new Date(pivot.value.getTime() - 7 * MS_IN_DAY)
}
function nextWeek () {
  pivot.value = new Date(pivot.value.getTime() + 7 * MS_IN_DAY)
}
</script>


<template>
  <div class="week-wrapper surface-card border-round-lg p-4 mb-5">
    <!-- CABECERA ESTÁTICA -->
    <div class="header flex justify-content-between align-items-center mb-2">
      <div class="month-chip">2025 ,Abril</div>
      <div class="flex gap-">
        <pv-button icon="pi pi-chevron-left"  text @click="prevWeek" />
        <pv-button icon="pi pi-chevron-right" text @click="nextWeek" />
      </div>
    </div>

    <!-- rejilla 7 columnas -->
    <div class="grid-7">
      <span
          v-for="d in ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom']"
          :key="d"
          class="day-name"
      >{{ d }}</span>

      <span
          v-for="d in days"
          :key="d.toISOString()"
          class="day-cell"
          :class="{ 'week-end': [6,0].includes(d.getDay()) }"
      >
        {{ d.getDate() }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.header      { min-height:2.5rem; }
.month-chip  {
  padding:.25rem .75rem;
  border-radius:4px;
  font-weight:900;
  font-size: 1.85rem;
}
.grid-7{
  display:grid;
  grid-template-columns:repeat(7,1fr);
  gap:1px;
  background:var(--surface-border);
}
.day-name{
  text-align:center;
  font-weight:600;
  font-size:.8rem;
  padding:.3rem 0;
  background:var(--surface-ground);
}
.day-cell{
  aspect-ratio:1/1;
  display:flex;
  align-items:center;
  justify-content:center;
  background:var(--surface-card);
}
.week-end{ background:var(--surface-50);}
</style>
