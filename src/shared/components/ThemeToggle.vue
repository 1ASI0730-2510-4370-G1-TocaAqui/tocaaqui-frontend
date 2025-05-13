<script>
export default {
  name: 'theme-toggle',
  data() {
    return {
      isDarkMode: false
    }
  },
  mounted() {
    // Recuperar la preferencia guardada o usar la preferencia del sistema
    const savedTheme = localStorage.getItem('theme')
    this.isDarkMode = savedTheme === 'dark' || 
      (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)
    
    // Aplicar tema inicial
    if (this.isDarkMode) {
      document.documentElement.classList.add('app-dark')
    }
  },
  methods: {
    toggleTheme() {
      this.isDarkMode = !this.isDarkMode
      document.documentElement.classList.toggle('app-dark')
      localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light')
    }
  }
}
</script>

<template>
  <pv-button
    :icon="isDarkMode ? 'pi pi-sun' : 'pi pi-moon'"
    severity="secondary"
    text
    rounded
    @click="toggleTheme"
    :aria-label="isDarkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'"
    class="theme-toggle"
  />
</template>

<style scoped>
.theme-toggle {
  font-family: 'Archivo', sans-serif;
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