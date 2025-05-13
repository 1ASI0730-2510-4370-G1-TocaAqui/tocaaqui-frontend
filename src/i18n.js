import { createI18n } from 'vue-i18n'
import es from './locales/es.json'
import en from './locales/en.json'

// Obtener el idioma guardado o usar el del navegador
const savedLanguage = localStorage.getItem('language')
const browserLanguage = navigator.language.split('-')[0]
const defaultLanguage = savedLanguage || (browserLanguage === 'es' ? 'es' : 'en')

const i18n = createI18n({
    legacy: false,
    locale: defaultLanguage,
    fallbackLocale: 'en',
    messages: {
        es,
        en
    }
})

export default i18n 