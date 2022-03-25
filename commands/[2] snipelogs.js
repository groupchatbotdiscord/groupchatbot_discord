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
        let snipedMessage = data.message
        const snipedMessageDeletedAt = (parseInt(data.deletedAt) / 1000).toFixed(0)
        const snipedMessageAttachmentUrls = data.attachmentUrls || []
        const snipedMessageRepliedTo = data.replyingTo
        const snipedUser = await client.fetchUser(snipedUserId, true, true)

        const arrayOfThingsToShow = [`**Message Author**
        ${snipedUser.tag.replace(/`/g, "`")}`]

        if (snipedMessageRepliedTo) {
            arrayOfThingsToShow.push(`**Replied To**
            ${snipedMessageRepliedTo}`)
        }

        if (snipedMessage) {
            arrayOfThingsToShow.push(`**Message**
            ${snipedMessage}`)
        }

        if (snipedMessageAttachmentUrls.join("\n")) {
            arrayOfThingsToShow.push(`**Attachments**
            ${snipedMessageAttachmentUrls.join("\n")}`)
        }

        arrayOfThingsToShow.push(`• Deleted <t:${snipedMessageDeletedAt}:R>.
        • Page ${currentPage}/${length}.`)
        return arrayOfThingsToShow.join("\n\n")
    } else {
        return `${target.username.replace(/`/g, "`")} has no snipe data.`
    }
}

module.exports = {
    name: "snipelogs",
    description: "View snipe logs from [@user].",
    aliases: ["sl"],
    usage: "[@user]",
    permission: "GROUP_OWNERS_COOWNERS_ADMINS",
    file: __filename,
    cooldown: 5,
    async execute(client, message, args, argsArray, target) {
        const snipeData = functions.readJSON("snipe")

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
            if (message2.content !== `> ${target ? target.username.replace(/`/g, "`") : ""} has no snipe data.`) {
                awaitReactions(message, message2)
                await message2.react(back)
                await message2.react(next)
                await message2.react(beginning)
                await message2.react(end)
            }
        } else {
            message.reply("This group has no snipe logs.")
        }
    }
}