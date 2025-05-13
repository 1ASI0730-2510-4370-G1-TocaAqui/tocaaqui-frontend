<script>
import { ref } from 'vue';
import { LoginEntity, RegisterEntity } from "../model/login.entity.js";
import LoginService from "../services/login.service.js";
import {Button as PvButton} from "primevue";

export default {
  name: "login-home",
  components: {PvButton},
  setup() {
    const name = ref('');
    const email = ref('');
    const password = ref('');
    const selectedRole = ref(null);
    const errorMessage = ref('');
    const successMessage = ref('');

    const handleLogin = async () => {
      const loginEntity = new LoginEntity(name.value, email.value, password.value, selectedRole.value);
      try {
        const user = await LoginService.login(loginEntity);

        successMessage.value = `Inicio de sesión exitoso. Bienvenid@, ${user.name}`;
        errorMessage.value = '';
        console.log('Login exitoso:', user);
      } catch (error) {
        errorMessage.value = error;
        successMessage.value = '';
      }
    };

    const handleRegister = async () => {
      if (!name.value || !email.value || !password.value || !selectedRole.value) {
        errorMessage.value = 'Todos los campos son obligatorios';
        return;
      }

      const registerEntity = new RegisterEntity(name.value, email.value, password.value, selectedRole.value);
      try {
        const response = await LoginService.register(registerEntity);
        successMessage.value = 'Registro exitoso';
        errorMessage.value = '';
        console.log('Registro exitoso:', response);
      } catch (error) {
        errorMessage.value = error;
      }
    };

    return {
      name,
      email,
      password,
      selectedRole,
      errorMessage,
      successMessage,
      handleLogin,
      handleRegister
    };
  }
};
</script>

<template>
  <div class="form-container">
    <div class="logo">
      <img src="../../assets/vue.svg" alt="Toca Aquí" />
    </div>
    <h2 class="text-center">Bienvenido</h2>

    <div class="p-field text-center mb-4">
      <label class="block mb-2">Selecciona tu rol</label>
      <div class="p-buttonset">
        <pv-button
            :outlined="selectedRole !== 'musico'"
            :severity="selectedRole === 'musico' ? 'primary' : null"
            label="Músico / Banda"
            icon="pi pi-user"
            @click="selectedRole = 'musico'"
        />
        <pv-button
            :outlined="selectedRole !== 'promotor'"
            :severity="selectedRole === 'promotor' ? 'primary' : null"
            label="Promotor / Espacio"
            icon="pi pi-building"
            @click="selectedRole = 'promotor'"
        />
      </div>
    </div>

    <div class="p-fluid">
      <div class="p-field mb-3">
        <label for="name">Nombre</label>
        <pv-input-text id="name" v-model="name" placeholder="Ingrese su nombre" />
      </div>

      <div class="p-field mb-3">
        <label for="email">Correo electrónico</label>
        <pv-input-text
            id="email"
            v-model="email"
            placeholder="Ingrese su correo electrónico"
        />
      </div>

      <div class="p-field mb-4">
        <label for="password">Contraseña</label>
        <pv-password
            id="password"
            v-model="password"
            toggleMask
            placeholder="Ingrese su contraseña"
        />
      </div>

      <pv-button label="Registrarse" class="w-full" @click="handleRegister" />
      <pv-button label="Iniciar sesión" class="w-full mt-2" @click="handleLogin" />

      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
      <p v-if="successMessage" class="success">{{ successMessage }}</p>
    </div>
  </div>
</template>

<style scoped>
.form-container {
  max-width: 400px;
  margin: 0 auto;
  padding: 2rem;
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
  color: red;
  margin-top: 1rem;
}
.success {
  color: green;
  margin-top: 1rem;
}
</style>