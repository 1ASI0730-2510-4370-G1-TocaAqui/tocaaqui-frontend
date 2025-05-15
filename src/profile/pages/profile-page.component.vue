<script setup>
import { useI18n } from 'vue-i18n';
import { ref, onMounted } from 'vue';
import ProfileEvent from '../components/profile-event.component.vue';
import { useToast } from 'primevue/usetoast';

const { t } = useI18n();
const user = ref(null);
const showEditCard = ref(false);
const toast = useToast();
const showForm = ref(false);


const fetchUser = () => {
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    user.value = JSON.parse(storedUser);
  }
};

const handleUpdate = (updatedUser) => {
  user.value = updatedUser;
  toast.add({ severity: 'success', summary: 'Éxito', detail: 'Perfil actualizado correctamente', life: 3000 });
  showEditCard.value = false;
};

onMounted(fetchUser);
</script>

<template>
  <div class="profile-container">
    <pv-card>
      <template #title>
        <h2 class="text-xl font-semibold text-gray-800">{{ t('profile.title') }}</h2>
      </template>

      <template #content>
        <div v-if="user" class="space-y-4 text-left text-gray-700">
          <div>
            <p class="text-sm text-gray-500">{{ t('profile.name') }}</p>
            <p class="text-base">{{ user.name }}</p>
          </div>

          <pv-divider />

          <div>
            <p class="text-sm text-gray-500">{{ t('profile.email') }}</p>
            <p class="text-base">{{ user.email }}</p>
          </div>

          <pv-divider />

          <div>
            <p class="text-sm text-gray-500">{{ t('profile.email') }}</p>
            <p class="text-base">{{ user.role }}</p>
          </div>
        </div>
      </template>
    </pv-card>

    <div class="mt-4">
      <ProfileEvent :user="user" />
    </div>
  </div>
</template>

<style scoped>
.profile-container {
  max-width: 700px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
}
</style>

