const User = require("../Schemas/User")

module.exports = {
    name: "afk",
    description: "Makes you go AFK for [reason].",
    usage: "[reason]",
    aliases: [],
    file: __filename,
    async execute(client, message, args) {
        const reason = args || "Unspecified"

        await User.findOneAndUpdate(
            {
                id: message.author.id
            },
            {
                afk_reason: reason,
                afk_since: parseInt(Date.now() / 1000)
            },
            {
                useFindAndModify: true
            }
        )

        message.reply(`You have gone AFK.

        **Reason**: ${reason}`)
    }
}