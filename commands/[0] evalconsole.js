const exec = require("util").promisify(require("child_process").exec)

module.exports = {
    name: "evalconsole",
    aliases: [],
    permission: "BOT_OWNER",
    file: __filename,
    async execute(client, message, args) {
        try {
            const { stdout } = await exec(args)

            message.reply(`\`\`\`js\n${stdout}`.substring(0, 1011) + "```", { disableWhitespaceRemoval: true })
        } catch (error) {
            message.reply(`**Error**\`\`\`js\n${error.message}`.substring(0, 1011) + "```", { disableWhitespaceRemoval: true })
        }
    }
}