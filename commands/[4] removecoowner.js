const functions = require("../functions")

module.exports = {
    name: "removecoowner",
    description: "Removes co-owner from <@user>.",
    usage: "<@user>",
    aliases: ["uncoowner", "rco"],
    permission: "GROUP_OWNERS",
    file: __filename,
    async execute(client, message, args, argsArray, target) {
        if (target) {
            const array = functions.readJSON("groups")[message.channel.id] ? functions.readJSON("groups")[message.channel.id].coOwners || [] : []

            if (array.includes(target.id)) {
                array.splice(array.indexOf(target.id, 1))
                functions.writeJSON("groups", message.channel.id, array, `file[path]["coOwners"] = data`)
                message.reply(`${target.username} is no longer a co-owner.`)
            } else {
                message.reply(`${target.username} isn't a co-owner.`)
            }
        } else {
            message.reply(`This command requires you to @mention a user.`)
        }
    }
}