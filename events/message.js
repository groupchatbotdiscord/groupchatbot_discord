const functions = require("../functions.js")
const Discord = require("discord.js")
let config = require("../data/config.json")
const User = require("../Schemas/User.js")

module.exports = {
    name: "message",
    once: false,
    /**
     * @param {Discord.Client} client
     * @param {Discord.Message} message
     */
    async execute(client, message) {
        if (message.type === "RECIPIENT_REMOVE" && !message.channel.recipients.array()[0]) return message.channel.delete()

        if (message.type !== "DEFAULT" && message.type !== "REPLY") return

        functions.checkForGroupSettingsJSON(message)

        let userData = await functions.checkForDatabaseData(message.author.id)

        const whitelisted = [...functions.configJSON.owners]
        whitelisted.push(client.user.id)

        if (message.content.startsWith(functions.configJSON.prefix) && [...new Set(message.content.split(""))].join("") !== functions.configJSON.prefix) {
            const splitArray = message.content.split("&&")

            if (splitArray.length > 5) splitArray.length = 5

            splitArray.forEach(async (text, index) => {
                setTimeout(async _ => {
                    text = text.trim()

                    const argsArray = text.slice(functions.configJSON.prefix.length).split(/ +/)
                    const commandName = argsArray.shift().toLowerCase()
                    let args = argsArray.join(" ")

                    const groupBlacklist = functions.readJSON("groups")[message.channel.id] ? functions.readJSON("groups")[message.channel.id].blacklist || {} : {}

                    if (groupBlacklist[message.author.id]) {
                        const blacklistInfo = groupBlacklist[message.author.id]

                        const unixTimestamp = parseInt(blacklistInfo.endsAt) * 1000

                        if (unixTimestamp > Date.now()) {
                            if (!blacklistInfo.seenWarning) {
                                const user = await client.fetchUser(blacklistInfo.blacklistedBy, true, true)

                                message.reply(`You've been group blacklisted by ${user.tag}.

                                    **Reason**: ${blacklistInfo.reason}

                                    **Blacklist Ends**: <t:${blacklistInfo.endsAt}> (<t:${blacklistInfo.endsAt}:R>)`)

                                functions.writeJSON("groups", message.channel.id, true, `file[path].blacklist["${message.author.id}"].seenWarning = data`)
                            }
                            return
                        } else {
                            functions.writeJSON("groups", message.channel.id, null, `delete file[path].blacklist["${message.author.id}"]`)
                        }
                    }

                    const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName))
                    if (command) {
                        const target = await functions.getUserFromMention(client, argsArray[0], command.name, message.channel.recipients)

                        const targetUserData = await functions.checkForDatabaseData(target.id)

                        if (command.file.includes("[5] ")) {
                            if (userData.currency_policeCaught) {
                                return message.reply(`🚔 You've been caught attempting to commit crime by the police. 🚔

                    • You can't use any currency commands until you've replied to ${userData.currency_policeCaught}`)
                            }

                            if (userData.currency_prison && Date.now() - (userData.currency_prison * 1000) < 0) {
                                return message.reply(`⛓️ You're in prison so you cannot use currency commands. ⛓️

                    **Prison Message URL**: ${userData.currency_prisonUrl || "None found."}

                    • Your sentence time ends at <t:${userData.currency_prison}> (<t:${userData.currency_prison}:R>)`)
                            }

                            if (userData.currency_prison) {
                                userData.currency_prison = undefined
                                userData.currency_prisonUrl = undefined
                                await userData.save()
                            }

                            if (target && targetUserData.currency_prison && Date.now() - (targetUserData.currency_prison * 1000) > 0) {
                                targetUserData.currency_prison = undefined
                                targetUserData.currency_prisonUrl = undefined
                                await targetUserData.save()
                            }
                        }

                        const padlock = userData.currency_activeItems.padlock
                        const targetPadlock = targetUserData.currency_activeItems.padlock

                        const invisibilityPotion = userData.currency_activeItems.invisibilityPotion
                        const targetInvisibilityPotion = targetUserData.currency_activeItems.invisibilityPotion

                        if (padlock && Date.now() - (padlock * 1000) > 0) {
                            userData.currency_activeItems.padlock = undefined
                            await userData.save()
                        }
                        if (targetPadlock && Date.now() - (targetPadlock * 1000) > 0) {
                            targetUserData.currency_activeItems.padlock = undefined
                            await targetUserData.save()
                        }

                        if (invisibilityPotion && Date.now() - (invisibilityPotion * 1000) > 0) {
                            userData.currency_activeItems.invisibilityPotion = undefined
                            await userData.save()
                        }
                        if (targetInvisibilityPotion && Date.now() - (targetInvisibilityPotion * 1000) > 0) {
                            targetUserData.currency_activeItems.invisibilityPotion = undefined
                            await targetUserData.save()
                        }

                        if (command.permission) {
                            switch (command.permission) {
                                case "BOT_OWNER":
                                    if (!config.owners.includes(message.author.id)) {
                                        return message.reply(`${command.name} is a bot owner only command.`)
                                    }
                                    break
                                case "GROUP_OWNERS":
                                    if (message.author.id !== message.channel.ownerID) {
                                        return message.reply(`${command.name} is a group owner only command.`)
                                    }
                                    break
                                case "GROUP_OWNERS_COOWNERS": {
                                    const coOwners = functions.readJSON("groups")[message.channel.id] ? functions.readJSON("groups")[message.channel.id].coOwners || [] : []

                                    if (message.author.id !== message.channel.ownerID && !coOwners.includes(message.author.id)) {
                                        return message.reply(`${command.name} is a group owner and group co-owner only command.`)
                                    }
                                    break
                                } case "GROUP_OWNERS_COOWNERS_ADMINS": {
                                    const coOwners = functions.readJSON("groups")[message.channel.id] ? functions.readJSON("groups")[message.channel.id].coOwners || [] : []
                                    const admins = functions.readJSON("groups")[message.channel.id] ? functions.readJSON("groups")[message.channel.id].admins || [] : []

                                    if (message.author.id !== message.channel.ownerID && !admins.includes(message.author.id) && !coOwners.includes(message.author.id)) {
                                        return message.reply(`${command.name} is a group owner, group co-owner and group admin only command.`)
                                    }
                                    break
                                } case "TESTING":
                                    if (!config.owners.includes(message.author.id)) {
                                        return message.reply(`${command.name} is in testing.`)
                                    }
                                    break
                                case "REWORKING":
                                    if (!config.owners.includes(message.author.id)) {
                                        return message.reply(`${command.name} is being reworked.`)
                                    }
                                    break
                            }
                        }

                        if (command.cooldown) {
                            if (!whitelisted.includes(message.author.id)) {
                                if (!functions.readJSON("cooldowns")[message.author.id])
                                    functions.writeJSON("cooldowns", message.author.id, {})

                                const lastCooldown = functions.readJSON("cooldowns")[message.author.id][command.name] ? functions.readJSON("cooldowns")[message.author.id][command.name] : null

                                if (lastCooldown && (command.cooldown * 1000) - (Date.now() - lastCooldown) > 0) {
                                    const cooldownInSeconds = ((lastCooldown / 1000) + command.cooldown).toFixed(0)

                                    return message.reply(`${command.name} has a cooldown.

                            • Try again at <t:${cooldownInSeconds}> (<t:${cooldownInSeconds}:R>).`)
                                }

                                let now = Date.now()

                                functions.writeJSON("cooldowns", message.author.id, now, `file[path]["${command.name}"] = data`)
                            }
                        }

                        try {
                            let commandUsageCount = userData.currency_commandUsageCount

                            commandUsageCount += 1

                            if (commandUsageCount >= 5) {
                                let bankLimit = userData.currency_bankLimit

                                bankLimit += userData.settings_passiveMode ? 100 : 400

                                commandUsageCount = 0

                                userData.currency_bankLimit = bankLimit
                            }

                            userData.currency_commandUsageCount = commandUsageCount
                            await userData.save()

                            command.execute(client, message, args, argsArray, target)
                        } catch (error) {
                            console.log(`${error.stack || error}`.red)
                        }
                    } else {
                        return message.reply(`${commandName} is not a valid command.
                        Check \`${functions.configJSON.prefix}help\` for a list of commands.`)
                    }
                }, 100 * index)
            })
        } else {
            if (userData.afk_reason) {

                message.reply(`You are no longer AFK.

                **Reason**: ${userData.afk_reason}

                • Use ⏱️ to go AFK with the same reason again.
                • Use ❌ to remove this message.`)
                    .then(async message2 => {
                        function awaitReactions(message2) {
                            const filter = (reaction, user) => {
                                return ["⏱️", "❌"].includes(reaction.emoji.name) && user.id === message.author.id
                            }
                            message2.awaitReactions(filter, { max: 1 })
                                .then(collected => {
                                    const reaction = collected.first()
                                    switch (reaction.emoji.name) {
                                        case "⏱️": {
                                            message.content = `${functions.configJSON.prefix}afk ${userData.afk_reason}`
                                            client.emit("message", message)
                                            message2.delete()
                                            break
                                        } case "❌":
                                            message2.delete()
                                            break
                                    }
                                })
                        }
                        awaitReactions(message2)
                        await message2.react("⏱️")
                        await message2.react("❌")
                    })

                userData.afk_reason = undefined
                userData.afk_since = undefined
                userData = await userData.save()
            }

            let mentionedUserData = message.mentions.users.first() ? await User.findOne({ id: message.mentions.users.first().id }) : null

            if (mentionedUserData && mentionedUserData.afk_reason && !message.referencedMessage) {
                message.reply(`${message.mentions.users.first().username} is AFK.

                **Reason**: ${mentionedUserData.afk_reason}

                **AFK Since**: <t:${mentionedUserData.afk_since}> (<t:${mentionedUserData.afk_since}:R>)

                • Use ❌ to remove this message.`)
                    .then(message2 => {
                        function awaitReactions(message2) {
                            const filter = (reaction, user) => {
                                return ["❌"].includes(reaction.emoji.name) && user.id === message.author.id
                            }
                            message2.awaitReactions(filter, { max: 1 })
                                .then(collected => {
                                    const reaction = collected.first()
                                    switch (reaction.emoji.name) {
                                        case "❌":
                                            message2.delete()
                                            break
                                    }
                                })
                        }
                        awaitReactions(message2)
                        message2.react("❌")
                    })
            }
        }

        if (message.channel.type === "group") {
            if (message.author.id !== client.user.id) {
                const groups = functions.readJSON("groups")
                if (groups[message.channel.id].rareEvents === true) {
                    let rareEventChance = functions.generateChance(0.25)

                    if (rareEventChance) {
                        const eventCooldown = 300 * 1000

                        if (!functions.readJSON("cooldowns").channelCooldowns[message.channel.id])
                            functions.writeJSON("cooldowns", message.channel.id, {}, `file.channelCooldowns[path] = data`)

                        const lastCooldown = functions.readJSON("cooldowns").channelCooldowns[message.channel.id].events ? functions.readJSON("cooldowns").channelCooldowns[message.channel.id].events : null

                        if (lastCooldown && eventCooldown - (Date.now() - lastCooldown) > 0) return

                        let now = Date.now()

                        functions.writeJSON("cooldowns", message.channel.id, now, `file.channelCooldowns[path].events = data`)

                        const firstPlaceMoney = functions.generateNumber(4000, 5000)
                        const secondPlaceMoney = functions.generateNumber(2000, 3000)
                        const thirdPlaceMoney = functions.generateNumber(500, 1000)
                        const textToImage = require("text-to-image")
                        const crypto = require("crypto")

                        const passphraseOne = crypto.randomBytes(64).toString("base64").replace(/[^A-Za-z0-9]/g, "").substring(0, 8).replaceAll("I", "i").replaceAll("l", "L")
                        const passphraseTwo = crypto.randomBytes(64).toString("base64").replace(/[^A-Za-z0-9]/g, "").substring(0, 6).replaceAll("I", "i").replaceAll("l", "L")
                        const passphraseThree = crypto.randomBytes(64).toString("base64").replace(/[^A-Za-z0-9]/g, "").substring(0, 4).replaceAll("I", "i").replaceAll("l", "L")

                        const dataUriOne = await textToImage.generate(passphraseOne, {
                            verticalAlign: "center",
                            textAlign: "center",
                            bgColor: "#36393f",
                            textColor: "#fff",
                            fontSize: 16,
                            fontFamily: "Arial",
                            fontWeight: 600
                        })

                        const dataUriTwo = await textToImage.generate(passphraseTwo, {
                            verticalAlign: "center",
                            textAlign: "center",
                            bgColor: "#36393f",
                            textColor: "#fff",
                            fontSize: 16,
                            fontFamily: "Arial",
                            fontWeight: 600
                        })

                        const dataUriThree = await textToImage.generate(passphraseThree, {
                            verticalAlign: "center",
                            textAlign: "center",
                            bgColor: "#36393f",
                            textColor: "#fff",
                            fontSize: 16,
                            fontFamily: "Arial",
                            fontWeight: 600
                        })

                        const bufferOne = new Buffer.from(dataUriOne.split(",")[1], "base64")
                        const bufferTwo = new Buffer.from(dataUriTwo.split(",")[1], "base64")
                        const bufferThree = new Buffer.from(dataUriThree.split(",")[1], "base64")

                        const text = `**Rare Event**

                            This event ends in 60 seconds.`

                        let message2 = await message.reply(text + `\n\n**🥇 No-one** - £${firstPlaceMoney}

                            🥈 No-one - £${secondPlaceMoney}

                            🥉 No-one - £${thirdPlaceMoney}

                            • To get a placement you need to type the code in the attached image.
                            • The code is case sensitive.
                            • Group owners, group co-owners & group admins can disable rare events in \`${functions.configJSON.prefix}groupsettings\`.`, {
                            files: [
                                {
                                    attachment: bufferOne,
                                    name: "rareEventOne.png"
                                }
                            ],
                            disableNotificationReminder: true
                        })

                        const places = []

                        let currentPassphrase = passphraseOne

                        const filter = m => m.content === currentPassphrase && m.author.id !== message2.author.id

                        const collector = message.channel.createMessageCollector(filter, { time: 60000, maxMatches: 3 })

                        collector.on("collect", async message3 => {
                            if (!places.includes(message3.author.id)) {
                                let text2 = text + `\n\n`
                                const id = message3.author.id

                                places.push(id)

                                const firstUser = places[0] ? client.users.get(places[0]) : ""
                                const secondUser = places[1] ? client.users.get(places[1]) : ""
                                const thirdUser = places[2] ? client.users.get(places[2]) : ""

                                let firstPlace = firstUser ? firstUser.tag : "No-one"
                                let secondPlace = secondUser ? secondUser.tag : "No-one"
                                let thirdPlace = thirdUser ? thirdUser.tag : "No-one"

                                if (collector.collected.size === 1) secondPlace = `**${secondPlace}**`
                                if (collector.collected.size === 2) thirdPlace = `**${thirdPlace}**`

                                text2 += `🥇 ${firstPlace} - £${firstPlaceMoney}

                                    🥈 ${secondPlace} - £${secondPlaceMoney}

                                    🥉 ${thirdPlace} - £${thirdPlaceMoney}

                                    • To get a placement you need to type the code in the attached image.
                                    • The code is case sensitive.
                                    • Group owners, group co-owners & group admins can disable rare events in \`${functions.configJSON.prefix}groupsettings\`.`

                                if (collector.collected.size === 1) {
                                    currentPassphrase = passphraseTwo
                                    message2.delete()
                                    message2 = await message.reply(text2, {
                                        files: [
                                            {
                                                attachment: bufferTwo,
                                                name: "rareEventTwo.png"
                                            }
                                        ],
                                        disableNotificationReminder: true
                                    })
                                }

                                if (collector.collected.size === 2) {
                                    currentPassphrase = passphraseThree
                                    message2.delete()
                                    message2 = await message.reply(text2, {
                                        files: [
                                            {
                                                attachment: bufferThree,
                                                name: "rareEventThree.png"
                                            }
                                        ],
                                        disableNotificationReminder: true
                                    })
                                }
                            } else {
                                message3.reply("You've already used a code from this event. Please wait for a new event.", { disableNotificationReminder: true })
                                    .then(message4 => {
                                        setTimeout(_ => message4.delete(), 5000)
                                    })
                            }
                        })

                        collector.on("end", collected => {
                            const text = [
                                "**Rare Event**"
                            ]

                            let firstPlace = `🥇 No-one won £${firstPlaceMoney}.`
                            let secondPlace = `🥈 No-one won £${secondPlaceMoney}.`
                            let thirdPlace = `🥉 No-one won £${thirdPlaceMoney}.`

                            let i = 0

                            places.forEach(async (id, index) => {
                                const user = client.users.get(id)
                                await functions.checkForDatabaseData(id)

                                if (index === 0) {
                                    await functions.addToWallet(id, firstPlaceMoney)

                                    firstPlace = `🥇 ${user.tag} won £${firstPlaceMoney}.`
                                }

                                if (index === 1) {
                                    await functions.addToWallet(id, secondPlaceMoney)

                                    secondPlace = `🥈 ${user.tag} won £${secondPlaceMoney}.`
                                }

                                if (index === 2) {
                                    await functions.addToWallet(id, thirdPlaceMoney)

                                    thirdPlace = `🥉 ${user.tag} won £${thirdPlaceMoney}.`
                                }

                                i += 1
                            })

                            const interval = setInterval(_ => {
                                if (i === places.length) {
                                    clearInterval(interval)

                                    text.push(firstPlace)
                                    text.push(secondPlace)
                                    text.push(thirdPlace)

                                    message2.edit(text.join("\n\n"), { removeAttachments: true })
                                }
                            })
                        })
                    }
                }

                if (functions.readJSON("groups")[message.channel.id].blacklist && functions.readJSON("groups")[message.channel.id].blacklist[message.author.id]) return

                if (functions.readJSON("groups")[message.channel.id].nonPrefixCommands === true) {
                    if (message.content.toLowerCase().includes("i forgot")) {
                        return message.reply("https://www.youtube.com/watch?v=7QbStB6VBoc")
                    }
                    if (message.content.toLowerCase().includes("i forgor")) {
                        return message.reply("https://www.youtube.com/watch?v=98zY9hBGavg")
                    }
                    if (message.content.toLowerCase().includes("aaaaa")) {
                        return message.reply("https://www.youtube.com/watch?v=UnUlEgfpxIo")
                    }
                    if (message.content.toLowerCase().includes("snake")) {
                        return message.reply("Snake? Snake?! Snaaaaaake!")
                    }
                    if (message.content.toLowerCase().includes("damn")) {
                        return message.reply("ZAMN")
                    }
                    if (message.content.toLowerCase().includes("zamn")) {
                        return message.reply("", {
                            files: [
                                {
                                    attachment: fs.readFileSync(`./resources/other/ZAMN.png`),
                                    name: "ZAMN.png"
                                }
                            ],
                            disableAutoQuote: true,
                            disableNotificationReminder: true
                        })
                    }
                    if (message.content.toLowerCase().includes("zad")) {
                        return message.reply("", {
                            files: [
                                {
                                    attachment: fs.readFileSync(`./resources/other/zad.png`),
                                    name: "zad.png"
                                }
                            ],
                            disableAutoQuote: true,
                            disableNotificationReminder: true
                        })
                    }
                }

                if (functions.readJSON("groups")[message.channel.id].nonPrefixReactions === true) {
                    if (message.content.toLowerCase().includes("ratio")) {
                        message.react("👍")
                        message.react("👎")
                    }

                    if ((message.content.toLowerCase().includes("cap") || message.content.toLowerCase().includes("🧢")) && message.referencedMessage) {
                        message.referencedMessage.react("🧢")
                    }
                }
            }
        }
    }
}