const functions = require("../functions")

module.exports = {
    name: "editsnipe",
    description: "Shows the latest edited message.",
    usage: "[@user]",
    aliases: ["es"],
    file: __filename,
    async execute(client, message, args, argsArray, target) {
        if (functions.readJSON("groups")[message.channel.id].snipe === false) return message.reply(`Editsniping has been disabled via ${functions.configJSON.prefix}groupsettings.`)

        const groupEditSnipeData = functions.readJSON("groups").editSnipeData[message.channel.id]

        if (!groupEditSnipeData) return message.reply("This group has no editsnipe data.")

        if (target && !groupEditSnipeData[target.id]) return message.reply(`This group has no editsnipe data from ${target.username}.`)

        const userId = target ? target.id : groupEditSnipeData.userId
        const oldMessage = target ? groupEditSnipeData[target.id].oldMessage : groupEditSnipeData.oldMessage
        const newMessage = target ? groupEditSnipeData[target.id].newMessage : groupEditSnipeData.newMessage
        const editedAt = (parseInt(target ? groupEditSnipeData[target.id].deletedAt : groupEditSnipeData.deletedAt) / 1000).toFixed(0)
        const user = await client.fetchUser(userId, true, true)
        const url = target ? groupEditSnipeData[target.id].url || null : groupEditSnipeData.url || null

        let text = `**Message Author**: ${user.tag}

        **Message URL**: ${url}`

        if (oldMessage) text += `\n\n**Old Message**: ${oldMessage}`

        if (newMessage) text += `\n\n**New Message**: ${newMessage}`

        text += `\n\n• Edited <t:${editedAt}:R>`

        message.reply(text)
    }
}