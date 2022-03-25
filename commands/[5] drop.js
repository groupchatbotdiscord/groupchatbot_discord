const { Message } = require("discord.js")
const functions = require("../functions")
const crypto = require("crypto")

module.exports = {
    name: "drop",
    description: "Drops <amountOfMoney> for a user to claim.",
    usage: "<amountOfMoney>",
    aliases: [],
    file: __filename,
    cooldown: 120,
    /**
     * @param {Message} message
     */
    async execute(client, message, args, argsArray, target) {
        if (argsArray[0]) {
            if (parseInt(argsArray[0])) {
                argsArray[0] = argsArray[0].replace(/[^0-9]/g, "")

                const amount = parseInt(argsArray[0])

                await functions.removeFromWallet(message.author.id, amount)

                const passphrase = crypto.randomBytes(64).toString("base64").replace(/[^A-Za-z0-9]/g, "").substring(0, 8).replaceAll("I", "i").replaceAll("l", "L")

                message.reply(`${message.author.username} has dropped £${amount}.

                The first user to type \`claim ${passphrase}\` gets £${amount}.

                • The claim code is case sensitive.`)
                    .then(message2 => {
                        const filter = m => m.author.id !== message.author.id && m.content === `claim ${passphrase}`

                        message2.channel.awaitMessages(filter, { maxMatches: 1 })
                            .then(async collected => {
                                const message = collected.first()

                                await functions.checkForDatabaseData(message.author.id)
                                await functions.addToWallet(message.author.id, amount)
                                message2.edit(`${message.author.username} has claimed the £${amount}.`)
                            })
                    })
            } else {
                return message.reply(`The amount parameter has to be a number. You entered: **${argsArray[0]}**.`)
            }
        } else {
            message.reply(`You can't drop nothing.`)
        }
    }
}