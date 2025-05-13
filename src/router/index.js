import { createRouter, createWebHistory } from 'vue-router';
import HomeComponent from '../public/pages/home.component.vue';
import RiderApplication from '../rider/components/RiderApplication.vue';
import RiderDashboard from '../rider/pages/rider-dashboard.component.vue';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        { 
            path: '/home', 
            name: 'home', 
            component: HomeComponent, 
            meta: { title: 'Inicio' }
        },
        { 
            path: '/rider/apply', 
            name: 'rider-apply', 
            component: RiderApplication, 
            meta: { title: 'Postular como Rider' }
        },
        { 
            path: '/rider/dashboard', 
            name: 'rider-dashboard', 
            component: RiderDashboard, 
            meta: { title: 'Dashboard de Rider' }
        },
        { 
            path: '/', 
            redirect: '/home' 
        }
    ]
});

router.beforeEach((to, from, next) => {
    // Establecer el título de la página
    const baseTitle = 'TocaAqui';
    document.title = `${baseTitle} | ${to.meta['title']}`;
    next();
});

export default router;
