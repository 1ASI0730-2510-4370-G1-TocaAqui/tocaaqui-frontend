import { createApp } from 'vue';
import './style.css';
import App from './App.vue';

// PrimeVue y temas
import PrimeVue from 'primevue/config';
import Material from '@primeuix/themes/material';
import Aura from '@primevue/themes/aura';

// PrimeVue componentes
import {
    Button,
    Card,
    Checkbox,
    Column,
    ConfirmDialog,
    ConfirmationService,
    DataTable,
    Dialog,
    DialogService,
    Drawer,
    FileUpload,
    FloatLabel,
    IconField,
    InputIcon,
    InputNumber,
    InputText,
    Menu,
    Rating,
    Row,
    Select,
    SelectButton,
    Tag,
    Textarea,
    Toast,
    Toolbar,
    Password,
    Message,
    ProgressSpinner,
    Avatar,
} from "primevue";

// PrimeVue directivas y servicios
import ToastService from 'primevue/toastservice';
import Tooltip from 'primevue/tooltip';

import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';

// i18n
import i18n from "./i18n.js";

// Vue Router
import * as VueRouter from 'vue-router';
import RiderApplication from './rider/components/RiderApplication.vue';

// Configuración de rutas
const routes = [
    {
        path: '/',
        redirect: '/applications'
    },
    {
        path: '/applications',
        name: 'RiderApplication',
        component: RiderApplication
    }
    // Aquí puedes agregar más rutas si las necesitas
];

const router = VueRouter.createRouter({
    history: VueRouter.createWebHistory(),
    routes
});

// Crear app
const app = createApp(App);

// PrimeVue configuración (puedes alternar entre Material y Aura fácilmente)
const useTheme = 'Aura'; // Cambia a 'Material' si lo prefieres

app.use(PrimeVue, {
    ripple: true,
    theme: {
        preset: useTheme === 'Aura' ? Aura : Material,
        options: useTheme === 'Aura' ? { darkModeSelector: '.app-dark' } : {}
    }
});

// Servicios globales
app.use(router);
app.use(i18n);
app.use(ToastService);
app.use(ConfirmationService);
app.use(DialogService);

// Registrar componentes globales
app
    .component('pv-button', Button)
    .component('pv-card', Card)
    .component('pv-checkbox', Checkbox)
    .component('pv-column', Column)
    .component('pv-confirm-dialog', ConfirmDialog)
    .component('pv-data-table', DataTable)
    .component('pv-dialog', Dialog)
    .component('pv-drawer', Drawer)
    .component('pv-file-upload', FileUpload)
    .component('pv-float-label', FloatLabel)
    .component('pv-icon-field', IconField)
    .component('pv-input-icon', InputIcon)
    .component('pv-input-number', InputNumber)
    .component('pv-input-text', InputText)
    .component('pv-menu', Menu)
    .component('pv-rating', Rating)
    .component('pv-row', Row)
    .component('pv-select', Select)
    .component('pv-select-button', SelectButton)
    .component('pv-tag', Tag)
    .component('pv-textarea', Textarea)
    .component('pv-toast', Toast)
    .component('pv-toolbar', Toolbar)
    .component('pv-password', Password)
    .component('pv-message', Message)
    .component('pv-progress-spinner', ProgressSpinner)
    .component('pv-avatar', Avatar);

// Directivas
app.directive('tooltip', Tooltip);

// Montar app
app.mount('#app');
