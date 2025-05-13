import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { Button, Card, Message, ProgressSpinner, SelectButton, Toolbar, Avatar, Toast, Tooltip, FileUpload } from "primevue"
import PrimeVue from 'primevue/config'
import Aura from '@primevue/themes/aura'
import 'primeicons/primeicons.css'
import 'primeflex/primeflex.css'
import i18n from "./i18n.js"
import ToastService from 'primevue/toastservice'
import * as VueRouter from 'vue-router'
import RiderApplication from './rider/components/RiderApplication.vue'

// Configuración de rutas
const routes = [
    {
        path: '/',
        redirect: '/applications'
    },
    {
        path: '/applications',
        name: 'applications',
        component: RiderApplication
    }
    // Aquí puedes agregar más rutas según necesites
]

const router = VueRouter.createRouter({
    history: VueRouter.createWebHistory(),
    routes
})

const app = createApp(App)

app
    .use(PrimeVue, { 
        ripple: true, 
        theme: { 
            preset: Aura,
            options: {
                darkModeSelector: '.app-dark'
            }
        } 
    })
    .use(router)
    .use(ToastService)
    .use(i18n)
    .component('pv-button', Button)
    .component('pv-card', Card)
    .component('pv-message', Message)
    .component('pv-progress-spinner', ProgressSpinner)
    .component('pv-select-button', SelectButton)
    .component('pv-toolbar', Toolbar)
    .component('pv-avatar', Avatar)
    .component('pv-toast', Toast)
    .component('pv-file-upload', FileUpload)
    .directive('tooltip', Tooltip)
    .mount('#app')