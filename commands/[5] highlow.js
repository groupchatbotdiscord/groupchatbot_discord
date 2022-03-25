const { Message } = require("discord.js")
const functions = require("../functions")

module.exports = {
    name: "highlow",
    description: "Earn money by guessing if the hidden number is higher or lower than your hint.",
    aliases: ["hl"],
    file: __filename,
    cooldown: 30,
    /**
     * @param {Message} message
     */
    async execute(client, message, args, argsArray) {
        const hint = functions.generateNumber(1, 100)
        const number = functions.generateNumber(1, 100)

        const winningAmount = functions.generateNumber(500, 1000)
        const jackpotAmount = functions.generateNumber(1000, 2000)

        const lastText = `Your hint was **${hint}** & the hidden number was **${number}**.`

        message.reply(`Is the hidden number higher or lower than **${hint}**?

        • Send **h** for **higher**.
        • Send **j** for **jackpot**.
        • Send **l** for **lower**.

        • If you think the hint is the hidden number is the same number as the hint send **j**.`)
            .then(message2 => {
                const filter = m => m.author.id === message.author.id && (m.content.toLowerCase() === "h" || m.content.toLowerCase() === "j" || m.content.toLowerCase() === "l")
                message.channel.awaitMessages(filter, { maxMatches: 1, time: 30000, errors: ["time"] })
                    .then(async collected => {
                        const message = collected.first()

                        switch (message.content.toLowerCase()) {
                            case "h":
                                if (number > hint) {
                                    await functions.addToWallet(message.author.id, winningAmount)

                                    message2.edit(`You won £${winningAmount}.
                                    ${lastText}`)
                                } else {
                                    message2.edit(`You lost.
                                    ${lastText}`)
                                }
                                break
                            case "j":
                                if (number === hint) {
                                    await functions.addToWallet(message.author.id, jackpotAmount)

                                    message2.edit(`You won £${jackpotAmount}.
                                    ${lastText}`)
                                } else {
                                    message2.edit(`You lost.
                                    ${lastText}`)
                                }
                                break
                            case "l":
                                if (number < hint) {
                                    await functions.addToWallet(message.author.id, winningAmount)

                                    message2.edit(`You won £${winningAmount}.
                                    ${lastText}`)
                                } else {
                                    message2.edit(`You lost.
                                    ${lastText}`)
                                }
                                break
                        }
                    })
                    .catch(collected => {
                        message2.edit(`You didn't answer in time.
                        ${lastText}`)
                    })
            })
    }
}