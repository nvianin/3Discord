const discord = require("discord.js");
const token = "ODM2MjgyMjQ5MzA0NjA0Njgy.YIbuiQ.nFLh6ipcp0Bc_y52sblN4hmwsdk"

class Discord_Observer {
    constructor() {
        this.client = new discord.Client();
        this.client.on('ready', () => {
            console.log("***BOT READY")
        })
        this.client.login(token);

        this.client.on('presenceUpdate', e => {
            console.log(e)
        })

        this.servers = this.client.guilds.cache.array();
    }
}

const discordObserver = new Discord_Observer();
module.exports = {
    discordObserver
}