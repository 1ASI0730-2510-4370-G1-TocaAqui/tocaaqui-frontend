import httpInstance from "../../shared/services/http.instance.js";

class LoginService {
    async login(loginEntity) {
        try {
            const response = await httpInstance.get('/users'); // Obtiene todos los usuarios

            const user = response.data.find(
                u => u.email === loginEntity.email && u.password === loginEntity.password
            );

            if (!user) {
                throw new Error('Credenciales incorrectas');
            }

            // Guardar el usuario en localStorage
            localStorage.setItem('user', JSON.stringify(user));

            return user; // Devuelve el usuario encontrado
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }

    async register(registerEntity) {
        try {
            const existingUser = await httpInstance.get('/users', {
                params: { email: registerEntity.email }
            });

            if (existingUser.data.length > 0) {
                throw new Error('El correo ya está registrado');
            }

            const response = await httpInstance.post('/auth/register', {
                name: registerEntity.name,
                email: registerEntity.email,
                password: registerEntity.password,
                role: registerEntity.role
            });

            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }

    logout() {
        localStorage.removeItem('user');
    }
}

export default new LoginService();