const functions = require("../functions")
const User = require("../Schemas/User")

module.exports = {
    name: "deposit",
    description: "Deposits £[amountOfMoney] to the bank.",
    aliases: ["dep"],
    usage: "[amountOfMoney]",
    file: __filename,
    cooldown: 10,
    async execute(client, message, args, argsArray, target) {
        const userData = await User.findOne({ id: message.author.id })

        const wallet = userData.currency_wallet
        const bank = userData.currency_bank

        const bankLimit = userData.currency_bankLimit

        const bankSpace = bankLimit - bank

        let amount = wallet

        if (argsArray[0] && parseInt(argsArray[0])) {
            argsArray[0] = argsArray[0].replace(/[^0-9]/g, "")

            amount = parseInt(argsArray[0])
        }

        if (amount > wallet) {
            amount = wallet
        }

        if (amount > bankSpace) {
            amount = bankSpace
        }

        if (amount === 0) {
            if (bank === bankLimit) {
                return message.reply(`You've reached your bank limit.
                Using 5 commands adds an extra £400 (£100 on passive mode) to your bank limit.`)
            } else {
                return message.reply(`You don't have any money in your wallet.`)
            }
        }

        await functions.removeFromWallet(message.author.id, amount)
        await functions.addToBank(message.author.id, amount)

        message.reply(`You have deposited £${amount} to the bank.`)
    }
}