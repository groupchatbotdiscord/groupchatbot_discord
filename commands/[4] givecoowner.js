const functions = require("../functions")

module.exports = {
    name: "givecoowner",
    description: "Gives <@user> co-owner.",
    usage: "<@user>",
    aliases: ["coowner", "gco"],
    permission: "GROUP_OWNERS",
    file: __filename,
    async execute(client, message, args, argsArray, target) {
        if (target) {
            const array = functions.readJSON("groups")[message.channel.id] ? functions.readJSON("groups")[message.channel.id].coOwners || [] : []

            array.push(target.id)

            if (!functions.readJSON("groups")[message.channel.id])
                functions.writeJSON("groups", message.channel.id, {}, `file[path] = data`)

            functions.writeJSON("groups", message.channel.id, array, `file[path]["coOwners"] = data`)

            message.reply(`${target.username} is now a co-owner.
            They can now use admin commands + ${functions.configJSON.prefix}giveadmin/${functions.configJSON.prefix}removeadmin, ${functions.configJSON.prefix}blacklist/${functions.configJSON.prefix}unblacklist and ${functions.configJSON.prefix}clearsnipedata/${functions.configJSON.prefix}cleareditsnipedata.`)
        } else {
            message.reply(`This command requires you to @mention a user.`)
        }
    }
}