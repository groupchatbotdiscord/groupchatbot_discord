const functions = require("../functions")

module.exports = {
    name: "unlockname",
    description: "Unlocks the group name.",
    aliases: ["uln"],
    permission: "GROUP_OWNERS_COOWNERS_ADMINS",
    file: __filename,
    async execute(client, message, args, argsArray, target) {
        if (functions.readJSON("groups")[message.channel.id] && functions.readJSON("groups")[message.channel.id].lockedGroupName) {
            message.reply("The group name has been unlocked.")

            functions.writeJSON("groups", message.channel.id, args, "delete file[path].lockedGroupName")
        } else {
            message.reply(`The group name couldn't be unlocked.

            **Reason**
            This group doesn't have any name lock data.`)
        }
    }
}