const functions = require("../functions")
const User = require("../Schemas/User")

module.exports = {
    name: "leaderboard",
    description: "Check the money leaderboard.",
    aliases: ["lb", "top", "rich"],
    file: __filename,
    cooldown: 10,
    async execute(client, message, args, argsArray, target) {
        if (!argsArray[0] || argsArray[0].toLowerCase() !== "global") {
            const members = []

            let i = 0
            message.channel.recipients.forEach(async user => {
                const userData = await functions.checkForDatabaseData(user.id)

                members.push(userData)

                i += 1
            })

            const interval = setInterval(_ => {
                if (i === message.channel.recipients.size) {
                    clearInterval(interval)

                    members.sort((a, b) => (a.currency_wallet + a.currency_bank > b.currency_wallet + b.currency_bank) ? -1 : 1)

                    const description = [`**Money Leaderboard For ${message.channel.name}**`]

                    let i = 0

                    members.forEach(async (object, index) => {
                        let user = client.users.get(object.id)
                        const userData = await User.findOne({ id: user.id })

                        const wallet = userData.currency_wallet
                        const bank = userData.currency_bank
                        const total = wallet + bank

                        const firstPlace = index === 0 ? true : false
                        const secondPlace = index === 1 ? true : false
                        const thirdPlace = index === 2 ? true : false

                        let medal = `#${index + 1}:`

                        if (firstPlace) medal = "🥇"
                        if (secondPlace) medal = "🥈"
                        if (thirdPlace) medal = "🥉"

                        let tag = user.tag

                        if (user.id === message.author.id) tag = `**${user.tag}**`

                        let text = `${medal} £${total} - ${tag}`

                        if (userData.settings_passiveMode) {
                            text += " - PASSIVE"
                        }

                        description.push(text)

                        i += 1
                    })

                    const interval2 = setInterval(_ => {
                        if (i === message.channel.recipients.size) {
                            clearInterval(interval2)

                            message.reply(description.join("\n\n"))
                        }
                    }, 100)
                }
            }, 100)
        } else {
            return message.reply("The global leaderboard has been temporarily disabled.\n\n**Reason**: I haven't upgraded it to use the database yet.")

            const json = functions.readJSON("points")

            const top10 = Object.entries(json).sort((a, b) => (b[1].points + b[1].bank) - (a[1].points + a[1].bank)).splice(0, 10)

            const description = [`**Global Money Leaderboard**`]

            top10.forEach((object, index) => {
                object = object[1]

                let user = client.users.get(object.id)

                if (user) {
                    const points2 = functions.readJSON("points")[user.id].points
                    const bank = functions.readJSON("points")[user.id].bank
                    const total = points2 + bank

                    const firstPlace = index === 0 ? true : false
                    const secondPlace = index === 1 ? true : false
                    const thirdPlace = index === 2 ? true : false

                    let medal = `#${index + 1}:`

                    if (firstPlace) medal = "🥇"
                    if (secondPlace) medal = "🥈"
                    if (thirdPlace) medal = "🥉"

                    let tag = `[REDACTED]`

                    if (functions.readJSON("users")[user.id].showUsernameOnGlobalLeaderboard) tag = user.username

                    if (user.id === message.author.id) tag = `**${tag}**`

                    let text = `${medal} £${total} - ${tag}`

                    if (functions.readJSON("users")[user.id].passive) {
                        text += " - PASSIVE"
                    }

                    description.push(text)
                }
            })

            if (!top10.find(element => element[1].id === message.author.id)) {
                const points2 = functions.readJSON("points")[message.author.id].points
                const bank = functions.readJSON("points")[message.author.id].bank
                const total = points2 + bank

                let medal = `#${await functions.getGlobalPlacement(message.author.id)}:`

                let tag = `[REDACTED]`

                if (functions.readJSON("users")[message.author.id].showUsernameOnGlobalLeaderboard) tag = message.author.username

                tag = `**${tag}**`

                let text = `${medal} £${total} - ${tag}`

                if (functions.readJSON("users")[message.author.id].passive) {
                    text += " - PASSIVE"
                }

                description.push(text)
            }

            message.reply(description.join("\n\n"))
        }
    }
}