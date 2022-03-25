const functions = require("../functions")

module.exports = {
    name: "globalblacklist",
    usage: "<userId> <seconds> [reason]",
    aliases: ["gbl"],
    file: __filename,
    permission: "BOT_OWNER",
    async execute(client, message, args, argsArray) {
        if (argsArray[0] && argsArray[1]) {
            const userToBlacklist = await client.fetchUser(argsArray.shift(), true, true)
            const secondsOrPerm = argsArray.shift()
            const reason = argsArray.join(" ") || "Unspecified"
            const now = parseInt(Date.now() / 1000)
            let newUnix = secondsOrPerm !== "perm" ? now + parseInt(secondsOrPerm) : 8640000000000

            functions.writeJSON("blacklist", userToBlacklist.id, {
                "reason": reason,
                "endsAt": newUnix,
                "seenWarning": false
            })

            message.reply(`${userToBlacklist.tag} has been globally blacklisted.

            **Reason**: ${reason}

            **Blacklist Ends**: <t:${newUnix}>`)
        } else {
            message.reply(`You need at least 2 parameters to use this command.

            **Usage**: !globalblacklist <userId> <seconds> [reason]

            **Example**: !globalblacklist ${client.user.id} 60
            !globalblacklist ${client.user.id} 60 test`)
        }
    }
}