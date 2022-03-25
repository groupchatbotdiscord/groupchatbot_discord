const moment = require("moment")

module.exports = {
    name: "activityinfo",
    description: "Shows [@user]'s activities.\n[@user] has to be friends with the bot.",
    usage: "[@user]",
    aliases: ["ai"],
    file: __filename,
    cooldown: 5,
    async execute(client, message, args, argsArray, target) {
        const target2 = target || message.author
        if (target2.id === client.user.id) {
            message.reply("Please choose a different user.")
        } else if (!client.user.friends.has(target2.id)) {
            message.reply(`This command can't be used on ${target2.username}.
            They have to be friends with the bot.`)
        } else {
            if (!target2.presence.activities[0]) {
                message.reply(`${target2.username} doesn't have any publicly available activities.`)
            } else {
                let message2 = await message.reply("Please wait.")
                let array = target2.presence.activities
                let activity = array[0]
                if (array[1]) {
                    if (array.length > 3)
                        array.length = 3
                    const description = []
                    array.forEach((value, index) => {
                        description.push(`${index + 1} - ${value.name}`)
                    })
                    const message2 = await message2.edit(description.join("\n"))
                    const length = array.length
                    switch (length) {
                        case 1:
                            await message2.react("1️⃣")
                            break
                        case 2:
                            await message2.react("1️⃣")
                            await message2.react("2️⃣")
                            break
                        case 3:
                            await message2.react("1️⃣")
                            await message2.react("2️⃣")
                            await message2.react("3️⃣")
                            break
                    }
                    const filter = (reaction, user) => {
                        return ["1️⃣", "2️⃣", "3️⃣"].includes(reaction.emoji.name) && user.id === message.author.id
                    }
                    const collected = await message2.awaitReactions(filter, { max: 1 })
                    const reaction = collected.first()
                    switch (reaction.emoji.name) {
                        case "1️⃣":
                            activity = array[0]
                            break
                        case "2️⃣":
                            activity = array[1]
                            break
                        case "3️⃣":
                            activity = array[2]
                            break
                    }
                }
                if (!activity)
                    return

                const arrayOfThingsToShow = [`**User**
                ${target2.tag}`]

                if (activity.name)
                    arrayOfThingsToShow.push(`**Activity Name**
                    ${activity.name}`)

                if (activity.type) {
                    type = "Playing"
                    if (activity.type === 1)
                        type = "Streaming"
                    if (activity.type === 2)
                        type = "Listening"
                    if (activity.type === 3)
                        type = "Watching"
                    if (activity.type === 4)
                        type = "Custom Status"
                    if (activity.type === 5)
                        type = "Competing"
                    arrayOfThingsToShow.push(`**Activity Type**
                    ${type}`)
                }

                if (activity.url)
                    arrayOfThingsToShow.push(`**Activity URL**
                    ${activity.url}`)

                if (activity.details)
                    arrayOfThingsToShow.push(`**Activity Details**
                    ${activity.details}`)

                if (activity.state)
                    arrayOfThingsToShow.push(`**Activity State**
                    ${activity.state}`)

                if (activity.assets) {
                    const assetDescription = []
                    if (activity.assets.largeText)
                        assetDescription.push(`Large Text: ${activity.assets.largeText}`)
                    if (activity.assets.smallText)
                        assetDescription.push(`Small Text: ${activity.assets.smallText}`)
                    if (activity.assets.largeImage)
                        assetDescription.push(`Large Image URL: ${activity.assets.largeImageURL}`)
                    if (activity.assets.smallImageURL)
                        assetDescription.push(`Small Image URL: ${activity.assets.smallImageURL}`)
                    arrayOfThingsToShow.push(`**Activity Assets**
                    ${assetDescription.join("\n")}`)
                }

                if (activity.emoji)
                    arrayOfThingsToShow.push(`**Activity Emoji**
                    ${activity.emoji}`)

                if (activity.timestamps && activity.timestamps.start)
                    arrayOfThingsToShow.push(`**Activity Started**
                    <t:${moment(activity.timestamps.start).unix()}:R> (<t:${moment(activity.timestamps.start).unix()}:F>)`)

                if (activity.createdTimestamp)
                    arrayOfThingsToShow.push(`**Activity Modified**
                    <t:${parseInt(activity.createdTimestamp / 1000)}:R> (<t:${parseInt(activity.createdTimestamp / 1000)}:F>)`)

                message2.edit(arrayOfThingsToShow.join("\n\n"))
                message2.reactions.forEach(reaction => reaction.remove())
            }
        }
    }
}