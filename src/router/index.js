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
        path: '/agenda',
        name: 'Agenda',
        component: ()=> import('../schedule/pages/schedule-page.component.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/evaluations',
        component: () => import('@/evaluations/pages/evaluations-page.component.vue')
    },
    {
        path: '/evaluations/:id',
        component: () => import('@/evaluations/pages/evaluation-detail-page.component.vue')
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
    },
    {
        path:  '/payments',
        name: 'Payments',
        component: () => import('../payments/component/artistpayments.vue'),
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
