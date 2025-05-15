// @summary Event application entity model
// @author [Tu nombre]

export class EventApplication {
    constructor({
        id = null,
        promoterId = null,
        name = '',
        date = '',
        time = '',
        publishDate = '',
        location = '',
        imageUrl = '',
        status = 'pending',
        soundcheckDate = '',
        soundcheckTime = '',
        capacity = 0,
        availableTickets = 0,
        adminName = '',
        adminId = null,
        adminContact = '',
        requirements = '',
        description = '',
        payment = '',
        duration = null,
        genre = '',
        equipment = ''
    } = {}) {
        this.id = id
        this.promoterId = promoterId
        this.name = name
        this.date = date
        this.time = time
        this.publishDate = publishDate
        this.location = location
        this.imageUrl = imageUrl
        this.status = status
        this.soundcheckDate = soundcheckDate
        this.soundcheckTime = soundcheckTime
        this.capacity = capacity
        this.availableTickets = availableTickets
        this.adminName = adminName
        this.adminId = adminId
        this.adminContact = adminContact
        this.requirements = requirements
        this.description = description
        this.payment = payment
        this.duration = duration
        this.genre = genre
        this.equipment = equipment
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