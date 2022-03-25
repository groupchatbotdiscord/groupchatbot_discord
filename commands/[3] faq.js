const music = [
    "Can you add music commands? - Type: Music",
    `No, there's 2 limitations preventing me from adding them:
    #1: Discord doesn't have an API endpoint for joining group calls.
    #2: User accounts can only be in one call at a time.`
]
const embeds = [
    "What happened to using embeds? - Type: Embeds",
    `Discord has made a change that stops user accounts from using embeds.
    The reason is unclear but I reckon it's to make scams more obvious.`
]

function default1() {
    return `**${music[0]}**
    ${music[1]}

    **${embeds[0]}**
    ${embeds[1]}`
}

module.exports = {
    name: "faq",
    description: "View frequently asked questions.",
    usage: "[type]",
    aliases: [],
    file: __filename,
    async execute(client, message, args, argsArray) {
        if (!argsArray[0]) {
            message.reply(default1())
        } else {
            const faqType = argsArray[0].toLowerCase()
            switch (faqType) {
                case "music":
                    message.reply(`**${music[0]}**
                    ${music[1]}`)
                    break
                case "embeds":
                    message.reply(`**${embeds[0]}**
                    ${embeds[1]}`)
                    break
                default:
                    message.reply(default1())
                    break
            }
        }
    }
}