import httpInstance from '../../shared/services/http.instance';
import { Invitation } from '../model/invitation.model';

export class InvitationService {
    constructor() {
        this.resourceEndpoint = '/invitations';
    }

    async sendInvitation(invitationData) {
        try {
            const response = await httpInstance.post(this.resourceEndpoint, invitationData);
            return new Invitation(response.data);
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async getInvitationsByArtist(artistId) {
        try {
            const response = await httpInstance.get(`${this.resourceEndpoint}?artistId=${artistId}`);
            return response.data.map(invitation => new Invitation(invitation));
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async getInvitationsByPromoter(promoterId) {
        try {
            const response = await httpInstance.get(`${this.resourceEndpoint}?promoterId=${promoterId}`);
            return response.data.map(invitation => new Invitation(invitation));
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async acceptInvitation(invitationId) {
        try {
            const response = await httpInstance.patch(`${this.resourceEndpoint}/${invitationId}`, {
                status: 'accepted',
                updatedAt: new Date().toISOString()
            });
            return new Invitation(response.data);
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async rejectInvitation(invitationId) {
        try {
            const response = await httpInstance.patch(`${this.resourceEndpoint}/${invitationId}`, {
                status: 'rejected',
                updatedAt: new Date().toISOString()
            });
            return new Invitation(response.data);
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async getInvitationById(invitationId) {
        try {
            const response = await httpInstance.get(`${this.resourceEndpoint}/${invitationId}`);
            return new Invitation(response.data);
        } catch (error) {
            throw this.handleError(error);
        }
    }

    handleError(error) {
        if (error.response) {
            return error.response.data?.message || `Error del servidor: ${error.response.status}`;
        } else if (error.request) {
            return 'Error de conexión. Verifica tu conexión a internet.';
        } else {
            return error.message || 'Error desconocido';
        }
    }
} 