const functions = require("../functions")

module.exports = {
    name: "unblacklist",
    description: "Removes <@user> from the group blacklist.",
    usage: "<@user>",
    aliases: ["ubl"],
    file: __filename,
    permission: "GROUP_OWNERS_COOWNERS",
    async execute(client, message, args, argsArray, target) {
        if (target) {
            if (!functions.readJSON("groups")[message.channel.id]) functions.writeJSON("groups", message.channel.id, {}, `file[path] = data`)
            if (!functions.readJSON("groups")[message.channel.id].blacklist) functions.writeJSON("groups", message.channel.id, {}, `file[path].blacklist = data`)

            if (functions.readJSON("groups")[message.channel.id].blacklist[target.id]) {
                functions.writeJSON("groups", message.channel.id, null, `delete file[path].blacklist["${target.id}"]`)

                message.reply(`${target.username} has been removed from the group blacklist.`)
            } else {
                message.reply(`${target.username} is not group blacklisted.`)
            }
        } else {
            message.reply(`You need to @mention someone to use this command.

            **Usage**
            ${functions.configJSON.prefix}unblacklist <@user>

            **Example**
            ${functions.configJSON.prefix}unblacklist ${message.author}`)
        }
    }
}