const functions = require("../functions")

module.exports = {
    name: "blacklist",
    description: "Group blacklists <user> for <seconds/perm> seconds for [reason].",
    usage: "<@user> <seconds/perm> [reason]",
    aliases: ["bl"],
    file: __filename,
    permission: "GROUP_OWNERS_COOWNERS",
    async execute(client, message, args, argsArray, target) {
        if (target && argsArray[1]) {
            if (target.id === message.author.id) return message.reply("I don't think you want to blacklist yourself.")

            if (!functions.readJSON("groups")[message.channel.id]) functions.writeJSON("groups", message.channel.id, {}, `file[path] = data`)
            if (!functions.readJSON("groups")[message.channel.id].blacklist) functions.writeJSON("groups", message.channel.id, {}, `file[path].blacklist = data`)

            argsArray.shift()
            const secondsOrPerm = argsArray.shift()
            const reason = argsArray.join(" ") || "Unspecified"
            const now = parseInt(Date.now() / 1000)
            let newUnix = secondsOrPerm !== "perm" ? now + parseInt(secondsOrPerm) : 8640000000000

            functions.writeJSON("groups", message.channel.id, {
                "reason": reason,
                "endsAt": newUnix,
                "seenWarning": false,
                "blacklistedBy": message.author.id
            }, `file[path].blacklist["${target.id}"] = data`)

            message.reply(`${target.username} has been group blacklisted.

            **Reason**
            ${reason}

            **Blacklist Ends**
            <t:${newUnix}>`)
        } else {
            message.reply(`You need at least 2 parameters to use this command.

            **Usage**
            !blacklist <@user> <seconds/perm> [reason]

            **Example**
            !blacklist ${message.author} 60
            !blacklist ${message.author} 60 test
            !blacklist ${message.author} perm
            !blacklist ${message.author} perm test`)
        }
    }
}