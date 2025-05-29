<!-- src/schedule/components/month-grid.component.vue                 -->
<!-- @summary Calendario mensual con cabecera dinámica y eventos  -->
<!-- @author Juan Paul Llamccaya Arone                               -->
<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import EventService from '../services/event-calendar.service.js'

const { locale, t } = useI18n()
const router = useRouter()
const pivot = ref(new Date())           // Inicializar con la fecha actual
const events = ref([])                  // eventos del usuario
const isLoading = ref(false)            // estado de carga

/* ---------- helpers ---------- */
const MS_IN_DAY = 86_400_000            // milisegundos en un día

const monthYear = computed(() => {
  const date = pivot.value
  const month = date.toLocaleString(locale.value, { month: 'long' })
  // Capitalizar primera letra del mes
  const capitalizedMonth = month.charAt(0).toUpperCase() + month.slice(1)
  return `${capitalizedMonth} ${date.getFullYear()}`
})

const days = computed(() => {
  const date = new Date(pivot.value.getFullYear(), pivot.value.getMonth(), 1)
  const firstDayOfMonth = date.getDay()  // 0-6 (domingo-sábado)
  const daysInMonth = new Date(pivot.value.getFullYear(), pivot.value.getMonth() + 1, 0).getDate()
  const daysInPrevMonth = new Date(pivot.value.getFullYear(), pivot.value.getMonth(), 0).getDate()
  
  const result = []
  
  // Días del mes anterior
  for (let i = firstDayOfMonth; i > 0; i--) {
    const d = new Date(pivot.value.getFullYear(), pivot.value.getMonth() - 1, daysInPrevMonth - i + 1)
    result.push({ date: d, isCurrentMonth: false })
  }
  
  // Días del mes actual
  for (let i = 1; i <= daysInMonth; i++) {
    const d = new Date(pivot.value.getFullYear(), pivot.value.getMonth(), i)
    result.push({ date: d, isCurrentMonth: true })
  }
  
  // Días del mes siguiente
  const remainingDays = 42 - result.length // 6 filas x 7 días
  for (let i = 1; i <= remainingDays; i++) {
    const d = new Date(pivot.value.getFullYear(), pivot.value.getMonth() + 1, i)
    result.push({ date: d, isCurrentMonth: false })
  }
  
  return result
})

const dayEvents = computed(() => {
  const eventMap = new Map()
  events.value.forEach(event => {
    console.log('Procesando evento:', event)
    // Asegurarnos de que la fecha se procese en la zona horaria local
    const eventDate = new Date(event.date + 'T00:00:00')
    const dateStr = eventDate.toISOString().split('T')[0]
    console.log('Fecha original del evento:', event.date)
    console.log('Fecha procesada del evento:', dateStr)
    console.log('Día de la semana:', eventDate.getDay())
    if (!eventMap.has(dateStr)) {
      eventMap.set(dateStr, [])
    }
    eventMap.get(dateStr).push(event)
  })
  console.log('Mapa de eventos:', Object.fromEntries(eventMap))
  return eventMap
})

/* ---------- navegación (crear NUEVA fecha) ---------- */
function prevWeek () {
  const newDate = new Date(pivot.value)
  newDate.setMonth(newDate.getMonth() - 1)
  pivot.value = newDate
}

function nextWeek () {
  const newDate = new Date(pivot.value)
  newDate.setMonth(newDate.getMonth() + 1)
  pivot.value = newDate
}

function goToToday() {
  pivot.value = new Date()
  loadEvents() // Recargar eventos para el mes actual
}

/* ---------- helpers para fechas ---------- */
function getDateString(date) {
  return date.toISOString().split('T')[0]
}

/* ---------- tooltip para eventos ---------- */
function getEventTooltip(event) {
  const { t } = useI18n()
  
  if (event.eventType === 'soundcheck') {
    return `🎵 ${t('calendar.tooltip.soundcheck')}: ${event.name.replace('🎵 Soundcheck: ', '')}
${t('calendar.tooltip.time')}: ${event.time}
${t('calendar.tooltip.location')}: ${event.location}
${t('calendar.tooltip.type')}: ${t('calendar.eventTypes.soundcheck')}`
  } else {
    const statusKey = event.applicationStatus === 'signed' ? 'signed' : 
                     event.applicationStatus === 'contract_pending' ? 'contract_pending' : 'pending'
    return `${event.name}
${t('calendar.tooltip.time')}: ${event.time}
${t('calendar.tooltip.location')}: ${event.location}
${t('calendar.tooltip.status')}: ${t('calendar.eventStatus.' + statusKey)}
${t('calendar.tooltip.contract')}: ${event.applicationStatus === 'signed' ? t('calendar.eventStatus.signed') : t('calendar.eventStatus.pending')}`
  }
}

/* ---------- cargar eventos ---------- */
async function loadEvents() {
  try {
    isLoading.value = true
    console.log('Iniciando carga de eventos...')
    const loadedEvents = await EventService.getAll()
    console.log('Eventos cargados en el calendario:', loadedEvents)
    if (loadedEvents.length === 0) {
      console.log('No se encontraron eventos. Verificar:')
      console.log('1. ¿Hay un usuario en localStorage?')
      console.log('2. ¿El usuario tiene postulaciones aceptadas?')
      console.log('3. ¿Los eventos existen en la base de datos?')
    }
    events.value = loadedEvents
  } catch (error) {
    console.error('Error al cargar eventos:', error)
  } finally {
    isLoading.value = false
  }
}

// Cargar eventos al montar el componente
onMounted(() => {
  loadEvents()
})

// Watcher para recargar eventos cuando cambie el mes (opcional, para optimización futura)
watch(pivot, () => {
  // Por ahora mantenemos la carga de todos los eventos
  // En el futuro se podría optimizar para cargar solo eventos del mes actual
}, { deep: true })
</script>


<template>
  <div class="week-wrapper surface-card border-round-lg p-4 mb-5">
    <!-- CABECERA DINÁMICA -->
    <div class="header flex justify-content-between align-items-center mb-2">
      <div class="month-chip">{{ monthYear }}</div>
      <div class="flex gap-2 navigation-buttons align-items-center">
        <pv-button icon="pi pi-chevron-left" text @click="prevWeek" :disabled="isLoading" />
        <pv-button :label="$t('calendar.today')" 
                  class="today-button" 
                  @click="goToToday"
                  severity="secondary"
                  size="small"
                  :disabled="isLoading" />
        <pv-button icon="pi pi-chevron-right" text @click="nextWeek" :disabled="isLoading" />
        <pv-button 
          icon="pi pi-refresh" 
          text 
          @click="loadEvents" 
          :disabled="isLoading"
          :loading="isLoading"
          v-tooltip.top="$t('calendar.refresh')" />
      </div>
    </div>

    <!-- Indicador de carga -->
    <div v-if="isLoading" class="loading-container flex justify-content-center align-items-center mb-3">
      <pv-progress-spinner size="small" />
      <span class="ml-2">{{ $t('calendar.loading') }}</span>
    </div>

    <!-- Mensaje cuando no hay eventos -->
    <div v-else-if="events.length === 0" class="no-events-message text-center mb-3">
      <i class="pi pi-calendar text-4xl text-300 mb-2"></i>
      <p class="text-500 m-0 mb-2">{{ $t('calendar.noEvents.title') }}</p>
      <small class="text-400">
        {{ $t('calendar.noEvents.description') }}
        <br>• {{ $t('calendar.noEvents.requirements.apply') }}
        <br>• {{ $t('calendar.noEvents.requirements.accepted') }}
      </small>
      <div class="mt-3">
        <pv-button 
          :label="$t('calendar.noEvents.searchButton')" 
          icon="pi pi-search" 
          size="small" 
          @click="router.push('/search')"
          outlined />
      </div>
    </div>

    <!-- Leyenda (solo mostrar si hay eventos) -->
    <div v-else class="legend flex align-items-center gap-4 mb-3">
      <div class="legend-item flex align-items-center gap-2">
        <div class="legend-color event-contract-pending-color"></div>
        <span class="text-sm">{{ $t('calendar.legend.contractPending') }}</span>
      </div>
      <div class="legend-item flex align-items-center gap-2">
        <div class="legend-color event-signed-color"></div>
        <span class="text-sm">{{ $t('calendar.legend.contractSigned') }}</span>
      </div>
      <div class="legend-item flex align-items-center gap-2">
        <div class="legend-color soundcheck-color"></div>
        <span class="text-sm">{{ $t('calendar.legend.soundchecks') }}</span>
      </div>
    </div>

    <!-- rejilla 7 columnas -->
    <div class="grid-7">
      <span
          v-for="d in [
            $t('calendar.weekDays.sunday'),
            $t('calendar.weekDays.monday'),
            $t('calendar.weekDays.tuesday'),
            $t('calendar.weekDays.wednesday'),
            $t('calendar.weekDays.thursday'),
            $t('calendar.weekDays.friday'),
            $t('calendar.weekDays.saturday')
          ]"
          :key="d"
          class="day-name"
      >{{ d }}</span>

      <div
          v-for="d in days"
          :key="d.date.toISOString()"
          class="day-cell"
          :class="{ 
            'week-end': [0,6].includes(d.date.getDay()),
            'other-month': !d.isCurrentMonth
          }"
      >
        <span class="date-number">{{ d.date.getDate() }}</span>
        <!-- Eventos del día -->
        <div class="events-container" v-if="dayEvents.get(getDateString(d.date))">
          <div 
            v-for="event in dayEvents.get(getDateString(d.date))" 
            :key="event.id"
            class="event-chip"
            :class="{ 
              'event-contract-pending': event.eventType === 'event' && event.applicationStatus === 'contract_pending',
              'event-signed': event.eventType === 'event' && event.applicationStatus === 'signed',
              'soundcheck': event.eventType === 'soundcheck'
            }"
            :title="getEventTooltip(event)"
          >
            <i v-if="event.eventType === 'soundcheck'" class="pi pi-volume-up mr-1" style="font-size: 0.7rem;"></i>
            <i v-else-if="event.applicationStatus === 'signed'" class="pi pi-check-circle mr-1" style="font-size: 0.7rem;"></i>
            <i v-else-if="event.applicationStatus === 'contract_pending'" class="pi pi-clock mr-1" style="font-size: 0.7rem;"></i>
            <i v-else class="pi pi-hourglass mr-1" style="font-size: 0.7rem;"></i>
            {{ event.eventType === 'soundcheck' ? event.name.replace('🎵 Soundcheck: ', '') : event.name }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.header { 
  min-height: 2.5rem;
  position: relative;
  z-index: 1;
}
.month-chip {
  padding: .25rem .75rem;
  border-radius: 4px;
  font-weight: 900;
  font-size: 1.85rem;
}
.navigation-buttons {
  z-index: 1;
  gap: 0.5rem;
}
.today-button {
  min-width: 70px;
  font-weight: 600;
}
.grid-7 {
  display: grid;
  grid-template-columns: repeat(7,1fr);
  gap: 1px;
  background: var(--surface-border);
  position: relative;
  z-index: 2;
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
  flex-direction: column;
  padding: 0.5rem;
  background:var(--surface-card);
}
.date-number {
  font-size: 1rem;
  margin-bottom: 0.5rem;
}
.events-container {
  flex: 1;
  overflow-y: auto;
  font-size: 0.75rem;
}
.event-chip {
  background: var(--primary-200);
  color: var(--primary-700);
  padding: 0.2rem 0.5rem;
  border-radius: 3px;
  margin-bottom: 0.2rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
}
.event-contract-pending {
  background: var(--orange-200);
  color: var(--orange-700);
  border-left: 3px solid var(--orange-500);
}
.event-signed {
  background: var(--green-200);
  color: var(--green-700);
  border-left: 3px solid var(--green-500);
}
.soundcheck {
  background: var(--blue-200);
  color: var(--blue-700);
  border-left: 3px solid var(--blue-500);
}
.event-chip:hover {
  transform: scale(1.02);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
.week-end{ background:var(--surface-50);}
.other-month {
  opacity: 0.5;
}
.legend {
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--surface-200);
}

.legend-item {
  display: flex;
  align-items: center;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 4px;
}

.event-contract-pending-color {
  background: var(--orange-200);
  border-left: 3px solid var(--orange-500);
}

.event-signed-color {
  background: var(--green-200);
  border-left: 3px solid var(--green-500);
}

.soundcheck-color {
  background: var(--blue-200);
  border-left: 3px solid var(--blue-500);
}

.loading-container {
  padding: 1rem;
  background: var(--surface-50);
  border-radius: 8px;
  border: 1px solid var(--surface-200);
}

.no-events-message {
  padding: 2rem;
  background: var(--surface-50);
  border-radius: 8px;
  border: 1px solid var(--surface-200);
}

.no-events-message i {
  display: block;
  margin-bottom: 0.5rem;
}
</style>


