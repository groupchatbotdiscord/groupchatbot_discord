const functions = require("../functions")

module.exports = {
    name: "coinflip",
    description: "Flips a coin.",
    cooldown: 5,
    aliases: ["cf"],
    file: __filename,
    async execute(client, message) {
        const chance = functions.generateChance(50)

        if (chance) {
            message.reply("The coin landed on **heads**.")
        } else {
            message.reply("The coin landed on **tails**.")
        }
    }
}