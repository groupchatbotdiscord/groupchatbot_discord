const functions = require("../functions")

module.exports = {
    name: "help",
    description: "Sends you a link to a page listing all of the commands.",
    aliases: ["h", "commands", "cmds"],
    file: __filename,
    cooldown: 5,
    async execute(client, message, args, argsArray) {
        if (functions.configJSON.websiteUrl === "YOUR NGROK WEBSITE URL HERE") return message.reply(`The owner of this bot hasn't entered an ngrok website.

        Let them know to use replace \`[3] help.js\` in ./commands/ with the one located in ./resources/ to use the DM reaction based help menu.`)

        message.reply(`https://${functions.configJSON.websiteUrl}/commands`)
    }
}