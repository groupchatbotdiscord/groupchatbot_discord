const functions = require("../functions")
const User = require("../Schemas/User")

module.exports = {
    name: "rob",
    description: "Attempts to rob from <@user>.",
    aliases: ["steal"],
    cooldown: 120,
    usage: "<@user>",
    file: __filename,
    async execute(client, message, args, argsArray, target) {
        if (target === `Rob ID`) return message.reply("You can no longer rob users via their ID.\n\n**Reason**: It was **too** good.")
        if (target) {
            if (target.id !== message.author.id) {
                const userData = await User.findOne({ id: message.author.id })
                const targetUserData = await User.findOne({ id: target.id })

                const wallet = userData.currency_wallet
                const bank = userData.currency_bank
                const total = wallet + bank

                const passive = userData.settings_passiveMode

                const invisibilityPotion = userData.currency_activeItems.invisibilityPotion

                const targetWallet = targetUserData.currency_wallet

                const targetPassive = targetUserData.settings_passiveMode

                const targetPadlock = targetUserData.currency_activeItems.padlock

                const success = invisibilityPotion ? functions.generateChance(80) : functions.generateChance(50)

                const wearOff = functions.generateChance(20)

                let wearOffText = ""

                const moneyToRob = targetPadlock ? functions.generateNumber(500, 5000) : functions.generateNumber(100, targetWallet)
                const moneyToGive = invisibilityPotion ? functions.generateNumber(100, total > 10000 ? 10000 : total) : functions.generateNumber(100, total > 5000 ? 5000 : total)
                let moneyFined = functions.generateNumber(100, total > 10000 ? 10000 : total)

                if (targetUserData.currency_prison) {
                    return message.reply(`⛓️ This user is in prison. ⛓️

                    • They can be robbed at <t:${targetUserData.currency_prison}> (<t:${targetUserData.currency_prison}:R>)`)
                }

                if (!passive) {
                    if (!targetPassive) {
                        if (total >= 100) {
                            if (targetWallet >= 100) {
                                if (!targetPadlock) {
                                    if (success) {
                                        await functions.addToWallet(message.author.id, moneyToRob)
                                        await functions.removeFromWallet(target.id, moneyToRob)

                                        if (invisibilityPotion && wearOff) {
                                            wearOffText = "Your invisibility potion wore off after you left."

                                            userData.currency_activeItems.invisibilityPotion = undefined
                                            await userData.save()
                                        }

                                        message.reply(`You robbed £${moneyToRob} from ${target.username}. ${wearOffText}`)

                                        const logs = targetUserData.currency_logs

                                        logs.unshift({
                                            action: "rob",
                                            user: message.author.id,
                                            took: moneyToRob,
                                            timestamp: parseInt(Date.now() / 1000),
                                            url: message.url,
                                            success: true,
                                            read: false
                                        })

                                        await targetUserData.save()
                                    } else {
                                        await functions.removeFromWallet(message.author.id, moneyToGive)
                                        await functions.addToWallet(target.id, moneyToGive)

                                        let text = `You were caught trying to rob ${target.username}, they forced you to give them £${moneyToGive}.`

                                        if (invisibilityPotion) {
                                            text = `Your invisibility potion wore off whilst attempting to rob ${target.username}, they caught you and forced you to give them £${moneyToGive}.`

                                            userData.currency_activeItems.invisibilityPotion = undefined
                                            await userData.save()
                                        }

                                        message.reply(text)

                                        const logs = targetUserData.currency_logs

                                        logs.unshift({
                                            action: "rob",
                                            user: message.author.id,
                                            fined: moneyToGive,
                                            timestamp: parseInt(Date.now() / 1000),
                                            url: message.url,
                                            success: false,
                                            read: false
                                        })

                                        await targetUserData.save()
                                    }
                                } else {
                                    let padlockBreakChance = functions.generateChance(50)

                                    const policeChance = functions.generateChance(90)

                                    let text = ""

                                    if (policeChance) text = `You were caught by the police and were fined £${moneyFined}.`

                                    if (!policeChance) {
                                        text = `You managed to get away before the police arrived.`
                                        moneyFined = 0
                                    }

                                    await functions.removeFromWallet(message.author.id, moneyFined)
                                    await functions.addToWallet(target.id, moneyFined)

                                    if (padlockBreakChance) {
                                        targetUserData.currency_activeItems.padlock = undefined
                                        await targetUserData.save()
                                    }

                                    const logs = targetUserData.currency_logs

                                    logs.unshift({
                                        action: "rob",
                                        user: message.author.id,
                                        fined: moneyFined,
                                        timestamp: parseInt(Date.now() / 1000),
                                        url: message.url,
                                        success: false,
                                        read: false,
                                        padlockBroke: padlockBreakChance
                                    })

                                    await targetUserData.save()

                                    message.reply(`You attempted to rob from a user with an active padlock. ${text}`)
                                }
                            } else {
                                message.reply(`${target.username} requires at least £100 in their wallet to be robbed.`)

                                if (this.cooldown) {
                                    let now = Date.now() - (this.cooldown * 1000 - 5000)

                                    functions.writeJSON("cooldowns", message.author.id, now, `file[path]["${this.name}"] = data`)
                                }
                            }
                        } else {
                            message.reply(`You need at least £100 in total to rob users.`)

                            if (this.cooldown) {
                                let now = Date.now() - (this.cooldown * 1000 - 5000)

                                functions.writeJSON("cooldowns", message.author.id, now, `file[path]["${this.name}"] = data`)
                            }
                        }
                    } else {
                        message.reply(`${target.username} is on passive mode.`)

                        if (this.cooldown) {
                            let now = Date.now() - (this.cooldown * 1000 - 5000)

                            functions.writeJSON("cooldowns", message.author.id, now, `file[path]["${this.name}"] = data`)
                        }
                    }
                } else {
                    message.reply("You're on passive mode.")

                    if (this.cooldown) {
                        let now = Date.now() - (this.cooldown * 1000 - 5000)

                        functions.writeJSON("cooldowns", message.author.id, now, `file[path]["${this.name}"] = data`)
                    }
                }
            } else {
                message.reply("How are you gonna rob from yourself?")

                if (this.cooldown) {
                    let now = Date.now() - (this.cooldown * 1000 - 5000)

                    functions.writeJSON("cooldowns", message.author.id, now, `file[path]["${this.name}"] = data`)
                }
            }
        } else {
            message.reply(`You need to @mention a user to use this command.

            **Usage**
            ${functions.configJSON.prefix}rob <@user>

            **Example**
            ${functions.configJSON.prefix}rob ${message.author}`)

            if (this.cooldown) {
                let now = Date.now() - (this.cooldown * 1000 - 5000)

                functions.writeJSON("cooldowns", message.author.id, now, `file[path]["${this.name}"] = data`)
            }
        }

    }
}