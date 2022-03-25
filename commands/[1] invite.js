const functions = require("../functions")

module.exports = {
    name: "invite",
    description: `Gives you an invite to the GCB server.
    Joining the GCB server is recommended for future bot accounts.`,
    aliases: [],
    file: __filename,
    async execute(client, message, args, argsArray, target) {
        message.reply(`${functions.configJSON.discordServerLink}

        • To add the bot to groups type \`${functions.configJSON.prefix}sendfriendrequest\`.`)
    }
}