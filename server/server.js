let {
    Client
} = require('./thingies/client_object')
let fs = require('fs');
let https = require('https');
const server = https.createServer({
    key: fs.readFileSync('../https/privkey.pem'),
    cert: fs.readFileSync('../https/fullchain.pem')
}, (req, res) => {
    res.writeHead(200);
    res.end('hello world\n');
}).listen(3000);

let clients = {};

const io = require('socket.io')(server, {
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
                id: id
            });
            1
            console.log("<<-" + socket.c.name + " @ " + socket.handshake.address);
            delete clients[socket.c.id];
        } catch (e) {
            console.log("<<- disconnection but name unavailable")
        }
    })

    socket.on('id_attribution', e => {
        console.log("***ID ATTRIBUTION FROM " + e.name)
        socket.c = new Client(e.name, socket, clients);
        socket.emit('id_attribution', socket.c.id);
        io.sockets.emit('client_joined', {
            id: socket.c.id,
            position: socket.c.position,
            name: socket.c.name
        });
        id = socket.c.id;
        console.log("+>> " + socket.c.name + " @ " + socket.handshake.address);
    })

    socket.on('movement_registration', e => {
        /* console.log("***" + socket.c.name + " moved " + e.acceleration.x + ":" + e.acceleration.y); */
        clients[socket.c.id].position = e.position;
        clients[socket.c.id].acceleration = e.acceleration;

        io.sockets.emit('movement_registration', {
            position: e.position,
            acceleration: e.acceleration,
            id: socket.c.id
        });
    })

})

const log = console.log;

function tick() {
    let keys = Object.keys(clients)
    for (key of keys) {
        const client = clients[key];
        for (key of keys) {
            let clientb = clients[key];
            if (client != clientb) {
                let distance = Math.sqrt((Math.pow(client.position.x - clientb.position.x, 2) + Math.pow(client.position.y - clientb.position.y, 2)));
                /* log(distance) */
            }
        }
    }
}

setInterval(tick, 100);