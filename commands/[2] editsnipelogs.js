const functions = require("../functions")
const beginning = "⏪"
const back = "⬅️"
const next = "➡️"
const end = "⏩"

async function getPage(client, message, snipeData, currentPage, target) {
    let logs = [...snipeData[message.channel.id].logs].reverse()

    if (target) {
        logs = [...snipeData[message.channel.id].logs].reverse().filter(v => v.userId === target.id)
    }

    const length = logs.length

    if (length > 0) {
        const data = logs[currentPage - 1]

        const snipedUserId = data.userId
        let snipedOldMessage = data.oldMessage
        let snipedNewMessage = data.newMessage
        const snipedMessageEditedAt = (parseInt(data.editedAt) / 1000).toFixed(0)
        const snipedUser = await client.fetchUser(snipedUserId, true, true)
        const url = data.url || null

        const arrayOfThingsToShow = [
            `**Message Author**: ${snipedUser.tag}`,
            `**Message URL**: ${url}`
        ]

        if (snipedOldMessage) {
            arrayOfThingsToShow.push(`**Old Message**: ${snipedOldMessage}`)
        }

        if (snipedNewMessage) {
            arrayOfThingsToShow.push(`**New Message**: ${snipedNewMessage}`)
        }

        arrayOfThingsToShow.push(`• Edited <t:${snipedMessageEditedAt}:R>.
        • Page ${currentPage}/${length}.`)

        return arrayOfThingsToShow.join("\n\n")
    } else {
        return `${target.username} has no editsnipe data.`
    }
}

module.exports = {
    name: "editsnipelogs",
    description: "View editsnipe logs from [@user].",
    aliases: ["esl"],
    usage: "[@user]",
    permission: "GROUP_OWNERS_COOWNERS_ADMINS",
    file: __filename,
    cooldown: 5,
    async execute(client, message, args, argsArray, target) {
        const snipeData = functions.readJSON("editsnipe")

        if (snipeData[message.channel.id] && snipeData[message.channel.id].logs) {
            let pages = snipeData[message.channel.id].logs.length
            let currentPage = 1

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
                        currentPage = currentPage - 1
                        break
                    case next:
                        currentPage = currentPage + 1
                        break
                    case end:
                        currentPage = pages
                        break
                }
                if (currentPage > pages)
                    currentPage = pages
                if (currentPage < 1)
                    currentPage = 1
                const content = await getPage(client, message, snipeData, currentPage, target)
                message2.edit(content)
                awaitReactions(message, message2)
            }
            const content = await getPage(client, message, snipeData, currentPage, target)
            const message2 = await message.reply(content)
            if (message2.content !== `> ${target ? target.username : ""} has no editsnipe data.`) {
                awaitReactions(message, message2)
                await message2.react(back)
                await message2.react(next)
                await message2.react(beginning)
                await message2.react(end)
            }
        } else {
            message.reply("This group has no editsnipe logs.")
        }
    }
}