import httpInstance from '../../shared/services/http.instance.js';

export class ProfileService {
    async getProfile() {
        try {
            const response = await httpInstance.get('/users');
            return {
                ...response.data,
                password: response.data.password || ''
            };
        } catch (error) {
            throw new Error('Error al obtener el perfil');
        }
    }

    async updateProfile(profileData) {
        try {
            if (!profileData.id) {
                throw new Error('El ID del usuario es requerido para actualizar el perfil');
            }

            // Si hay un archivo de imagen, subirlo a ImgBB
            let imageUrl = profileData.imageUrl;
            if (profileData.imageFile) {
                try {
                    imageUrl = await this.uploadImageToImgBB(profileData.imageFile);
                } catch (error) {
                    console.error('Error al subir la imagen:', error);
                    throw new Error('Error al subir la imagen. Por favor, intenta con otra imagen o más tarde.');
                }
            }

            // Crear el objeto de actualización
            const updateData = {
                name: profileData.name,
                email: profileData.email,
                role: profileData.role,
                genre: profileData.genre,
                type: profileData.type,
                description: profileData.description,
                imageUrl: imageUrl
            };

            // Solo incluir la contraseña si se proporciona un valor
            if (profileData.password && profileData.password.trim() !== '') {
                updateData.password = profileData.password;
            }

            const response = await httpInstance.put(`/users/${profileData.id}`, updateData);
            return response.data;
        } catch (error) {
            console.error('Error en updateProfile:', error);
            throw new Error(error.message || 'Error al actualizar el perfil');
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
}