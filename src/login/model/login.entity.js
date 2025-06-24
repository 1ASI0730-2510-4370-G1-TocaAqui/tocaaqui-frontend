export class LoginEntity {
    constructor(email = '', password = '') {
        this.email = email;
        this.password = password;
    }
}

export class RegisterEntity {
    constructor(
        name = '', 
        email = '', 
        password = '', 
        role = '',
        genre = null,
        type = null,
        description = null,
        imageFile = null
    ) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.role = role;
        this.genre = genre;
        this.type = type;
        this.description = description;
        this.imageFile = imageFile;
    }

    toDTO() {
        const dto = {
            name: this.name,
            email: this.email,
            password: this.password,
            role: this.role
        };

        if (this.role === 'musico') {
            dto.genre = this.genre;
            dto.type = this.type;
            dto.description = this.description;
        }

        return dto;
    }
}