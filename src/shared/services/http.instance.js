import axios from 'axios';

const httpInstance = axios.create({
    baseURL:  import.meta.env.VITE_API_BASE_URL,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
});

// Interceptor para agregar automáticamente el token de autorización
httpInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor para manejar errores de autorización
httpInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response?.status === 401) {
            // Token expirado o inválido
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            window.dispatchEvent(new CustomEvent('logout'));
            
            // Redirigir al login si no estamos ya ahí
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default httpInstance;