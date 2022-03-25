const functions = require("../functions")
const User = require("../Schemas/User")

module.exports = {
    name: "use",
    description: "Use [amount] <Item ID>.",
    usage: "<Item ID> [amount]",
    aliases: [],
    file: __filename,
    cooldown: 10,
    async execute(client, message, args, argsArray, target) {
        if (!argsArray[0]) argsArray[0] = ""

        const shop = functions.shopJSON

        const userData = await User.findOne({ id: message.author.id })
        const inventory = userData.currency_inventory
        const activeItems = userData.currency_activeItems

        const padlock = inventory.padlock || 0
        const invisibilityPotion = inventory.invisibilityPotion || 0

        const id = argsArray[0].toLowerCase()

        const amount = parseInt(argsArray[1]) || 1

        if (shop.padlock.ids.includes(id)) {
            if (padlock >= 1) {
                if (!activeItems.padlock) {
                    userData.currency_inventory.padlock -= amount
                    await userData.save()

                    activeItems.padlock = parseInt(Date.now() / 1000) + 2628288

                    message.reply(`You have used a padlock.
                    Whenever someone attempts to rob from you it'll have a 50% chance of breaking.`)
                } else {
                    message.reply(`You already have an active padlock.`)
                }
            } else {
                message.reply(`You don't have any padlocks.`)
            }
        } else if (shop.invisibilityPotion.ids.includes(id)) {
            if (invisibilityPotion >= 1) {
                if (!activeItems.invisibilityPotion) {
                    userData.currency_inventory.invisibilityPotion -= amount
                    await userData.save()

                    activeItems.invisibilityPotion = parseInt(Date.now() / 1000) + 86400

                    message.reply(`You have used an invisibility potion.
                    Your chance of successfully robbing someone has increased.`)
                } else {
                    message.reply(`You already have an active invisibility potion.`)
                }
            } else {
                message.reply(`You don't have any invisibility potions.`)
            }
        } else {
            message.reply(`Unknown item ID, check \`!shop\`.`)
        }
    }
}