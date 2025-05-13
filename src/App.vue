<script>
import LoginHome from './login/pages/login-home.component.vue';

export default {
  name: 'App',
  components: {
    LoginHome
  }
};
</script>

<template>
  <div id="app">
    <router-view />
  </div>
</template>

<style scoped>
</style>