const functions = require("../functions")

module.exports = {
    name: "giveadmin",
    description: "Gives <@user> admin.",
    usage: "<@user>",
    aliases: ["admin", "ga"],
    permission: "GROUP_OWNERS_COOWNERS",
    file: __filename,
    async execute(client, message, args, argsArray, target) {
        if (target) {
            const array = functions.readJSON("groups")[message.channel.id] ? functions.readJSON("groups")[message.channel.id].admins || [] : []

            array.push(target.id)

            if (!functions.readJSON("groups")[message.channel.id])
                functions.writeJSON("groups", message.channel.id, {}, `file[path] = data`)

            functions.writeJSON("groups", message.channel.id, array, `file[path]["admins"] = data`)

            message.reply(`${target.username} is now an admin.
            They can now use ${functions.configJSON.prefix}groupsettings, ${functions.configJSON.prefix}lockname/${functions.configJSON.prefix}unlockname and ${functions.configJSON.prefix}snipelogs/${functions.configJSON.prefix}editsnipelogs.`)
        } else {
            message.reply(`This command requires you to @mention a user.

            **Usage**
            ${functions.configJSON.prefix}giveadmin <@user>

            **Example**
            ${functions.configJSON.prefix}giveadmin ${message.author}`)
        }
    }
}