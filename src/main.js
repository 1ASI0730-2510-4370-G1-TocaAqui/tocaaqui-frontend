import { createApp } from 'vue';
import './style.css';
import App from './App.vue';

// PrimeVue y temas
import PrimeVue from 'primevue/config';
import 'primevue/resources/themes/aura-light-green/theme.css';     // tema claro
import 'primevue/resources/primevue.min.css';

// PrimeVue componentes
import Button from 'primevue/button';
import Card from 'primevue/card';
import Checkbox from 'primevue/checkbox';
import Column from 'primevue/column';
import ConfirmDialog from 'primevue/confirmdialog';
import DataTable from 'primevue/datatable';
import Dialog from 'primevue/dialog';
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
import SelectButton from 'primevue/selectbutton';
import Tag from 'primevue/tag';
import Textarea from 'primevue/textarea';
import Toast from 'primevue/toast';
import Toolbar from 'primevue/toolbar';
import Password from 'primevue/password';
import Message from 'primevue/message';
import ProgressSpinner from 'primevue/progressspinner';
import Avatar from 'primevue/avatar';
import Slider from "primevue/slider";
import Divider from "primevue/divider";

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

// PrimeVue configuración
app.use(PrimeVue, {
    ripple: true,
    unstyled: false
});

// Registrar componentes
app.component('pv-button', Button);
app.component('pv-card', Card);
app.component('pv-checkbox', Checkbox);
app.component('pv-column', Column);
app.component('pv-confirm-dialog', ConfirmDialog);
app.component('pv-data-table', DataTable);
app.component('pv-dialog', Dialog);
app.component('pv-dropdown', Dropdown);
app.component('pv-file-upload', FileUpload);
app.component('pv-float-label', FloatLabel);
app.component('pv-icon-field', IconField);
app.component('pv-input-icon', InputIcon);
app.component('pv-input-number', InputNumber);
app.component('pv-input-text', InputText);
app.component('pv-menu', Menu);
app.component('pv-rating', Rating);
app.component('pv-row', Row);
app.component('pv-select-button', SelectButton);
app.component('pv-tag', Tag);
app.component('pv-textarea', Textarea);
app.component('pv-toast', Toast);
app.component('pv-toolbar', Toolbar);
app.component('pv-password', Password);
app.component('pv-message', Message);
app.component('pv-progress-spinner', ProgressSpinner);
app.component('pv-avatar', Avatar);
app.component('pv-slider', Slider);
app.component('pv-divider', Divider);

// Registrar servicios
app.use(ToastService);
app.use(ConfirmationService);
app.use(DialogService);

// Registrar directivas
app.directive('tooltip', Tooltip);

// Registrar i18n
app.use(i18n);

// Registrar router
app.use(router);

// Montar app
app.mount('#app');
