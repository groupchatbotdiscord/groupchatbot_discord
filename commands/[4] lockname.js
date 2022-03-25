const functions = require("../functions")

module.exports = {
    name: "lockname",
    description: "Locks the group name to <name>.",
    usage: "<name>",
    aliases: ["ln"],
    permission: "GROUP_OWNERS_COOWNERS_ADMINS",
    file: __filename,
    async execute(client, message, args, argsArray, target) {
        if (argsArray[0]) {
            if (!functions.readJSON("groups")[message.channel.id])
                functions.writeJSON("groups", message.channel.id, {}, `file[path] = data`)

            if (args.length > 100)
                args = args.substring(0, 97) + "..."

            await message.reply(`The group name has been locked.

            **Name**
            ${args}`)

            functions.writeJSON("groups", message.channel.id, args, "file[path].lockedGroupName = data")
        } else {
            message.reply(`You need to provide one parameter to use this command.

            **Usage**
            !lockname <name>

            **Example**
            !lockname !lockname testing`)
        }
    }
}