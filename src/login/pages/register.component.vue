<script setup>
import { ref, computed } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useI18n } from 'vue-i18n';
import { RegisterEntity } from "../model/login.entity.js";
import { LoginService } from "../services/login.service.js";
import { useRouter } from 'vue-router';

// Composables
const { t } = useI18n();
const toast = useToast();
const router = useRouter();
const loginService = new LoginService();

// Datos del formulario
const name = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const selectedRole = ref(null);

// Campos específicos para músicos
const genre = ref('');
const type = ref('');
const description = ref('');
const imageFile = ref(null);
const uploadedImage = ref(null);

// Opciones para los dropdowns
const genreOptions = [
  'Rock', 'Pop', 'Jazz', 'Electrónica', 'Hip Hop', 'Reggaeton', 
  'Salsa', 'Cumbia', 'Clásica', 'Folk', 'Metal', 'Blues', 'Otro'
];

const typeOptions = [
  { label: t('register.typeOptions.soloist'), value: 'solista' },
  { label: t('register.typeOptions.band'), value: 'banda' }
];

// Computed properties
const isMusicianRole = computed(() => selectedRole.value === 'musico');
const isFormValid = computed(() => {
  const basicValid = name.value && email.value && password.value && 
                    confirmPassword.value && selectedRole.value &&
                    password.value === confirmPassword.value;
  
  if (isMusicianRole.value) {
    return basicValid && genre.value && type.value;
  }
  
  return basicValid;
});

// Métodos
const handleRegister = async () => {
  if (!isFormValid.value) {
    toast.add({ 
      severity: 'error', 
      summary: t('common.error'), 
      detail: t('register.validation.required'), 
      life: 3000 
    });
    return;
  }

  if (password.value !== confirmPassword.value) {
    toast.add({ 
      severity: 'error', 
      summary: t('common.error'), 
      detail: t('register.validation.passwordMismatch'), 
      life: 3000 
    });
    return;
  }

  const registerData = {
    name: name.value,
    email: email.value,
    password: password.value,
    role: selectedRole.value
  };

  // Agregar campos específicos para músicos
  if (isMusicianRole.value) {
    registerData.genre = genre.value;
    registerData.type = type.value;
    registerData.description = description.value;
    registerData.imageFile = imageFile.value;
  }

  const registerEntity = new RegisterEntity(
    registerData.name,
    registerData.email,
    registerData.password,
    registerData.role,
    registerData.genre,
    registerData.type,
    registerData.description,
    registerData.imageFile
  );

  try {
    const response = await loginService.register(registerEntity);
    toast.add({ 
      severity: 'success', 
      summary: t('common.success'), 
      detail: t('register.success'), 
      life: 3000 
    });
    
    setTimeout(() => {
      router.push('/login');
    }, 1500);
  } catch (error) {
    toast.add({ 
      severity: 'error', 
      summary: t('common.error'), 
      detail: error, 
      life: 3000 
    });
  }
};

const goToLogin = () => {
  router.push('/login');
};

const onImageSelect = (event) => {
  const file = event.files[0];
  if (file) {
    // Validar el tipo de archivo
    if (!file.type.startsWith('image/')) {
      toast.add({
        severity: 'error',
        summary: t('common.error'),
        detail: t('register.validation.invalidImageType'),
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
        detail: t('register.validation.imageTooLarge'),
        life: 3000
      });
      return;
    }

    imageFile.value = file;
    
    // Crear URL temporal para previsualización
    if (uploadedImage.value) {
      URL.revokeObjectURL(uploadedImage.value);
    }
    uploadedImage.value = URL.createObjectURL(file);
  }
};

const clearImage = () => {
  if (uploadedImage.value) {
    URL.revokeObjectURL(uploadedImage.value);
  }
  uploadedImage.value = null;
  imageFile.value = null;
};
</script>

<template>
  <div class="form-container">
    <div class="register-box">
      <div class="logo">
        <img src="../../assets/logo-oscuro.png" alt="Toca Aquí" />
      </div>
      <h2 class="text-center">{{ $t('register.title') }}</h2>

      <!-- Selección de rol -->
      <div class="p-field text-center mb-4">
        <label class="block mb-2 text-left font-semibold">{{ $t('register.selectRole') }} *</label>
        <div class="role-buttons">
          <pv-button
              :outlined="selectedRole !== 'musico'"
              :severity="selectedRole === 'musico' ? 'primary' : null"
              :label="$t('register.musician')"
              icon="pi pi-heart"
              icon-pos="top"
              @click="selectedRole = 'musico'"
          />
          <pv-button
              :outlined="selectedRole !== 'promotor'"
              :severity="selectedRole === 'promotor' ? 'primary' : null"
              :label="$t('register.promoter')"
              icon="pi pi-user"
              icon-pos="top"
              @click="selectedRole = 'promotor'"
          />
        </div>
      </div>

      <div class="p-fluid">
        <!-- Campos básicos -->
        <div class="grid">
          <div class="col-12">
            <div class="p-field mb-3">
              <label for="name">{{ $t('register.name') }} *</label>
              <pv-input-text
                  id="name"
                  v-model="name"
                  :placeholder="$t('register.placeholders.name')"
                  class="w-full"
              />
            </div>
          </div>

          <div class="col-12">
            <div class="p-field mb-3">
              <label for="email">{{ $t('register.email') }} *</label>
              <pv-input-text
                  id="email"
                  v-model="email"
                  :placeholder="$t('register.placeholders.email')"
                  class="w-full"
                  type="email"
              />
            </div>
          </div>

          <div class="col-12 md:col-6">
            <div class="p-field mb-3">
              <label for="password">{{ $t('register.password') }} *</label>
              <pv-password
                  id="password"
                  v-model="password"
                  toggleMask
                  :placeholder="$t('register.placeholders.password')"
                  input-class="w-full"
              />
            </div>
          </div>

          <div class="col-12 md:col-6">
            <div class="p-field mb-3">
              <label for="confirmPassword">{{ $t('register.confirmPassword') }} *</label>
              <pv-password
                  id="confirmPassword"
                  v-model="confirmPassword"
                  toggleMask
                  :placeholder="$t('register.placeholders.confirmPassword')"
                  input-class="w-full"
                  :feedback="false"
              />
            </div>
          </div>
        </div>

        <!-- Campos específicos para músicos -->
        <div v-if="isMusicianRole" class="musician-fields">
          <h3 class="text-lg font-semibold mb-3 text-primary">{{ $t('register.musicalInfo') }}</h3>
          
          <div class="grid">
            <div class="col-12 md:col-6">
              <div class="p-field mb-3">
                <label for="genre">{{ $t('register.genre') }} *</label>
                <pv-dropdown
                    id="genre"
                    v-model="genre"
                    :options="genreOptions"
                    :placeholder="$t('register.placeholders.genre')"
                    class="w-full"
                />
              </div>
            </div>

            <div class="col-12 md:col-6">
              <div class="p-field mb-3">
                <label for="type">{{ $t('register.type') }} *</label>
                <pv-dropdown
                    id="type"
                    v-model="type"
                    :options="typeOptions"
                    optionLabel="label"
                    optionValue="value"
                    :placeholder="$t('register.placeholders.type')"
                    class="w-full"
                />
              </div>
            </div>

            <div class="col-12">
              <div class="p-field mb-3">
                <label for="description">{{ $t('register.description') }}</label>
                <pv-textarea
                    id="description"
                    v-model="description"
                    :placeholder="$t('register.placeholders.description')"
                    rows="3"
                    class="w-full"
                />
              </div>
            </div>

            <div class="col-12">
              <div class="p-field mb-3">
                <label>{{ $t('register.profilePhoto') }}</label>
                <div v-if="!uploadedImage" class="image-upload-area">
                  <pv-file-upload
                      mode="basic"
                      accept="image/*"
                      :maxFileSize="5000000"
                      @select="onImageSelect"
                      :chooseLabel="$t('register.selectImage')"
                      class="w-full"
                  />
                  <small class="text-500">{{ $t('register.maxSize') }}</small>
                </div>
                <div v-else class="uploaded-image">
                  <img :src="uploadedImage" alt="Preview" class="image-preview" />
                  <pv-button 
                    icon="pi pi-times" 
                    @click="clearImage"
                    class="p-button-rounded p-button-danger p-button-sm"
                    style="position: absolute; top: 5px; right: 5px;"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Información para promotores -->
        <div v-if="selectedRole === 'promotor'" class="promoter-info">
          <div class="p-3 mb-3 border-round" style="background: var(--blue-50); border: 1px solid var(--blue-200);">
            <h4 class="text-blue-700 mt-0">{{ $t('register.promoterInfo') }}</h4>
            <p class="text-blue-600 mb-0">
              {{ $t('register.promoterDescription') }}
            </p>
          </div>
        </div>

        <!-- Botones -->
        <div class="mt-4">
          <pv-button 
            :label="$t('register.createAccount')" 
            class="w-full mb-3" 
            @click="handleRegister"
            :disabled="!isFormValid"
          />
          
          <div class="text-center">
            <p class="text-600 mb-2">{{ $t('register.hasAccount') }}</p>
            <pv-button 
              :label="$t('register.goToLogin')" 
              class="w-full" 
              @click="goToLogin"
              outlined
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.form-container {
  display: flex;
  min-height: 100vh;
  max-width: 800px;
  margin: auto;
  padding: 2rem;
  align-items: center;
}

.register-box {
  background-color: var(--surface-card);
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  margin: auto;
}

.role-buttons {
  display: flex;
  gap: 1rem;
  width: 100%;
}

.role-buttons > * {
  flex: 1;
  padding: 1.5rem 0.5rem;
  font-size: 0.95rem;
}

.p-field {
  margin-bottom: 1rem;
}

.p-field label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text-color);
}

.logo {
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.text-center {
  text-align: center;
}

.logo img {
  max-width: 100px;
  max-height: 100px;
  width: auto;
  height: auto;
}

h2 {
  margin-bottom: 2rem;
  color: var(--text-color);
}

.musician-fields {
  border-top: 1px solid var(--surface-200);
  padding-top: 1.5rem;
  margin-top: 1rem;
}

.image-upload-area {
  border: 2px dashed var(--surface-300);
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
  transition: border-color 0.3s;
}

.image-upload-area:hover {
  border-color: var(--primary-color);
}

.uploaded-image {
  position: relative;
  display: inline-block;
}

.image-preview {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
  border: 2px solid var(--surface-200);
}

.promoter-info {
  margin-top: 1rem;
}

@media (max-width: 768px) {
  .form-container {
    padding: 1rem;
  }
  
  .register-box {
    padding: 1.5rem;
  }
  
  .role-buttons {
    flex-direction: column;
  }
}
</style> 