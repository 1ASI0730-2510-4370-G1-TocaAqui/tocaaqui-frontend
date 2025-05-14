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
        documents = []
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