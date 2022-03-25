const functions = require("../functions")

module.exports = {
    name: "coowners",
    description: "Shows a list of the group co-owners.",
    aliases: [],
    file: __filename,
    async execute(client, message, args, argsArray, target) {
        const array = functions.readJSON("groups")[message.channel.id] ? functions.readJSON("groups")[message.channel.id].coOwners || [] : []

        if (array.length > 0) {
            let i = 0

            array.forEach(async value => {
                await client.fetchUser(value, true, true)
                i += 1
            })

            const interval = setInterval(_ => {
                if (i === array.length) {
                    clearInterval(interval)

                    const users = []

                    array.forEach(id => {
                        users.push(`• ${client.users.get(id).tag}`)
                    })

                    message.reply(`${users.join("\n")}`)
                }
            }, 100)
        } else {
            message.reply("There are no group co-owners.")
        }
    }
}