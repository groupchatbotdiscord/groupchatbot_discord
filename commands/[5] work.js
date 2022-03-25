const functions = require("../functions")

module.exports = {
    name: "work",
    description: "Work for money.",
    aliases: ["job"],
    cooldown: 60,
    file: __filename,
    async execute(client, message, args, argsArray, target) {
        const moneyToGive = functions.generateNumber(100, 200)
        const moneyToGiveOvertime = functions.generateNumber(200, 300)
        const moneyToPay = functions.generateNumber(10, 50)

        const chance = functions.generateChance(80)
        const overtimeChance = functions.generateChance(10)

        if (chance) {
            if (overtimeChance) {
                await functions.addToWallet(message.author.id, moneyToGiveOvertime)

                message.reply(`You went to work and worked overtime.
                Your boss paid you £${moneyToGiveOvertime}.`)
            } else {
                await functions.addToWallet(message.author.id, moneyToGive)

                message.reply(`You went to work and did enough.
                Your boss paid you £${moneyToGive}.`)
            }
        } else {
            await functions.removeFromWallet(message.author.id, moneyToPay)

            message.reply(`You went to work and didn't do enough.
            Your boss fined you £${moneyToPay}.`)
        }
    }
}