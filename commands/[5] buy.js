const functions = require("../functions")
const User = require("../Schemas/User")

module.exports = {
    name: "buy",
    description: "Buy [amount] <Item ID>.",
    usage: "<Item ID> [amount]",
    aliases: [],
    file: __filename,
    cooldown: 10,
    async execute(client, message, args, argsArray, target) {
        if (!argsArray[0]) argsArray[0] = ""
        const userData = await User.findOne({ id: message.author.id })

        const wallet = userData.currency_wallet
        const bank = userData.currency_bank

        const total = wallet + bank

        const shop = functions.shopJSON

        const id = argsArray[0].toLowerCase()

        const amount = parseInt(argsArray[1]) || 1

        if (shop.padlock.ids.includes(id)) {
            if (total >= (shop.padlock.price * amount)) {
                userData.currency_inventory.padlock += amount
                await userData.save()

                await functions.removeFromWallet(message.author.id, shop.padlock.price * amount)

                message.reply(`You have bought ${amount} **${shop.padlock.name}**.
                To use a padlock type \`${functions.configJSON.prefix}use padlock\`.`)
            } else {
                message.reply(`You don't have enough money in total.
                You need £${shop.padlock.price * amount} to buy ${amount} **${shop.padlock.name}**.`)
            }
        } else if (shop.invisibilityPotion.ids.includes(id)) {
            if (total >= (shop.invisibilityPotion.price * amount)) {
                userData.currency_inventory.invisibilityPotion += amount
                await userData.save()

                await functions.removeFromWallet(message.author.id, shop.invisibilityPotion.price * amount)

                message.reply(`You have bought ${amount} **${shop.invisibilityPotion.name}**.
                To use an invisibility potion type \`${functions.configJSON.prefix}use invisibilityPotion\`/\`${functions.configJSON.prefix}use ip\`.`)
            } else {
                message.reply(`You don't have enough money in total.
                You need £${shop.invisibilityPotion.price * amount} to buy ${amount} **${shop.invisibilityPotion.name}**.`)
            }
        } else {
            message.reply(`Unknown item ID, check \`${functions.configJSON.prefix}shop\`.`)
        }
    }
}