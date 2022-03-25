const functions = require("../functions")
const User = require("../Schemas/User")

module.exports = {
    name: "profile",
    description: "Shows you [@user]'s profile.",
    usage: "[@user]",
    aliases: ["pf", "balance", "bal"],
    file: __filename,
    cooldown: 5,
    async execute(client, message, args, argsArray, target) {
        const target2 = target || message.author

        const userData = await User.findOne({ id: target2.id })

        const padlock = userData.currency_activeItems.padlock
        const invisibilityPotion = userData.currency_activeItems.invisibilityPotion

        const shop = functions.shopJSON

        const activeItems = []

        if (padlock) {
            activeItems.push(`**${shop.padlock.name}**: Ends <t:${padlock}:R> (<t:${padlock}>)`)
        }

        if (invisibilityPotion) {
            activeItems.push(`**${shop.invisibilityPotion.name}**: Ends <t:${invisibilityPotion}:R> (<t:${invisibilityPotion}>)`)
        }

        const passive = userData.settings_passiveMode

        let robbable = true

        let prison = false

        if (userData.currency_prison) prison = true

        if (padlock || passive || userData.currency_wallet < 100 || prison) robbable = false

        const text = `**${target2.username}'s Profile**

        **Wallet**: £${userData.currency_wallet}
        **Bank**: £${userData.currency_bank} / £${userData.currency_bankLimit}
        **Total**: £${userData.currency_wallet + userData.currency_bank}

        **Passive Mode**: ${passive === true ? "Enabled" : "Disabled"}

        **Robbable**: ${robbable === true ? "Yes" : "No"}

        **Command Usage Count**: ${userData.currency_commandUsageCount}

        **In Prison**: ${prison ? "Yes" : "No"}${activeItems[0] ? "\n\n" + activeItems.join("\n") : ""}`

        message.reply(text)
    }
}