import { createRouter, createWebHistory } from 'vue-router';
import LoginHome from '../login/pages/login-home.component.vue';

const routes = [
    { path: '/', component: LoginHome }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;