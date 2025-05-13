// @summary Event application entity model
// @author [Tu nombre]

import { useI18n } from 'vue-i18n';

export class EventApplication {
    constructor({
        id = null,
        eventName = '',
        eventDate = '',
        eventTime = '',
        publishDate = '',
        location = '',
        status = 'pending',
        soundcheckDate = '',
        soundcheckTime = '',
        capacity = 0,
        availableTickets = 0,
        adminName = '',
        adminContact = '',
        imageUrl = '',
        documents = []
    } = {}) {
        this.id = id
        this.eventName = eventName
        this.eventDate = eventDate
        this.eventTime = eventTime
        this.publishDate = publishDate
        this.location = location
        this.status = status
        this.soundcheckDate = soundcheckDate
        this.soundcheckTime = soundcheckTime
        this.capacity = capacity
        this.availableTickets = availableTickets
        this.adminName = adminName
        this.adminContact = adminContact
        this.imageUrl = imageUrl
        this.documents = documents
    }

    get formattedDate() {
        const { locale } = useI18n();
        return new Date(this.eventDate).toLocaleDateString(locale.value, {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    get formattedTime() {
        const { locale } = useI18n();
        return new Date(`2000-01-01T${this.eventTime}`).toLocaleTimeString(locale.value, {
            hour: '2-digit',
            minute: '2-digit'
        })
    }
}

export class Contract {
    constructor({
        id = null,
        eventApplicationId = null,
        content = '',
        signature = null,
        signedDate = null
    } = {}) {
        this.id = id
        this.eventApplicationId = eventApplicationId
        this.content = content
        this.signature = signature
        this.signedDate = signedDate
    }
}

export class RiderTechnical {
    constructor({
        id = null,
        eventApplicationId = null,
        filePath = '',
        uploadDate = null
    } = {}) {
        this.id = id
        this.eventApplicationId = eventApplicationId
        this.filePath = filePath
        this.uploadDate = uploadDate
    }
} 