// @summary Event application entity model
// @author [Tu nombre]

export class EventApplication {
    constructor({
        id = null,
        name = '',
        date = '',
        time = '',
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
        documents = [],
        applicants = [] // Array de IDs de usuarios que han postulado
    } = {}) {
        this.id = id
        this.name = name
        this.date = date
        this.time = time
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
        this.applicants = applicants
    }
}

// Modelo para la relación entre usuario y evento
export class EventApplicant {
    constructor({
        id = null,
        userId = null,
        eventId = null,
        status = 'pending', // Estado de la postulación: pending, accepted, rejected
        applicationDate = new Date().toISOString(),
        contractSigned = false,
        riderUploaded = false
    } = {}) {
        this.id = id
        this.userId = userId
        this.eventId = eventId
        this.status = status
        this.applicationDate = applicationDate
        this.contractSigned = contractSigned
        this.riderUploaded = riderUploaded
    }
}

export class Contract {
    constructor({
        id = null,
        eventApplicationId = null,
        userId = null, // Agregamos el ID del usuario que firma
        content = '',
        signature = null,
        signedDate = null
    } = {}) {
        this.id = id
        this.eventApplicationId = eventApplicationId
        this.userId = userId
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