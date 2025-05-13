import { createApp } from 'vue';
import './style.css';
import App from './App.vue';

// PrimeVue y temas
import PrimeVue from 'primevue/config';
import Material from '@primeuix/themes/material';
import Aura from '@primevue/themes/aura';

// PrimeVue componentes
import Button from 'primevue/button';
import Card from 'primevue/card';
import Checkbox from 'primevue/checkbox';
import Column from 'primevue/column';
import ConfirmDialog from 'primevue/confirmdialog';
import DataTable from 'primevue/datatable';
import Dialog from 'primevue/dialog';
import Drawer from 'primevue/drawer';
import Dropdown from 'primevue/dropdown';
import FileUpload from 'primevue/fileupload';
import FloatLabel from 'primevue/floatlabel';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import InputNumber from 'primevue/inputnumber';
import InputText from 'primevue/inputtext';
import Menu from 'primevue/menu';
import Rating from 'primevue/rating';
import Row from 'primevue/row';
import Select from 'primevue/select';
import SelectButton from 'primevue/selectbutton';
import Tag from 'primevue/tag';
import Textarea from 'primevue/textarea';
import Toast from 'primevue/toast';
import Toolbar from 'primevue/toolbar';
import Password from 'primevue/password';
import Message from 'primevue/message';
import ProgressSpinner from 'primevue/progressspinner';
import Avatar from 'primevue/avatar';

// PrimeVue servicios
import ToastService from 'primevue/toastservice';
import ConfirmationService from 'primevue/confirmationservice';
import DialogService from 'primevue/dialogservice';
import Tooltip from 'primevue/tooltip';

// Estilos de PrimeVue
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';

// i18n
import i18n from "./i18n.js";

// Vue Router
import router from './router';

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
    .component('pv-dropdown', Dropdown)
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
