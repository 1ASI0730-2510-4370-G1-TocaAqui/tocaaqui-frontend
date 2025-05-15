import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const httpInstance = axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
});

// Función para obtener todos los datos de los endpoints
const getAllData = async () => {
    try {
        const response = await fetch(`${BASE_URL}/data`);
        const res = await response.json();
        const data = res[0]; // porque data es un array
        return data;
    } catch (err) {
        console.error('Error:', err);
        throw err;
    }
};

export { getAllData };
export default httpInstance;