const { Message } = require("discord.js")
const functions = require("../functions")
const User = require("../Schemas/User")

module.exports = {
    name: "crime",
    description: `Commit crime for money.
    This CAN lead to prison time.`,
    aliases: [],
    file: __filename,
    cooldown: 150,
    /**
     * @param {Message} message
     */
    async execute(client, message, args) {
        const id = message.author.id

        const moneyForSuccess = functions.generateNumber(500, 1000)
        const moneyForSuccessTrain = functions.generateNumber(2500, 5000)
        const moneyToPay = functions.generateNumber(200, 500)

        let chance = functions.generateChance(50)
        let trainChance = functions.generateChance(10)

        let prisonTime = functions.generateChance(80)
        let prisonTimeMinutes = functions.generateNumber(2, 10)
        let bribeAmount = functions.generateNumber(100, 200)

        if (chance) {
            if (trainChance) {
                await functions.addToWallet(message.author.id, moneyForSuccessTrain)

                message.reply(`You robbed a train for £${moneyForSuccessTrain}.`)
            } else {
                await functions.addToWallet(message.author.id, moneyForSuccess)

                message.reply(`You robbed a bank for £${moneyForSuccess}.`)
            }
        } else {
            if (prisonTime) {
                message.reply(`You were caught by the police.

                • Send **b** to attempt to bribe.
                • Send **p** to go to prison for ${prisonTimeMinutes} minute${prisonTimeMinutes === 1 ? "" : "s"} and lose £${moneyToPay}.
                • Send **r** to attempt to run.

                • Going to prison means you won't be able to use currency commands until your sentence time is over.
                • Bribing will cost £${bribeAmount} but has a chance of increasing your sentence time by 5 minutes if unsuccessful.
                • Running has a high chance of increasing your sentence time by 10 minutes if unsuccessful.
                • You have 1 minute to decide.`)
                    .then(async message2 => {
                        await User.findOneAndUpdate(
                            {
                                id
                            },
                            {
                                currency_policeCaught: message2.url
                            },
                            {
                                useFindAndModify: true
                            }
                        )

                        const filter = m => m.author.id === message.author.id && (m.content.toLowerCase() === "b" || m.content.toLowerCase() === "p" || m.content.toLowerCase() === "r")

                        message.channel.awaitMessages(filter, { maxMatches: 1, time: 60000, errors: ["time"] })
                            .then(async collected => {
                                const message = collected.first()

                                switch (message.content.toLowerCase()) {
                                    case "b": {
                                        const success = functions.generateChance(50)

                                        if (success) {
                                            await functions.removeFromWallet(message.author.id, bribeAmount)

                                            message2.edit(`Your bribe was successful.
                                            You lost £${bribeAmount} but you weren't sentenced to prison.`)
                                        } else {
                                            const increaseByFive = functions.generateChance(50)

                                            if (increaseByFive) prisonTimeMinutes += 5

                                            await functions.removeFromWallet(message.author.id, bribeAmount)
                                            await functions.setPrisonTime(message.author.id, prisonTimeMinutes, message2.url)

                                            message2.edit(`Your bribe was unsuccessful.
                                            You lost £${bribeAmount} and were sentenced to ${prisonTimeMinutes} minutes in prison.

                                            • ${increaseByFive ? "Your sentence was increased by 5 minutes." : "Your sentence was not increased."}`)
                                        }
                                        const data = await User.findOne({ id })

                                        data.currency_policeCaught = undefined
                                        await data.save()
                                        break
                                    } case "p": {
                                        await functions.removeFromWallet(message.author.id, moneyToPay)
                                        await functions.setPrisonTime(message.author.id, prisonTimeMinutes, message2.url)

                                        message2.edit(`You lost £${moneyToPay} and were sentenced to ${prisonTimeMinutes} minutes in prison.`)
                                        const data = await User.findOne({ id })

                                        data.currency_policeCaught = undefined
                                        await data.save()
                                        break
                                    } case "r": {
                                        const success = functions.generateChance(35)

                                        if (success) {
                                            message2.edit(`You managed to run from the police.`)
                                        } else {
                                            const increaseByTen = functions.generateChance(90)

                                            if (increaseByTen) prisonTimeMinutes += 10

                                            await functions.removeFromWallet(message.author.id, moneyToPay)
                                            await functions.setPrisonTime(message.author.id, prisonTimeMinutes, message2.url)

                                            message2.edit(`You were not able to get away from the police.
                                            You lost £${moneyToPay} and were sentenced to ${prisonTimeMinutes} minutes in prison.

                                            • ${increaseByTen ? "Your sentence was increased by 10 minutes." : "Your sentence was not increased."}`)
                                        }
                                        const data = await User.findOne({ id })

                                        data.currency_policeCaught = undefined
                                        await data.save()
                                        break
                                    }
                                }
                            })
                            .catch(async collected => {
                                await functions.removeFromWallet(message.author.id, moneyToPay)
                                await functions.setPrisonTime(message.author.id, prisonTimeMinutes, message2.url)

                                message2.edit(`You took too long to decide, you lost £${moneyToPay} and were sentenced to ${prisonTimeMinutes} minutes in prison.`)
                                const data = await User.findOne({ id })

                                data.currency_policeCaught = undefined
                                await data.save()
                            })
                    })
            } else {
                await functions.removeFromWallet(message.author.id, moneyToPay)

                message.reply(`You were caught by the police.
                You don't have to go to prison but you were fined £${moneyToPay}.`)
            }
        }
    }
}