const { Util } = require("discord.js")
const functions = require("../functions")

module.exports = {
    name: "echo",
    description: "Makes the bot say <message>.",
    usage: "<message>",
    aliases: ["say"],
    file: __filename,
    example: `${functions.configJSON.prefix}echo hello`,
    async execute(client, message, args, argsArray, target) {
        if (argsArray[0]) {
            try {
                args = args.substring(0, 1024)

                message.channel.send(`⚠️ This is a message sent via the ${functions.configJSON.prefix}echo command, the responsibility lies with ${message.author.tag} ⚠️

                ${Util.cleanContent(args, client)}`)
            } catch (error) {
                message.reply(`**Error**: ${error.message}`)
            }
        } else {
            message.reply(`You need to provide 1 parameter to use this command.

            **Usage**: ${functions.configJSON.prefix}echo <message>

            **Example**: ${functions.configJSON.prefix}echo hello`)
        }
    }
}