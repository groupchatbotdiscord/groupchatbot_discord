const functions = require("../functions")

module.exports = {
    name: "snipe",
    description: "Shows the latest deleted message.",
    usage: "[@user]",
    aliases: ["s", "4k"],
    file: __filename,
    async execute(client, message, args, argsArray, target) {
        if (functions.readJSON("groups")[message.channel.id].snipe === false) return message.reply(`Sniping has been disabled via ${functions.configJSON.prefix}groupsettings.`)

        const groupSnipeData = functions.readJSON("groups").snipeData[message.channel.id]

        if (!groupSnipeData) return message.reply("This group has no snipe data.")

        if (target && !groupSnipeData[target.id]) return message.reply(`This group has no snipe data from ${target.username}.`)

        const userId = target ? target.id : groupSnipeData.userId
        const snipedMessage = target ? groupSnipeData[target.id].message : groupSnipeData.message
        const deletedAt = (parseInt(target ? groupSnipeData[target.id].deletedAt : groupSnipeData.deletedAt) / 1000).toFixed(0)
        const attachmentUrls = target ? groupSnipeData[target.id].attachmentUrls || [] : groupSnipeData.attachmentUrls || []
        const repliedTo = target ? groupSnipeData[target.id].replyingTo : groupSnipeData.replyingTo
        const user = await client.fetchUser(userId, true, true)

        let text = `**Message Author**: ${user.tag}`

        if (repliedTo) text += `\n\n**Replied To**: ${repliedTo}`

        if (snipedMessage) text += `\n\n**Message**: ${snipedMessage}`

        if (attachmentUrls.join("\n")) text += `\n\n**Attachments**: ${attachmentUrls.join("\n")}`

        text += `\n\n• Deleted <t:${deletedAt}:R>`

        message.reply(text)
    }
}