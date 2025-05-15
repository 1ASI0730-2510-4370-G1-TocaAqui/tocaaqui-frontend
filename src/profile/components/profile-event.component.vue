<script setup>
import { useI18n } from 'vue-i18n';
import { ref, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
import { ProfileService } from '../services/profile.service';

const { t } = useI18n();
const profileService = new ProfileService();
const showEditDialog = ref(false);
const formData = ref({
  id: null, // Se inicializa con null
  name: '',
  email: '',
  password: ''
});
const toast = useToast();

// Recibe el usuario desde el componente padre
const props = defineProps({
  user: {
    type: Object,
    required: true
  }
});

// Sincroniza los datos del usuario con formData
watch(
    () => props.user,
    (newUser) => {
      if (newUser) {
        formData.value.id = newUser.id;
        formData.value.name = newUser.name;
        formData.value.email = newUser.email;
        formData.value.role = newUser.role;
      }
    },
    { immediate: true }
);

const updateProfile = async () => {
  try {
    if (!formData.value.name || !formData.value.email) {
      throw new Error('Por favor, completa todos los campos del perfil.');
    }

    await profileService.updateProfile(formData.value);
    toast.add({ severity: 'success', summary: 'Éxito', detail: 'Perfil actualizado con éxito' });
    showEditDialog.value = false;
  } catch (error) {
    console.error('Error al actualizar el perfil:', error);
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo actualizar el perfil' });
  }
};
</script>

<template>
  <div>
    <pv-button
        :label="t('profile.editProfile')"
        icon="pi pi-user-edit"
        @click="showEditDialog = true"
    />

    <pv-dialog
        v-model:visible="showEditDialog"
        :header="t('profile.editProfile')"
        :style="{ width: '50vw' }"
        :closable="false"
    >
      <form @submit.prevent="updateProfile">
        <div class="p-fluid">
          <div class="field">
            <label for="name">{{ t('profile.name') }}</label>
            <pv-input-text id="name" v-model="formData.name" />
          </div>
          <div class="field">
            <label for="email">{{ t('profile.email') }}</label>
            <pv-input-text id="email" v-model="formData.email" />
          </div>
          <div class="field">
            <label for="password">{{ t('profile.password') }}</label>
            <pv-password id="password" v-model="formData.password" toggleMask />
          </div>
        </div>
        <div class="flex justify-content-end gap-2 mt-4">
          <pv-button
              :label="t('common.cancel')"
              icon="pi pi-times"
              text
              @click="showEditDialog = false"
          />
          <pv-button
              :label="t('common.save')"
              icon="pi pi-check"
              type="submit"
              severity="success"
          />
        </div>
      </form>
    </pv-dialog>
  </div>
</template>

<style>
.field {
  margin-bottom: 1rem;
}
</style>