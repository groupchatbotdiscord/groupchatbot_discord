require("@colors/colors")
const Discord = require("discord.js")
const fs = require("fs")
const functions = require("./functions")
const config = require("./data/config.json")
const Spotify = require("spotifydl-core").default
const mongoose = require("mongoose")

module.exports.spotify = new Spotify({
    clientId: functions.configJSON.spotifyClientId,
    clientSecret: functions.configJSON.spotifyClientSecret
})

const client = new Discord.Client({ messageCacheMaxSize: 1500 })

client.commands = new Discord.Collection()

fs.readdirSync("./commands").forEach(file => {
    const command = require(`./commands/${file}`)

    client.commands.set(command.name, command)
})

fs.readdirSync("./events").forEach(file => {
    if (file.startsWith("!")) return

    const event = require(`./events/${file}`)

    if (event.once) {
        client.once(event.name, (...args) => event.execute(client, ...args))
    } else {
        client.on(event.name, (...args) => event.execute(client, ...args))
    }
})

client.login(config.token)

functions.expressPages(client)

process.on("unhandledRejection", reason => {
    if (!reason) return

    if (reason.message.includes("'WebSocket was closed before the connection was established'")) return
    if (reason.message.includes("ENOTFOUND")) return
    if (reason.message.includes("ETIMEDOUT")) return
    if (reason.message.includes("ECONNABORTED")) return
    if (reason.message.includes("ECONNRESET")) return
    if (reason.message.includes("socket hang up")) return
    if (reason.message.includes("EAI_AGAIN")) return
    if (reason.message.includes("EHOSTUNREACH")) return
    if (reason.message.includes("Unexpected end of JSON input")) return

    functions.log(reason.stack || reason, "warnings")
})

process.on("uncaughtException", error => {
    if (!error) return

    if (error.message.includes("ENOTFOUND")) return
    if (error.message.includes("ETIMEDOUT")) return
    if (error.message.includes("ECONNABORTED")) return
    if (error.message.includes("ECONNRESET")) return
    if (error.message.includes("socket hang up")) return
    if (error.message.includes("EAI_AGAIN")) return
    if (error.message.includes("EHOSTUNREACH")) return
    if (error.message.includes("Unexpected end of JSON input")) return

    functions.log(error.stack || error, "errors")
})

const maxTime = 86400000
const intervalTime = 120000

setInterval(_ => {
    fs.readdirSync("./resources/channels").forEach(folder => {
        fs.readdirSync(`./resources/channels/${folder}`).forEach(file => {
            const { ctime } = fs.statSync(`./resources/channels/${folder}/${file}`)

            const now = Date.now()
            const createdAt = new Date(ctime).getTime() + maxTime

            if (now > createdAt) {
                fs.rmSync(`./resources/channels/${folder}/${file}`, { recursive: true, force: true })
            }
        })
    })
}, intervalTime)

process.title = "GCB"

mongoose.connect("mongodb://localhost/GCB").then(_ => console.log("Connected to MongoDB".green))