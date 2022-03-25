const functions = require("../functions")
const User = require("../Schemas/User")

module.exports = {
    name: "shop",
    description: "View the shop.",
    aliases: [],
    file: __filename,
    cooldown: 10,
    async execute(client, message, args, argsArray, target) {
        const shop = functions.shopJSON
        const userData = await User.findOne({ id: message.author.id })
        const inventory = userData.currency_inventory

        const padlock = inventory.padlock || 0
        const invisibilityPotion = inventory.invisibilityPotion || 0
        const lockpick = inventory.lockpick || 0

        const text = `**${shop.padlock.name}** (${padlock}) - £${shop.padlock.price} - Item IDs: ${shop.padlock.ids.map(i => `\`${i}\``).join(", ")}
        ${shop.padlock.description}

        **${shop.invisibilityPotion.name}** (${invisibilityPotion}) - £${shop.invisibilityPotion.price} - Item IDs: ${shop.invisibilityPotion.ids.map(i => `\`${i}\``).join(", ")}
        ${shop.invisibilityPotion.description}

        **${shop.lockpick.name}** (${lockpick}) - £${shop.lockpick.price} - Item IDs: ${shop.lockpick.ids.map(i => `\`${i}\``).join(", ")}
        ${shop.lockpick.description}`

        message.reply(text)
    }
}