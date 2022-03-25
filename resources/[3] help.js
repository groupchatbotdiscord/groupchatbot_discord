const fs = require("fs")
const maxPages = 5

function getPage(message, currentPage) {
    let description1 = `${currentPage === 1 ? "> **" : ""}Page 1 - General${currentPage === 1 ? "**" : ""}
    ${currentPage === 2 ? "> **" : ""}Page 2 - Snipe${currentPage === 2 ? "**" : ""}
    ${currentPage === 3 ? "> **" : ""}Page 3 - Info${currentPage === 3 ? "**" : ""}
    ${currentPage === 4 ? "> **" : ""}Page 4 - Settings${currentPage === 4 ? "**" : ""}
    ${currentPage === 5 ? "> **" : ""}Page 5 - Currency${currentPage === 5 ? "**" : ""}`

    let description2 = ""

    fs.readdirSync("./commands").forEach(file => {
        if (file.startsWith(`[${currentPage}]`)) {
            const command = require(`./${file}`)

            const aliases = [...command.aliases].map(element => `\`!${element}\``)

            let permission = "Everyone"

            switch (command.permission) {
                case "BOT_OWNER":
                    permission = "Bot Owner"
                    break
                case "GROUP_OWNERS":
                    permission = "Group Owners"
                    break
                case "GROUP_OWNERS_COOWNERS":
                    permission = "Group Owners & Group Co-Owners"
                    break
                case "GROUP_OWNERS_COOWNERS_ADMINS":
                    permission = "Group Owners, Group Co-Owners & Group Admins"
                    break
                case "TESTING":
                    permission = "No-one (Command In Testing)"
                    break
                case "REWORKING":
                    permission = "No-one (Command Being Reworked)"
                    break
            }

            description2 += `**!${command.name}${command.usage ? ` ${command.usage}` : ""}**
            ${command.description}${command.aliases.length > 0 ? `
            Aliases: ${aliases.join(", ")}` : ""}
            Permission: ${permission}\n\n`
        }
    })

    return `${description1}

    ${description2}• <> = Required
    • [] = Optional`
}

module.exports = {
    name: "help",
    description: "DMs you a list of commands.",
    aliases: ["h", "commands", "cmds"],
    file: __filename,
    cooldown: 60,
    async execute(client, message, args, argsArray) {
        let currentPage = 1
        const beginning = "⏪"
        const back = "⬅️"
        const next = "➡️"
        const end = "⏩"
        async function awaitReactions(message, message2) {
            const filter = (reaction, user) => {
                return [beginning, back, next, end].includes(reaction.emoji.name) && user.id === message.author.id
            }
            const collected = await message2.awaitReactions(filter, { max: 1 })
            const reaction = collected.first()
            switch (reaction.emoji.name) {
                case beginning:
                    currentPage = 1
                    break
                case back:
                    currentPage -= 1
                    break
                case next:
                    currentPage += 1
                    break
                case end:
                    currentPage = maxPages
                    break
            }
            if (currentPage > maxPages)
                currentPage = maxPages
            if (currentPage < 1)
                currentPage = 1
            message2.edit(getPage(message, currentPage))
            awaitReactions(message, message2)
        }

        // Don't remove this if statement as your bot will get suspended if the bot attempts to send a DM to someone the bot can't DM
        if (client.user.friends.has(message.author.id)) {
            const message2 = await message.author.send(getPage(message, currentPage), { autoQuote: true })
            message.reply(`DM sent.`)
            awaitReactions(message, message2)
            await message2.react(back)
            await message2.react(next)
            await message2.react(beginning)
            await message2.react(end)
        } else {
            message.reply(`You're not friends with the bot.
            Please use \`!sendfriendrequest\` to receive DMs from the bot.`)
        }
    }
}