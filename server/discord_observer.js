const discord = require("discord.js");
const {
    token
} = require('./NOTOUCHEY')

const fs = require('fs');
let log = console.log;
class Discord_Observer {
    constructor() {
        this.rooms = []
        this.users = {};
        this.client = new discord.Client();
        this.client.on('ready', () => {
            console.log("***BOT READY")
            this.channel = this.initChannel();
            /* this.sendChat(";;play rickroll") */
            this.guild = this.channel.guild;
            /* log(this.guild.members.cache.array()[0].voice.setChannel('FUCK')) */
            console.log("***BOT CONNECTED TO: " + this.channel.name + " @ " + this.channel.guild.name);

            /* log(this.client.channels.cache.array()) */

            /* Object.keys(this.client.channels.cache) */
            for (let chan of this.client.channels.cache.array()) {
                /* console.log(chan.name) */
                if (chan.name.includes("room-")) this.rooms.push(chan);
                /* log(chan) */
            }

            this.getUsers();

            for (let key of Object.keys(this.users)) {
                console.log(this.users[key].member.user.username)
                /* this.users[key].setChannel(this.rooms[this.rooms.length - 1]) */
            }

            /* log(this.findUser("DukSauce")) */

        })

        this.client.on('rateLimit', r => {
            log(r)
        })
        this.client.login(token);

        this.client.on('presenceUpdate', e => {
            /* console.log(e) */
        })

        this.client.on('voiceStateUpdate', (Old, New) => {
            /* console.log(Old, New); */
            this.getUsers();
            /* fs.writeFileSync('voiceStateDebug_old.json', JSON.stringify(Old))
            fs.writeFileSync('voiceStateDebug_new.json', JSON.stringify(New)) */
        })

        /* this.servers = this.client.guilds.cache.array(); */
        /* this.channel = this.initChannel(); */
    }


    initChannel() {
        let channels = this.client.channels.cache.array();

        for (var channel of channels) {
            /* console.log(channel.name); */
            if (channel.name.includes('3Discord')) {
                return channel;
            }
            if (channel.type == 'text') {
                this.textChannel = channel;
            }
        }
    }



    findUser(username) {
        for (let u of this.guild.members.cache.array()) {
            /* console.log(u); */
            if (u.username == username) {
                return u;
            }
        }
    }

    sendChat(text) {
        this.textChannel.send(text)
    }

    getUsers() {
        for (let u of this.guild.members.cache.array()) {
            /* u.setVoiceChannel(this.rooms[0].id); */
            if (u.user.username != "3Discord Manager") {
                this.users[u.user.username] = u.voice;
            }
            /* log(u.voice.name)
            log(u.voice) */
        }
        /* log(this.users) */
    }
}

const discordObserver = new Discord_Observer();
module.exports = {
    discordObserver
}