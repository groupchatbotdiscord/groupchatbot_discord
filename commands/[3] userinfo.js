const { User, Message, Client } = require("discord.js")
const fetch = require("node-fetch")
const config = require("../data/config.json")

module.exports = {
    name: "userinfo",
    description: "Shows info about [@user].\nSome info will be hidden if [@user] isn't friends with the bot.",
    usage: "[@user]",
    aliases: ["ui"],
    file: __filename,
    /**
     * @param {Client} client
     * @param {Message} message
     * @param {String} args
     * @param {Array} argsArray
     * @param {User} target
     */
    async execute(client, message, args, argsArray, target) {
        const target2 = await client.fetchUser(target.id || message.author.id, true, true)
        const arrayOfThingsToShow = [
            `**Username**: ${target2.tag}`,
            `**ID**: ${target2.id}`,
            `**Account Created**: <t:${parseInt(target2.createdTimestamp / 1000)}:R> (<t:${parseInt(target2.createdTimestamp / 1000)}>)`,
            `**Avatar**: ${target2.displayAvatarURL}`
        ]
        let status
        let response = await fetch(target2.id !== client.user.id ? `https://discord.com/api/v9/users/${target2.id}/profile` : `https://discord.com/api/v9/users/@me`, {
            headers: {
                "authorization": config.token
            }
        })

        response = response.json()

        if (target2.presence.status === "offline") {
            if (target2.id === message.author.id) {
                status = "Invisible"
            } else {
                status = "Offline"
            }
        } else if (target2.presence.status === "dnd") {
            status = "Do Not Disturb"
        } else {
            status = target2.presence.status[0].toUpperCase() + target2.presence.status.slice(1)
        }

        if (target2.displayBannerURL) arrayOfThingsToShow.push(`**Banner**: ${target2.displayBannerURL}`)

        if (client.user.friends.has(target2.id)) arrayOfThingsToShow.push(`**Status**: ${status}`)

        message.reply(arrayOfThingsToShow.join("\n\n"))
    }
}