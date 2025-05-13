export class LoginEntity {
    constructor(name = '', email = '', password = '', role = '') {
        this.name = name;
        this.email = email;
        this.password = password;
        this.role = role;
    }
}

export class RegisterEntity {
    constructor(name = '', email = '', password = '', role = '') {
        this.name = name;
        this.email = email;
        this.password = password;
        this.role = role;
    }
}