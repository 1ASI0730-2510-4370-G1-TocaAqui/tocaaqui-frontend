import httpInstance from '../../shared/services/http.instance.js';

export class ProfileService {
    async getProfile() {
        try {
            const response = await httpInstance.get('/users');
            return response.data;
        } catch (error) {
            throw new Error('Error al obtener el perfil');
        }
    }

    async updateProfile(profileData) {
        try {
            if (!profileData.id) {
                throw new Error('El ID del usuario es requerido para actualizar el perfil');
            }
            const response = await httpInstance.put(`/users/${profileData.id}`, {
                name: profileData.name,
                email: profileData.email,
                password: profileData.password,
                role: profileData.role
            });
            return response.data;
        } catch (error) {
            console.error('Error en updateProfile:', error.response || error.message);
            throw new Error('Error al actualizar el perfil');
        }
    }
}