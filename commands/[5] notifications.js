const functions = require("../functions")
const User = require("../Schemas/User")
const beginning = "⏪"
const back = "⬅️"
const next = "➡️"
const end = "⏩"
const delete2 = "❌"

async function getPage(client, message, logs, currentPage) {
    const data = logs[currentPage - 1]

    const action = data.action
    const read = data.read

    if (action === "rob") {
        const user = await client.fetchUser(data.user, true, true)
        const tookOrFined = data.took || data.fined
        const timestamp = data.timestamp
        const url = data.url
        const success = data.success
        const padlockBroke = data.padlockBroke

        const arrayOfThingsToShow = []

        if (!read) {
            arrayOfThingsToShow.push("**Unread Notification**")
        }

        arrayOfThingsToShow.push(`**Action**: Rob

        **User**: ${user.tag.replace(/`/g, "`")}

        **Successful Robbery**: ${success ? "Yes" : "No"}

        **${success ? "Stole" : "Gave"}**: £${tookOrFined}

        **When**: <t:${timestamp}> (<t:${timestamp}:R>)

        **Message URL**: ${url}`)

        if ("padlockBroke" in data) arrayOfThingsToShow.push(`**Padlock Broke**: ${padlockBroke ? "Yes" : "No"}`)

        arrayOfThingsToShow.push(`• Page ${currentPage}/${logs.length}.
        • Use ❌ to delete this notification.`)

        logs[currentPage - 1].read = true
        await User.findOneAndUpdate(
            {
                id: message.author.id
            },
            {
                currency_logs: logs
            }
        )

        return arrayOfThingsToShow.join("\n\n")
    }
}

module.exports = {
    name: "notifications",
    description: `View your notifications.
    Use ${functions.configJSON.prefix}notifications clear to clear your notifications.`,
    usage: "[clear]",
    aliases: ["notifs"],
    file: __filename,
    cooldown: 10,
    async execute(client, message, args, argsArray) {
        const userData = await User.findOne({ id: message.author.id })

        let logs = userData.currency_logs

        if (logs.length > 0) {
            if (!argsArray[0] || !argsArray[0] === "clear") {
                let currentPage = 1

                async function awaitReactions(message, message2) {
                    const filter = (reaction, user) => {
                        return [beginning, back, next, end, delete2].includes(reaction.emoji.name) && user.id === message.author.id
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
                            currentPage = logs.length
                            break
                        case delete2:
                            logs.splice(currentPage - 1, 1)
                            currentPage = 1
                            userData.currency_logs = logs
                            await userData.save()
                            break
                    }
                    if (logs.length > 0) {
                        if (currentPage > logs.length)
                            currentPage = logs.length
                        if (currentPage < 1)
                            currentPage = 1
                        const content = await getPage(client, message, logs, currentPage)
                        message2.edit(content)
                        awaitReactions(message, message2)
                    } else {
                        message2.edit("You have no notifications.", { disableNotificationReminder: true })
                    }
                }
                const content = await getPage(client, message, logs, currentPage)
                const message2 = await message.reply(content, { disableNotificationReminder: true })
                awaitReactions(message, message2)
                await message2.react(back)
                await message2.react(next)
                await message2.react(beginning)
                await message2.react(end)
                await message2.react(delete2)
            } else {
                await functions.clearNotifs(message.author.id)
                message.reply("Your notifications have been cleared.", { disableNotificationReminder: true })
            }
        } else {
            message.reply("You have no notifications.", { disableNotificationReminder: true })
        }
    }
}