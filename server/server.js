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
}).listen(80);

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
} = require('./discord_observer');
const {
    group
} = require('console');
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
        /* io.sockets.emit('client_joined', {
            id: socket.c.id,
            position: socket.c.position,
            name: socket.c.name
        }); */
        id = socket.c.id;

        for (let key of Object.keys(clients)) {
            let s = clients[key].socket;
            if (s.c.id != socket.c.id) {
                console.log(key)
                console.log("SENDING FUCKING ATTRIBUTION TO FUCKING " + s.c.name);
                s.emit('client_joined', {
                    id: socket.c.id,
                    position: socket.c.position,
                    name: socket.c.name
                })
            }
        }

        console.log("+>> " + socket.c.name + " @ " + socket.handshake.address);
    })

    socket.on('movement_registration', e => {
        /* console.log("***" + socket.c.name + " moved " + e.acceleration.x + ":" + e.acceleration.y); */
        try {
            clients[socket.c.id].position = e.position;
            clients[socket.c.id].acceleration = e.acceleration;

            io.sockets.emit('movement_registration', {
                position: e.position,
                acceleration: e.acceleration,
                id: socket.c.id
            });
        } catch (e) {
            console.log(e)
        }
    })

})

const log = console.log;

let frameCount = 0
let prevGroups = ["haha"];

function tick() {
    frameCount++;
    let threshold = 1;

    let keys = Object.keys(clients)
    for (key of keys) {
        const client = clients[key];
        client.taken = false;
        client.adjacents = []
        for (key of keys) {
            let clientb = clients[key];
            if (client != clientb) {
                let distance = Math.sqrt((Math.pow(client.position.x - clientb.position.x, 2) + Math.pow(client.position.y - clientb.position.y, 2)));
                log(distance)
                if (distance < threshold) {
                    client.adjacents.push(clientb);
                }
            }
        }
    }

    let groups = []

    for (key of keys) {
        const client = clients[key];
        client.group = false;

        for (let a of client.adjacents) {
            if (!a.taken) {
                a.taken = true;
                if (!client.group) {
                    let insertedClient = false;
                    for (let group of groups) {
                        for (let member of group) {
                            if (member == a) {
                                group.push(client);
                                client.group = group;
                                insertedClient = true;
                            }
                        }
                    }
                    if (!insertedClient) {
                        let grp = [a, client]
                        groups.push(grp)
                        client.group = grp
                    }
                } else {
                    client.group.push(a)
                    a.taken = true;
                }
            } else if (client.group == false) {
                for (let group of groups) {
                    for (c of group) {
                        if (c == a) {
                            group.push(client)
                            client.group = group
                        }
                    }
                }
            }
        }
    }



    if (frameCount % 10 == 0 || true) {
        log("||||||||||||||||")
        for (let group of groups) {
            log("-------------")
            for (let member of group) {
                log(member.name)
            }
            log("---------------")
        }
    }

    log(prevGroups == groups)
    if (prevGroups != groups) {
        let i = 0;
        if (groups.length == 0) {

            /* discordObserver.rooms.forEach(r => {
                log(r.name)
            }) */
            /* console.log("NO GROUPS") */
            for (key of Object.keys(discordObserver.users)) {
                let channel = discordObserver.rooms[i]
                /* console.log(channel) */
                let client = discordObserver.users[key];
                /* log(client.member.user.username) */
                client.setChannel(channel.id)

                log("moved " + client.member.user.username + " to channel " + channel.name)
                i++
            }
        } else {
            i = 0;
            for (let group of groups) {
                let channel = discordObserver.rooms[i]
                for (let member of group) {
                    for (key of Object.keys(discordObserver.users)) {
                        let client = discordObserver.users[key];
                        if (client.member.user.username == member.name) {
                            /* log(member.name) */
                            client.setChannel(channel.id)
                            /* .then(a => (console.log("move success")), b => {
                                console.log("move error")
                                console.log(b)
                            }) */
                            log("moved " + client.member.user.username + " to channel " + channel.name)
                        }
                    }
                }

                /* log(channel) */


                i++;
            }
        }
    }
    prevGroups = groups;

    /* for (key of Object.keys(discordObserver.users)) {
        discordObserver.users[key].setChannel(discordObserver.rooms[9])
        log("ADGSF")
    } */


    for (let key of Object.keys(discordObserver.users)) {
        let client = discordObserver.users[key];
        /* log(client) */
    }
}

setInterval(tick, 4000);