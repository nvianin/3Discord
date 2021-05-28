const discord = require("discord.js");
const {
    token
} = require('./NOTOUCHEY')

const fs = require('fs');
class Discord_Observer {
    constructor() {
        this.client = new discord.Client();
        this.client.on('ready', () => {
            console.log("***BOT READY")
            this.channel = this.initChannel();
            console.log("***BOT CONNECTED TO: " + this.channel.name + " @ " + this.channel.guild.name);

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
            if (channel.name.includes('3Discord')) {
                return channel;
            }
        }
    }
}

const discordObserver = new Discord_Observer();
module.exports = {
    discordObserver
}