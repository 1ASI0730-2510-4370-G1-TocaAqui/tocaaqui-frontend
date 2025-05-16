<script setup>
import { useI18n } from 'vue-i18n';
import { ref, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import { ProfileService } from '../services/profile.service';

const { t } = useI18n();
const user = ref(null);
const showEditCard = ref(false);
const toast = useToast();
const showForm = ref(false);
const profileService = new ProfileService();
const previewImage = ref(null);
const fileInput = ref(null);

// Opciones para los dropdowns
const genreOptions = [
  { label: 'Rock', value: 'Rock' },
  { label: 'Pop', value: 'Pop' },
  { label: 'Jazz', value: 'Jazz' },
  { label: 'Electrónica', value: 'Electrónica' },
  { label: 'Hip Hop', value: 'Hip Hop' },
  { label: 'Reggaeton', value: 'Reggaeton' },
  { label: 'Salsa', value: 'Salsa' },
  { label: 'Cumbia', value: 'Cumbia' },
  { label: 'Clásica', value: 'Clásica' },
  { label: 'Folk', value: 'Folk' },
  { label: 'Metal', value: 'Metal' },
  { label: 'Blues', value: 'Blues' },
  { label: 'Otro', value: 'Otro' }
];

const typeOptions = [
  { label: t('profile.soloist'), value: 'solista' },
  { label: t('profile.band'), value: 'banda' }
];

// Datos del formulario
const formData = ref({
  id: null,
  name: '',
  email: '',
  password: '',
  role: '',
  genre: '',
  type: '',
  description: '',
  imageUrl: '',
  imageFile: null
});

const fetchUser = () => {
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    user.value = JSON.parse(storedUser);
    formData.value = { ...user.value, password: '' };
  }
};

const handleImageUpload = async (event) => {
  const file = event.target.files[0];
  if (file) {
    // Validar el tipo de archivo
    if (!file.type.startsWith('image/')) {
      toast.add({
        severity: 'error',
        summary: t('common.error'),
        detail: t('profile.invalidImageType'),
        life: 3000
      });
      return;
    }

    // Validar el tamaño del archivo (máximo 5MB)
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_SIZE) {
      toast.add({
        severity: 'error',
        summary: t('common.error'),
        detail: t('profile.imageTooLarge'),
        life: 3000
      });
      return;
    }

    formData.value.imageFile = file;
    
    // Crear URL temporal para previsualización
    if (previewImage.value) {
      URL.revokeObjectURL(previewImage.value);
    }
    previewImage.value = URL.createObjectURL(file);
  }
};

const handleUpdate = async () => {
  try {
    const updatedUser = await profileService.updateProfile(formData.value);
    user.value = updatedUser;
    localStorage.setItem('user', JSON.stringify(updatedUser));
    
    // Emitir evento de actualización de perfil
    window.dispatchEvent(new CustomEvent('profile-updated', { detail: updatedUser }));
    
    toast.add({ 
      severity: 'success', 
      summary: t('common.success'), 
      detail: t('profile.successUpdate'), 
      life: 3000 
    });
    showEditCard.value = false;
    
    // Limpiar la imagen temporal
    if (previewImage.value) {
      URL.revokeObjectURL(previewImage.value);
      previewImage.value = null;
    }
  } catch (error) {
    toast.add({ 
      severity: 'error', 
      summary: t('common.error'), 
      detail: t('profile.errorUpdate'), 
      life: 3000 
    });
  }
};

const cancelEdit = () => {
  showEditCard.value = false;
  formData.value = { ...user.value, password: '' };
  if (previewImage.value) {
    URL.revokeObjectURL(previewImage.value);
    previewImage.value = null;
  }
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
        <div v-if="user" class="grid">
          <!-- Imagen de perfil -->
          <div class="col-12 md:col-4 flex flex-column align-items-center">
            <div class="profile-image-container mb-3">
              <img 
                :src="user.imageUrl || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'" 
                :alt="user.name"
                class="profile-image"
              />
            </div>
          </div>

          <!-- Información del perfil -->
          <div class="col-12 md:col-8">
            <div class="grid">
              <div class="col-12 mb-3">
                <p class="text-sm text-gray-500">{{ t('profile.name') }}</p>
                <p class="text-xl font-medium">{{ user.name }}</p>
              </div>

              <div class="col-12 mb-3">
                <p class="text-sm text-gray-500">{{ t('profile.email') }}</p>
                <p class="text-xl">{{ user.email }}</p>
              </div>

              <div class="col-12 mb-3">
                <p class="text-sm text-gray-500">{{ t('profile.role') }}</p>
                <p class="text-xl">{{ user.role }}</p>
              </div>

              <template v-if="user.role === 'musico'">
                <div class="col-12 mb-3">
                  <p class="text-sm text-gray-500">{{ t('profile.genre') }}</p>
                  <p class="text-xl">{{ user.genre || t('profile.notSpecified') }}</p>
                </div>

                <div class="col-12 mb-3">
                  <p class="text-sm text-gray-500">{{ t('profile.type') }}</p>
                  <p class="text-xl">{{ user.type || t('profile.notSpecified') }}</p>
                </div>

                <div class="col-12">
                  <p class="text-sm text-gray-500">{{ t('profile.description') }}</p>
                  <p class="text-xl">{{ user.description || t('profile.notSpecified') }}</p>
                </div>
              </template>
            </div>

            <div class="flex justify-content-end mt-4">
              <pv-button 
                v-if="!showEditCard"
                @click="showEditCard = true"
                :label="t('profile.editProfile')"
                icon="pi pi-user-edit"
              />
            </div>
          </div>
        </div>
      </template>
    </pv-card>

    <!-- Diálogo de edición -->
    <pv-dialog 
      v-model:visible="showEditCard"
      :header="t('profile.editProfile')"
      :modal="true"
      :style="{ width: '50vw' }"
      :closable="false"
    >
      <div class="grid p-fluid">
        <!-- Imagen de perfil -->
        <div class="col-12 flex flex-column align-items-center mb-4">
          <div class="profile-image-container mb-3">
            <img 
              :src="previewImage || user?.imageUrl || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'" 
              :alt="user?.name"
              class="profile-image"
            />
          </div>
          <pv-button 
            icon="pi pi-upload" 
            @click="$refs.fileInput.click()"
            :label="t('profile.uploadPhoto')"
            text
          />
          <input 
            ref="fileInput"
            type="file"
            accept="image/*"
            class="hidden"
            @change="handleImageUpload"
          />
        </div>

        <!-- Campos de edición -->
        <div class="col-12 md:col-6 mb-3">
          <span class="p-float-label">
            <pv-input-text id="name" v-model="formData.name" />
            <label for="name">{{ t('profile.name') }}</label>
          </span>
        </div>

        <div class="col-12 md:col-6 mb-3">
          <span class="p-float-label">
            <pv-input-text id="email" v-model="formData.email" />
            <label for="email">{{ t('profile.email') }}</label>
          </span>
        </div>

        <template v-if="user?.role === 'musico'">
          <div class="col-12 md:col-6 mb-3">
            <span class="p-float-label">
              <pv-dropdown
                id="genre"
                v-model="formData.genre"
                :options="genreOptions"
                optionLabel="label"
                optionValue="value"
              />
              <label for="genre">{{ t('profile.genre') }}</label>
            </span>
          </div>

          <div class="col-12 md:col-6 mb-3">
            <span class="p-float-label">
              <pv-dropdown
                id="type"
                v-model="formData.type"
                :options="typeOptions"
                optionLabel="label"
                optionValue="value"
              />
              <label for="type">{{ t('profile.type') }}</label>
            </span>
          </div>

          <div class="col-12 mb-3">
            <span class="p-float-label">
              <pv-textarea
                id="description"
                v-model="formData.description"
                rows="5"
                autoResize
              />
              <label for="description">{{ t('profile.description') }}</label>
            </span>
          </div>
        </template>

        <div class="col-12">
          <span class="p-float-label">
            <pv-password
              id="password"
              v-model="formData.password"
              :feedback="false"
              toggleMask
            />
            <label for="password">{{ t('profile.password') }}</label>
          </span>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-content-end gap-2">
          <pv-button
            :label="t('common.cancel')"
            icon="pi pi-times"
            @click="cancelEdit"
            text
          />
          <pv-button
            :label="t('common.save')"
            icon="pi pi-check"
            @click="handleUpdate"
          />
        </div>
      </template>
    </pv-dialog>
  </div>
</template>

<style scoped>
.profile-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
}

.profile-image-container {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid var(--primary-color);
}

.profile-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hidden {
  display: none;
}

:deep(.p-float-label) {
  display: block;
}

:deep(.p-inputtext),
:deep(.p-dropdown),
:deep(.p-password),
:deep(.p-textarea) {
  width: 100%;
}
</style>

