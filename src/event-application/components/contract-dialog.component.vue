<template>
  <pv-dialog
    v-model:visible="visible"
    modal
    header="Contrato del Evento"
    :style="{ width: '80vw' }"
    :closable="false"
  >
    <div class="contract-text">{{ contractText }}</div>
    <template #footer>
      <div class="flex justify-content-end gap-2">
        <pv-button
          label="Rechazar"
          icon="pi pi-times"
          @click="$emit('update:visible', false)"
          text
        />
        <pv-button
          label="Firmar y Aceptar"
          icon="pi pi-check"
          @click="handleSign"
          severity="success"
        />
      </div>
    </template>
  </pv-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { Contract } from '../model/event-application.model';
import { EventApplicationService } from '../services/event-application.service';

const props = defineProps<{
  visible: boolean;
  applicationId: string;
  contractText: string;
}>();

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void;
  (e: 'signed'): void;
}>();

const handleSign = async () => {
  try {
    await eventApplicationService.signContract(props.applicationId, 'firma-digital');
    emit('signed');
    emit('update:visible', false);
  } catch (error) {
    console.error('Error al firmar el contrato:', error);
  }
};
</script>

<style scoped>
.contract-text {
  font-family: 'Courier New', Courier, monospace;
  white-space: pre-wrap;
  background-color: var(--surface-100);
  padding: 1.5rem;
  border-radius: var(--border-radius);
}
</style> 