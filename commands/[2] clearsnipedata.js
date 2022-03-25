const functions = require("../functions")

module.exports = {
    name: "clearsnipedata",
    description: `Clears snipe data.
    ⚠️ There is no undoing this command, when you use it everything gets fully cleared ⚠️`,
    aliases: ["csd"],
    permission: "GROUP_OWNERS_COOWNERS",
    file: __filename,
    async execute(client, message) {
        functions.writeJSON("groups", message.channel.id, null, "delete file.snipeData[path]")
        functions.writeJSON("snipe", message.channel.id, null, "delete file[path]")

        message.reply(`Cleared \`!snipe\`/\`!snipelogs\` data.`)
    }
}