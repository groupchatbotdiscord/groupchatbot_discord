const functions = require("../functions")
const User = require("../Schemas/User")

module.exports = {
    name: "inventory",
    description: "Shows you [@user]'s inventory.",
    usage: "[@user]",
    aliases: ["inv"],
    file: __filename,
    cooldown: 10,
    async execute(client, message, args, argsArray, target) {
        const target2 = target || message.author

        const userData = await User.findOne({ id: target2.id })

        const shop = functions.shopJSON

        const inventory = userData.currency_inventory

        const padlock = inventory.padlock || 0
        const invisibilityPotion = inventory.invisibilityPotion || 0

        const text = `**${target2.username}'s Inventory**

        **${shop.padlock.name}** - ${padlock}
        **${shop.invisibilityPotion.name}** - ${invisibilityPotion}`

        message.reply(text)
    }
}