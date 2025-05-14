<script setup>
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const isDarkMode = ref(false);

const toggleTheme = () => {
  isDarkMode.value = !isDarkMode.value;
  document.documentElement.classList.toggle('my-app-dark');
  localStorage.setItem('theme', isDarkMode.value ? 'dark' : 'light');
};

onMounted(() => {
  // Recuperar la preferencia del tema del localStorage
  const savedTheme = localStorage.getItem('theme');
  isDarkMode.value = savedTheme === 'dark';
  if (isDarkMode.value) {
    document.documentElement.classList.add('my-app-dark');
  }
});
</script>

<template>
  <pv-button
    :icon="isDarkMode ? 'pi pi-sun' : 'pi pi-moon'"
    severity="secondary"
    text
    rounded
    @click="toggleTheme"
    :aria-label="t(isDarkMode ? 'common.lightMode' : 'common.darkMode')"
  />
</template>

<style>
:root {
  &.dark {
    color-scheme: dark;
  }
}

:deep(.p-button) {
  width: 2.5rem;
  height: 2.5rem;
  border: 1px solid var(--surface-border);
  border-radius: 50%;
  transition: all 0.2s ease;
}

:deep(.p-button:hover) {
  background: var(--surface-hover);
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

:deep(.p-button .pi) {
  font-size: 1.2rem;
}

:deep(.p-button.p-button-text) {
  background: var(--surface-ground);
}

:deep(.p-button.p-button-text:hover) {
  background: var(--surface-hover);
}
</style>    