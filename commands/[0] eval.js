const functions = require("../functions")

module.exports = {
    name: "eval",
    aliases: [],
    permission: "BOT_OWNER",
    file: __filename,
    async execute(client, message, args) {
        try {
            let evaled = await eval(args)

            if (typeof evaled !== "string") {
                evaled = require("util").inspect(evaled)
            }
            if (typeof (evaled) === "string") {
                evaled = evaled.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203))
            }

            evaled = evaled.replace(new RegExp(functions.configJSON.token, "g"), "Token Removed")

            message.reply(`\`\`\`js\n${evaled}`.substring(0, 1011) + "```", { disableWhitespaceRemoval: true })
        } catch (error) {
            message.reply(`**Error**\`\`\`js\n${error.message}`.substring(0, 1011) + "```", { disableWhitespaceRemoval: true })
        }
    }
}