import httpInstance from "../../shared/services/http.instance.js";

export class LoginService {
    async login(loginEntity) {
        try {
            const response = await httpInstance.post('/api/v1/users/sign-in', {
                email: loginEntity.email,
                password: loginEntity.password
            });

            const { user, token } = response.data;

            // Guardar el usuario y token en localStorage
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('token', token);
            
            // Emitir evento de login exitoso
            window.dispatchEvent(new CustomEvent('login-success', { detail: { user, token } }));

            return user;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }

    async register(registerEntity) {
        try {
            // Si hay un archivo de imagen, subirlo a ImgBB
            let imageUrl = '';
            if (registerEntity.imageFile) {
                try {
                    imageUrl = await this.uploadImageToImgBB(registerEntity.imageFile);
                } catch (error) {
                    console.error('Error al subir la imagen:', error);
                    throw new Error('Error al subir la imagen. Por favor, intenta con otra imagen o más tarde.');
                }
            } else {
                imageUrl = 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';
            }

            // Preparar datos del usuario
            const userData = {
                name: registerEntity.name,
                email: registerEntity.email,
                password: registerEntity.password,
                role: registerEntity.role,
                imageUrl: imageUrl
            };

            // Agregar campos específicos para músicos
            if (registerEntity.role === 'musico') {
                userData.genre = registerEntity.genre;
                userData.type = registerEntity.type;
                userData.description = registerEntity.description;
            } else {
                // Para promotores, estos campos son null
                userData.genre = null;
                userData.type = null;
                userData.description = null;
            }

            // Registrar el usuario
            const response = await httpInstance.post('/api/v1/users/sign-up', userData);
            return response.data;
        } catch (error) {
            if (error.response) {
                throw error.response.data || 'Error en el servidor';
            } else {
                throw error.message || 'Error de conexión';
            }
        }
    }

    async uploadImageToImgBB(file) {
        const formData = new FormData();
        formData.append('image', file);
        
        const response = await fetch('https://api.imgbb.com/1/upload?key=YOUR_IMGBB_API_KEY', {
                method: 'POST',
            body: formData
        });

            const data = await response.json();
        if (!data.success) throw new Error('Error al subir la imagen');
        
        return data.data.url;
    }

    logout() {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        // Emitir evento de logout
        window.dispatchEvent(new CustomEvent('logout'));
    }
}