module.exports = {
    name: "avatar",
    description: "Shows [@user]'s avatar.",
    usage: "[@user]",
    aliases: ["av"],
    file: __filename,
    async execute(client, message, args, argsArray, target) {
        const target2 = target || message.author

        message.reply(`**${target2.username}'s Avatar**
        ${target2.displayAvatarURL}`)
    }
}