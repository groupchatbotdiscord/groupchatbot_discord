const { Client } = require("discord.js")
const functions = require("../functions")

module.exports = {
    name: "beg",
    description: "Beg for money.",
    aliases: [],
    cooldown: 30,
    file: __filename,
    /**
     * 
     * @param {Client} client 
     * @param {*} message 
     * @param {*} args 
     * @param {*} argsArray 
     * @param {*} target 
     */
    async execute(client, message, args, argsArray, target) {
        const moneyToGive = functions.generateNumber(20, 50)

        const chance = functions.generateChance(95)

        if (chance) {
            await functions.addToWallet(message.author.id, moneyToGive)

            message.reply(`Someone gave you £${moneyToGive}.`)
        } else {
            message.reply("No one gave you any money.")
        }
    }
}