const functions = require("../functions")
const User = require("../Schemas/User")

module.exports = {
    name: "withdraw",
    description: "Withdraws £[amountOfMoney] from the bank.",
    aliases: ["with"],
    usage: "[amountOfMoney]",
    file: __filename,
    cooldown: 10,
    async execute(client, message, args, argsArray, target) {
        const userData = await User.findOne({ id: message.author.id })
        const bank = userData.currency_bank

        let amount = bank

        if (argsArray[0] && parseInt(argsArray[0])) {
            argsArray[0] = argsArray[0].replace(/[^0-9]/g, "")

            amount = parseInt(argsArray[0])
        }

        if (amount > bank) {
            amount = bank
        }

        if (amount === 0) {
            return message.reply(`You don't have enough money in your bank.`)
        }

        await functions.addToWallet(message.author.id, amount)
        await functions.removeFromBank(message.author.id, amount)

        message.reply(`You have withdrew ${amount.toString().startsWith("-") ? "-" : ""}£${Math.abs(amount)} from the bank.`)
    }
}