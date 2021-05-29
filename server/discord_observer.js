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
            this.guild = this.channel.guild;
            log(this.guild)
            console.log("***BOT CONNECTED TO: " + this.channel.name + " @ " + this.channel.guild.name);

            /* Object.keys(this.client.channels.cache) */
            for (let chan of this.client.channels.cache.array()) {
                /* console.log(chan.name) */
                if (chan.name.includes("room-")) this.rooms.push(chan);
                /* log(chan) */
            }

            this.getUsers();

            for (let key of Object.keys(this.users)) {
                console.log(this.users[key].member.user.username)
            }

            /* log(this.findUser("DukSauce")) */

        })
        this.client.login(token);

        this.client.on('presenceUpdate', e => {
            /* console.log(e) */
        })

        this.client.on('voiceStateUpdate', (Old, New) => {
            /* console.log(Old, New); */
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

    getUsers() {
        for (let u of this.guild.members.cache.array()) {
            /* u.setVoiceChannel(this.rooms[0].id); */
            this.users[u.user.username] = u.voice;
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