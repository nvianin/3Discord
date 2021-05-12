const uuid = require('uuid');

class Client {
    constructor(name, socket, clients) {
        this.name = name || "null_server";
        this.socket = socket;
        this.id = uuid.v4();

        this.position = {
            x: 0,
            y: 0
        };

        clients[this.id] = this;
    }
}

module.exports = {
    Client
};