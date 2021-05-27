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
    let id;
    for (key of Object.keys(clients)) {
        const c = clients[key];
        socket.emit('client_joined', {
            id: c.id,
            position: c.position,
            name: c.name
        })
    }

    socket.on('disconnect', e => {
        try {
            io.sockets.emit('client_left', {
                id: socket.c.id
            });
            console.log("<<-" + socket.c.name + " @ " + socket.handshake.address);
            delete clients[socket.c.id];
        } catch (e) {
            console.log(e)
        }
    })

    socket.on('id_attribution', e => {
        console.log("***ID ATTRIBUTION FROM " + e.name)
        socket.c = new Client(e.name, socket, clients);
        io.sockets.emit('client_joined', {
            id: socket.c.id,
            position: socket.c.position,
            name: socket.c.name
        });
        id = socket.c.id;
        console.log("+>> " + socket.c.name + " @ " + socket.handshake.address);
    })

    socket.on('movement_registration', e => {
        /* console.log("***" + socket.c.name + " moved " + e.position.x + ":" + e.position.y); */
        clients[socket.c.id].position = e.position;
        clients[socket.c.id].acceleration = e.acceleration;

        io.sockets.emit('movement_registration', {
            position: e.position,
            acceleration: e.acceleration,
            id: socket.c.id
        });
    })

})

/* function tick() {

    for (key of Object.keys(clients)) {
        const client = clients[key];
        if (client.kill) {
            delete client;
        }
    }
}

setInterval(tick, 36); */