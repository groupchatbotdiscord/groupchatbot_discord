const functions = require("../functions")
const fs = require("fs")

module.exports = {
    name: "botinfo",
    description: "Shows info about the bot.",
    aliases: ["bi"],
    file: __filename,
    async execute(client, message) {
        const groups = client.channels.filter(c => c.type === "group").size
        const uptime = functions.msToTime(client.uptime, "ms")
        const ping = parseInt(client.ping)
        const commands = fs.readdirSync("./commands").filter(file => !file.startsWith("[0]"))

        const message2 = await message.reply(`**Bot**
        Group Count: ${groups}
        Command Count: ${commands.length}
        Uptime: ${uptime}
        Friend Count: ${client.user.friends.size}

        **Latency**
        Bot Latency: ???ms
        API Latency: ${ping}ms`)

        const ping2 = message2.createdTimestamp - message.createdTimestamp

        message2.edit(`**Bot**
        Group Count: ${groups}
        Command Count: ${commands.length}
        Uptime: ${uptime}
        Friend Count: ${client.user.friends.size}

        **Latency**
        Bot Latency: ${ping2}ms
        API Latency: ${ping}ms`)
    }
}