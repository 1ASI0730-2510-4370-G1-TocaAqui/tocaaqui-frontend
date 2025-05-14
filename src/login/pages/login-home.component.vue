<script setup>
import { ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import { LoginEntity, RegisterEntity } from "../model/login.entity.js";
import { LoginService } from "../services/login.service.js";
import { useRouter } from 'vue-router';

const name = ref('');
const email = ref('');
const password = ref('');
const selectedRole = ref(null);
const toast = useToast();
const router = useRouter();
const loginService = new LoginService();

const handleLogin = async () => {
  const loginEntity = new LoginEntity(name.value, email.value, password.value, selectedRole.value);
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

const handleRegister = async () => {
  if (!name.value || !email.value || !password.value || !selectedRole.value) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Todos los campos son obligatorios', life: 3000 });
    return;
  }

  const registerEntity = new RegisterEntity(name.value, email.value, password.value, selectedRole.value);
  try {
    const response = await loginService.register(registerEntity);
    toast.add({ severity: 'success', summary: 'Éxito', detail: 'Registro exitoso', life: 3000 });
    await handleLogin();
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: error, life: 3000 });
  }
};
</script>

<template>
  <div class="form-container">
    <div class="login-box">
      <div class="logo">
        <img src="../../assets/logo-oscuro.png" alt="Toca Aquí" />
      </div>
      <h2 class="text-center">Bienvenido</h2>

      <div class="p-field text-center mb-4">
        <label class="block mb-2 text-left">Selecciona tu rol</label>
        <div class="role-buttons">
          <pv-button
              :outlined="selectedRole !== 'musico'"
              :severity="selectedRole === 'musico' ? 'primary' : null"
              label="Músico / Banda"
              icon="pi pi-headphones"
              icon-pos="top"
              @click="selectedRole = 'musico'"
          />
          <pv-button
              :outlined="selectedRole !== 'promotor'"
              :severity="selectedRole === 'promotor' ? 'primary' : null"
              label="Promotor / Espacio"
              icon="pi pi-user"
              icon-pos="top"
              @click="selectedRole = 'promotor'"
          />
        </div>
      </div>

      <div class="p-fluid">
        <div class="p-field mb-3">
          <label for="name">Nombre</label>
          <pv-input-text
              id="name"
              v-model="name"
              placeholder="Ingrese su nombre"
              class="w-full"/>
        </div>

        <div class="p-field mb-3">
          <label for="email">Correo electrónico</label>
          <pv-input-text
              id="email"
              v-model="email"
              placeholder="Ingrese su correo electrónico"
              class="w-full"
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
          />
        </div>

        <pv-button label="Registrarse" class="w-full" @click="handleRegister" />
        <pv-button label="Iniciar sesión" class="w-full mt-2" @click="handleLogin" />
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
  max-width: 600px;
  margin: auto;
  padding: 2rem;
}

.login-box {
  background-color: var(--surface-card);
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  margin: auto;
  max-height: 700px;
}

.role-buttons {
  display: flex;
  gap: 1rem;
  width: 100%;
}

.role-buttons > * {
  flex: 1;
  padding: 2rem 0.5rem;
  font-size: 1rem;
}

.p-password {
  width: 100% !important;
}

.p-field {
  margin-bottom: 1.5rem;
}

.p-field label {
  display: block;
  margin-bottom: 0.5rem;
}

.logo {
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
}

.text-center {
  text-align: center;
}

.error {
  color: var(--red-500);
  margin-top: 1rem;
}

.success {
  color: var(--green-500);
  margin-top: 1rem;
}

.logo img {
  max-width: 100px;
  max-height: 100px;
  width: auto;
  height: auto;
}
</style>