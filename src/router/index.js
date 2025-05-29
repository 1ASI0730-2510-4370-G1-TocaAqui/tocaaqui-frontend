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
        path: '/register',
        name: 'Register',
        component: () => import('../login/pages/register.component.vue')
    },
    {
        path: '/dashboard',
        name: 'Dashboard',
        component: () => import('../shared/pages/dashboard.component.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/search',
        name: 'EventSearch',
        component: () => import('../events/pages/musician-event-search.component.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/agenda',
        name: 'Agenda',
        component: ()=> import('../calendar/pages/calendar.component.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/evaluations',
        name: 'Evaluations',
        component: () => import('../evaluations/pages/evaluations-home.component.vue'),
        redirect: to => {
            const user = JSON.parse(localStorage.getItem('user'));
            return user?.role === 'promotor' ? '/evaluations/artists' : '/evaluations/venues';
        },
        meta: { requiresAuth: true }
    },
    {
        path: '/evaluations/venues',
        name: 'VenueEvaluations',
        component: () => import('../evaluations/pages/evaluations-page.component.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/evaluations/venues/evaluated',
        name: 'EvaluatedVenues',
        component: () => import('../evaluations/components/evaluated-events.component.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/evaluations/:id',
        name: 'EvaluationDetail',
        component: () => import('../evaluations/pages/evaluation-detail-page.component.vue'),
        meta: { requiresAuth: true }
    },
  {
        path: '/evaluations/evaluated',
        redirect: '/evaluations/venues/evaluated'
    },
    {
        path: '/evaluations/artists',
        name: 'ArtistEvaluations',
        component: () => import('../evaluations/pages/promoter-evaluations.component.vue'),
        meta: { requiresAuth: true, role: 'promotor' }
    },
    {
        path: '/evaluations/artists/evaluated',
        name: 'EvaluatedArtists',
        component: () => import('../evaluations/components/evaluated-artists.component.vue'),
        meta: { requiresAuth: true, role: 'promotor' }
    },
    {
        path: '/events/:id',
        name: 'EventDetail',
        component: () => import('../events/pages/event-detail.component.vue'),
        meta: { requiresAuth: true }
  },
  {
        path: '/applications',
        name: 'EventApplications',
        component: () => import('../events/pages/event-applications.component.vue'),
        meta: { requiresAuth: true }
    },
   {
        path: '/applications/:id',
        name: 'EventApplicationDetail',
        component: () => import('../events/pages/event-application-detail.component.vue'),
        meta: { requiresAuth: true }
    },
   {
        path: '/entrada/producer',
        name: 'TicketProducer',
        component: () => import('../ticket/pages/ticket-producer.component.vue'),
        meta: { requiresAuth: true }
    },
     {
        path: '/payments',
        name: 'PaymentSummary',
        component: () => import('../payments/pages/payment-summary.page.vue'),
        meta: { requiresAuth: true },
        props: route => ({
            userId: Number(JSON.parse(localStorage.getItem('user'))?.id)
        })
    },
    {
        path: '/profile',
        name: 'Profile',
        component: () => import('../profile/pages/profile-page.component.vue'),
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
    } else if (to.meta.role && user?.role !== to.meta.role) {
        next('/dashboard'); // Redirigir si el usuario no tiene el rol requerido
  } else {
    next();
  }
});

export default router;
