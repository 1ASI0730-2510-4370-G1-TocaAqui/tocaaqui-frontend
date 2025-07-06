import httpInstance from '../../shared/services/http.instance';
import { Invitation } from '../model/invitation.model';

export class InvitationService {
    constructor() {
        this.resourceEndpoint = `${import.meta.env.VITE_CATEGORIES_ENDPOINT_PATH}invitations`;
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
            const response = await httpInstance.get(`${this.resourceEndpoint}/artist/${artistId}`);
            return response.data.map(invitation => new Invitation(invitation));
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async getInvitationsByPromoter(promoterId) {
        try {
            const response = await httpInstance.get(`${this.resourceEndpoint}/promoter/${promoterId}`);
            return response.data.map(invitation => new Invitation(invitation));
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async getInvitationsByEvent(eventId) {
        try {
            const response = await httpInstance.get(`${this.resourceEndpoint}/event/${eventId}`);
            return response.data.map(invitation => new Invitation(invitation));
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async acceptInvitation(invitationId) {
        try {
            const response = await httpInstance.patch(`${this.resourceEndpoint}/${invitationId}/respond`, {
                Status: 'Accepted'
            });
            return new Invitation(response.data);
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async rejectInvitation(invitationId) {
        try {
            const response = await httpInstance.patch(`${this.resourceEndpoint}/${invitationId}/respond`, {
                Status: 'Rejected'
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