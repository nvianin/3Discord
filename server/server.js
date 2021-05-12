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
    /* console.log("HANDLING NEW CONNECTION") */

    socket.on('***disconnect', e => {
        console.log("<<-" + socket.c.name + " @ " + socket.handshake.address);
    })

    socket.on('id_attribution', e => {
        /* console.log("***ID ATTRIBUTION FROM " + e.name) */
        socket.c = new Client(e.name, socket, clients);
        io.sockets.emit('client_joined', {
            id: socket.c.id
        });
        console.log("+>> " + socket.c.name + " @ " + socket.handshake.address);
    })

    socket.on('movement_registration', e => {
        clients[e.id]
    })

})

function tick() {

    for (key of Object.keys(clients)) {
        const client = clients[key];
        if (client.kill) {
            io.sockets.emit('client_left', {
                id: client.id
            });
            delete client;
        }
    }

}

setInterval(tick, 36);