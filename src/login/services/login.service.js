import httpInstance from "../../shared/services/http.instance.js";

export class LoginService {
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
            
            // Emitir evento de login exitoso
            window.dispatchEvent(new CustomEvent('login-success', { detail: user }));

            return user; // Devuelve el usuario encontrado
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }

    async register(registerEntity) {
        try {
            // Verificar si el email ya existe
            const existingUsersResponse = await httpInstance.get('/users');
            const existingUser = existingUsersResponse.data.find(u => u.email === registerEntity.email);

            if (existingUser) {
                throw new Error('El correo ya está registrado');
            }

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
            }

            // Crear el usuario directamente en la base de datos
            const response = await httpInstance.post('/users', userData);

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
        try {
            // Verificar que tenemos la API key
            const apiKey = import.meta.env.VITE_IMGBB_API_KEY?.replace(/['"]/g, ''); // Remover comillas si existen
            if (!apiKey) {
                throw new Error('API key de ImgBB no configurada');
            }

            // Convertir el archivo a base64
            const base64Image = await this.fileToBase64(file);
            const base64Data = base64Image.split(',')[1]; // Remover el prefijo "data:image/..."

            // Crear el cuerpo de la solicitud con URLSearchParams
            const body = new URLSearchParams();
            body.append('key', apiKey);
            body.append('image', base64Data);

            // Realizar la solicitud a ImgBB
            const response = await fetch('https://api.imgbb.com/1/upload', {
                method: 'POST',
                body: body
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Respuesta de ImgBB:', errorText);
                throw new Error(`Error al subir la imagen: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            console.log('Respuesta de ImgBB:', data); // Para debug

            if (data.success) {
                return data.data.display_url;
            } else {
                console.error('Error de ImgBB:', data);
                throw new Error(data.error?.message || 'Error al subir la imagen');
            }
        } catch (error) {
            console.error('Error detallado al subir la imagen:', error);
            throw error;
        }
    }

    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
        });
    }

    logout() {
        localStorage.removeItem('user');
        // Emitir evento de logout
        window.dispatchEvent(new CustomEvent('logout'));
    }
}