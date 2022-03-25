module.exports = {
    name: "banner",
    description: "Shows [@user]'s banner.",
    usage: "[@user]",
    aliases: ["ba"],
    file: __filename,
    async execute(client, message, args, argsArray, target) {
        const target2 = await client.fetchUser(target.id || message.author.id, true, true)

        if (target2.displayBannerURL) {
            message.reply(`**${target2.username.replace(/`/g, "`")}'s Banner**
            ${target2.displayBannerURL}`)
        } else {
            message.reply(`${target2.username.replace(/`/g, "`")} has no banner.`)
        }
    }
}