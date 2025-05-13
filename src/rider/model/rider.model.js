// @summary Rider entity model
// @author [Tu nombre]

export class Rider {
    constructor({
        id = null,
        firstName = '',
        lastName = '',
        documentType = '',
        documentNumber = '',
        email = '',
        phone = '',
        location = '',
        genre = '',
        paymentMethod = '',
        documents = [],
        status = 'pending'
    } = {}) {
        this.id = id
        this.firstName = firstName
        this.lastName = lastName
        this.documentType = documentType
        this.documentNumber = documentNumber
        this.email = email
        this.phone = phone
        this.location = location
        this.genre = genre
        this.paymentMethod = paymentMethod
        this.documents = documents
        this.status = status
    }

    get fullName() {
        return `${this.firstName} ${this.lastName}`
    }
} 