const functions = require("../functions")
const User = require("../Schemas/User")

module.exports = {
    name: "pay",
    description: "Pays <@user> £<amountToGive>.",
    aliases: ["give", "share"],
    usage: "<@user> <amountToGive>",
    cooldown: 10,
    file: __filename,
    async execute(client, message, args, argsArray, target) {
        if (argsArray[1]) {
            if (target) {
                if (target.id !== message.author.id) {
                    const targetUserData = await User.findOne({ id: target.id })

                    if (targetUserData.currency_prison) {
                        return message.reply(`⛓️ This user is in prison. ⛓️

                        • They can be paid at <t:${targetUserData.currency_prison}> (<t:${targetUserData.currency_prison}:R>)`)
                    }

                    const userData = await User.findOne({ id: message.author.id })
                    const wallet = userData.currency_wallet
                    const bank = userData.currency_bank
                    const total = wallet + bank

                    let amount = null

                    if (parseInt(argsArray[1] && total >= 0)) {
                        argsArray[1] = argsArray[1].replace(/[^0-9]/g, "")

                        amount = parseInt(argsArray[1])
                    } else if (argsArray[1].toLowerCase() === "wallet" && wallet >= 0) {
                        amount = wallet
                    } else if (argsArray[1].toLowerCase() === "bank" && bank >= 0) {
                        amount = bank
                    } else if (argsArray[1].toLowerCase() === "total" && total >= 0) {
                        amount = total
                    } else {
                        return message.reply(`The second parameter has to be a number, \`wallet\`, \`bank\` or \`total\`. You entered: **${argsArray[1]}**.

                        • Entered a valid type? Make sure you're not attempting to give negative money.`)
                    }

                    if (amount <= total) {
                        await functions.removeFromWallet(message.author.id, amount)
                        await functions.addToWallet(target.id, amount)

                        message.reply(`You have given £${amount} to ${target.username}.`)
                    } else {
                        message.reply(`You don't have enough money in total.`)

                        if (this.cooldown) {
                            let now = Date.now() - (this.cooldown * 1000 - 5000)

                            functions.writeJSON("cooldowns", message.author.id, now, `file[path]["${this.name}"] = data`)
                        }
                    }
                } else {
                    message.reply("How are you gonna pay yourself your own money?")

                    if (this.cooldown) {
                        let now = Date.now() - (this.cooldown * 1000 - 5000)

                        functions.writeJSON("cooldowns", message.author.id, now, `file[path]["${this.name}"] = data`)
                    }
                }
            } else {
                message.reply(`The first parameter has to be a user. You entered: **${argsArray[0]}**.`)

                if (this.cooldown) {
                    let now = Date.now() - (this.cooldown * 1000 - 5000)

                    functions.writeJSON("cooldowns", message.author.id, now, `file[path]["${this.name}"] = data`)
                }
            }
        } else {
            message.reply(`This command requires 2 parameters.

            **Usage**: !pay <@user> <amount to give>

            **Example**: !pay ${message.author} 100`)

            if (this.cooldown) {
                let now = Date.now() - (this.cooldown * 1000 - 5000)

                functions.writeJSON("cooldowns", message.author.id, now, `file[path]["${this.name}"] = data`)
            }
        }
    }
}