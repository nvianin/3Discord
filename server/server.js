let {
    Client
} = require('./thingies/client_object')

let clients = {};

const io = require('socket.io')(3000, {
    cors: {
        origin: "https://discord.com",
        methods: ["GET", "POST"],
        allowedHeaders: ["a-custom-header"],
        credentials: true
    }
});
console.log("***SERVER READY");
const {
    discordObserver
} = require('./discord_observer')
/* const discord_observer = new Discord_Observer */

io.on('connect', socket => {

    const c = new Client('Isildur', socket, clients);
    socket.c = c;
    console.log("+>> " + c.name + " @ " + socket.handshake.address);

    socket.on('disconnect', e => {
        console.log("<<-" + socket.c.name + " @ " + socket.handshake.address);
    })
})