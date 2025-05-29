<script setup>
import { ref } from 'vue';
import { eventApplicationService } from '../services/event-application.service';

const props = defineProps({
  visible: {
    type: Boolean,
    required: true
  },
  applicationId: {
    type: String,
    required: true
  },
  contractText: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['update:visible', 'signed']);

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

<style scoped>
.contract-text {
  font-family: 'Courier New', Courier, monospace;
  white-space: pre-wrap;
  background-color: var(--surface-100);
  padding: 1.5rem;
  border-radius: var(--border-radius);
}
</style> 