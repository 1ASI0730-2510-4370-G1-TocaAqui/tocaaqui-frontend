<script>
import { useI18n } from 'vue-i18n'

export default {
  name: 'language-toggle',
  setup() {
    const { t, locale } = useI18n()

    const languages = [
      { code: 'es', label: 'Español', icon: '🇪🇸' },
      { code: 'en', label: 'English', icon: '🇺🇸' }
    ]

    const toggleLanguage = () => {
      // Alternar entre es y en
      locale.value = locale.value === 'es' ? 'en' : 'es'
      // Guardar preferencia
      localStorage.setItem('language', locale.value)
    }

    return {
      t,
      locale,
      languages,
      toggleLanguage,
      currentLanguage: () => languages.find(lang => lang.code === locale.value)
    }
  }
}
</script>

<template>
  <pv-button
    :label="currentLanguage().icon"
    severity="secondary"
    text
    rounded
    @click="toggleLanguage"
    :aria-label="t('common.language')"
    class="language-toggle"
    v-tooltip.bottom="currentLanguage().label"
  />
</template>

<style scoped>
.language-toggle {
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

:deep(.p-button-label) {
  line-height: 1;
  font-size: 1.2rem;
}

:deep(.p-button.p-button-text) {
  background: var(--surface-ground);
}

:deep(.p-button.p-button-text:hover) {
  background: var(--surface-hover);
}
</style> 