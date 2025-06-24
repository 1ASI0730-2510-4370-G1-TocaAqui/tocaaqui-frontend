<script setup>
import { ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import { LoginEntity } from "../model/login.entity.js";
import { LoginService } from "../services/login.service.js";
import { useRouter } from 'vue-router';

const email = ref('');
const password = ref('');
const toast = useToast();
const router = useRouter();
const loginService = new LoginService();

const handleLogin = async () => {
  if (!email.value || !password.value) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Email y contraseña son obligatorios', life: 3000 });
    return;
  }

  const loginEntity = new LoginEntity(email.value, password.value);
  try {
    const user = await loginService.login(loginEntity);
    toast.add({ severity: 'success', summary: 'Éxito', detail: `Bienvenid@, ${user.name}`, life: 3000 });
    setTimeout(() => {
      router.push('/dashboard');
    }, 100);
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: error, life: 3000 });
  }
};

const goToRegister = () => {
  router.push('/register');
};
</script>

<template>
  <div class="form-container">
    <div class="login-box">
      <div class="logo">
        <img src="../../assets/logo-oscuro.png" alt="Toca Aquí" />
      </div>
      <h2 class="text-center">Iniciar Sesión</h2>

      <div class="p-fluid">
        <div class="p-field mb-3">
          <label for="email">Correo electrónico</label>
          <pv-input-text
              id="email"
              v-model="email"
              placeholder="Ingrese su correo electrónico"
              class="w-full"
              type="email"
          />
        </div>

        <div class="p-field mb-4">
          <label for="password">Contraseña</label>
          <pv-password
              id="password"
              v-model="password"
              toggleMask
              placeholder="Ingrese su contraseña"
              input-class="w-full"
              :feedback="false"
          />
        </div>

        <pv-button 
          label="Iniciar sesión" 
          class="w-full mb-3" 
          @click="handleLogin" 
          :loading="false"
        />
        
        <div class="text-center">
          <p class="text-600 mb-2">¿No tienes una cuenta?</p>
          <pv-button 
            label="Registrarse" 
            class="w-full" 
            @click="goToRegister"
            outlined
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style>
:root {
  &.dark {
    .login-box {
      background-color: var(--surface-card);
    }
  }
}

.form-container {
  display: flex;
  height: 100vh;
  max-width: 500px;
  margin: auto;
  padding: 2rem;
  align-items: center;
}

.login-box {
  background-color: var(--surface-card);
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  margin: auto;
}

.p-field {
  margin-bottom: 1.5rem;
}

.p-field label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
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
  max-width: 120px;
  max-height: 120px;
  width: auto;
  height: auto;
}

h2 {
  margin-bottom: 2rem;
  color: var(--text-color);
}
</style>