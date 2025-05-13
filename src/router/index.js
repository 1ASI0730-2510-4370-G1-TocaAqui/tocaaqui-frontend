import { createRouter, createWebHistory } from 'vue-router';

const routes = [
    {
        path: '/',
        redirect: '/login'
    },
    {
        path: '/login',
        name: 'Login',
        component: () => import('../login/pages/login-home.component.vue')
    },
    {
        path: '/dashboard',
        name: 'Dashboard',
        component: () => import('../artist/pages/artist-dashboard.component.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/applications',
        name: 'EventApplications',
        component: () => import('../event-application/pages/event-applications.component.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/applications/:id',
        name: 'EventApplicationDetail',
        component: () => import('../event-application/pages/event-application-detail.component.vue'),
        meta: { requiresAuth: true }
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

// Guardia de navegación
router.beforeEach((to, from, next) => {
    const isAuthenticated = localStorage.getItem('user') !== null;
    const user = isAuthenticated ? JSON.parse(localStorage.getItem('user')) : null;
    
    if (to.meta.requiresAuth && !isAuthenticated) {
        next('/login');
    } else if (to.path === '/login' && isAuthenticated) {
        next('/dashboard');
    } else {
        next();
    }
});

export default router;
