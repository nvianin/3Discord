const uuid = require('uuid');

class Client {
    constructor(name, socket, clients) {
        this.name = name;
        this.socket = socket;
        this.id = uuid.v4();

        clients[this.id] = this;
    }
}

module.exports = {
    Client
};