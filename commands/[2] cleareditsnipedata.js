const functions = require("../functions")

module.exports = {
    name: "cleareditsnipedata",
    description: `Clears editsnipe data.
    ⚠️ There is no undoing this command, when you use it everything gets fully cleared ⚠️`,
    aliases: ["cesd"],
    permission: "GROUP_OWNERS_COOWNERS",
    file: __filename,
    async execute(client, message) {
        functions.writeJSON("groups", message.channel.id, null, "delete file.editSnipeData[path]")
        functions.writeJSON("editsnipe", message.channel.id, null, "delete file[path]")

        message.reply(`Cleared \`${functions.configJSON.prefix}editsnipe\`/\`${functions.configJSON.prefix}editsnipelogs\` data.`)
    }
}