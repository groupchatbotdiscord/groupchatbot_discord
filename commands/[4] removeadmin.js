const functions = require("../functions")

module.exports = {
    name: "removeadmin",
    description: "Removes <@user>'s admin.",
    usage: "<@user>",
    aliases: ["ra", "unadmin"],
    permission: "GROUP_OWNERS_COOWNERS",
    file: __filename,
    async execute(client, message, args, argsArray, target) {
        if (target) {
            const array = functions.readJSON("groups")[message.channel.id] ? functions.readJSON("groups")[message.channel.id].admins || [] : []
            if (array.includes(target.id)) {
                array.splice(array.indexOf(target.id, 1))
                functions.writeJSON("groups", message.channel.id, array, `file[path]["admins"] = data`)
                message.reply(`${target.username} is no longer an admin.`)
            } else {
                message.reply(`${target.username} isn't an admin.`)
            }
        } else {
            message.reply(`You need to @mention a user to use this command.

            **Usage**
            !removeadmin <@user>

            **Example**
            !removeadmin ${message.author}`)
        }
    }
}