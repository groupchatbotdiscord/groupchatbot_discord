const functions = require("../functions")

module.exports = {
    name: "search",
    description: "Search for money.",
    aliases: [],
    cooldown: 60,
    file: __filename,
    async execute(client, message, args, argsArray, target) {
        const moneyToGive = functions.generateNumber(50, 70)

        const chance = functions.generateChance(80)

        if (chance) {
            await functions.addToWallet(message.author.id, moneyToGive)

            message.reply(`You found £${moneyToGive}.`)
        } else {
            message.reply("You couldn't find any money.")
        }
    }
}