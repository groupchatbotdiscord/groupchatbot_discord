const functions = require("../functions")
const invalidValueText = "Invalid value.\nValid values: `enabled`, `disabled`, `enable`, `disable`, `true`, `false`, `on`, `off`, `yes`, `no`."

function getMenu(message) {
    const snipe = functions.readJSON("groups")[message.channel.id].snipe
    const nonPrefixCommands = functions.readJSON("groups")[message.channel.id].nonPrefixCommands
    const nonPrefixReactions = functions.readJSON("groups")[message.channel.id].nonPrefixReactions
    const rareEvents = functions.readJSON("groups")[message.channel.id].rareEvents
    const autoSnipe = functions.readJSON("groups")[message.channel.id].autoSnipe
    const autoEditSnipe = functions.readJSON("groups")[message.channel.id].autoEditSnipe

    return `**Snipe/Editsnipe** - ID: \`snipe\`
    Allows group members to use the \`!snipe\` and \`!editsnipe\` commands.
    ${snipe === true ? "✅" : "❌"} \`${snipe === true ? "Enabled" : "Disabled"}\`

    **Non-Prefix Commands** - ID: \`nonprefixcommands\`, \`npc\`
    Allows the bot to reply to messages containing any of the following: \`I forgot\`, \`I forgor\`, \`AAAAA\`, \`snake\`, \`damn\`, \`zamn\` and \`zad\`.
    ${nonPrefixCommands === true ? "✅" : "❌"} \`${nonPrefixCommands === true ? "Enabled" : "Disabled"}\`

    **Non-Prefix Reactions** - ID: \`nonprefixreactions\`, \`npr\`
    Allows the bot to react to messages containing \`ratio\`.
    This also allows the bot to react to messages containing \`cap\` if the message is a reply.
    ${nonPrefixReactions === true ? "✅" : "❌"} \`${nonPrefixReactions === true ? "Enabled" : "Disabled"}\`

    **Rare Events** - ID: \`rareevents\`, \`re\`
    Allows the bot to generate rare events.
    Rare events have a 0.25% chance of being generated per message.
    ${rareEvents === true ? "✅" : "❌"} \`${rareEvents === true ? "Enabled" : "Disabled"}\`

    **Auto Snipe** - ID: \`autosnipe\`, \`as\`
    Allows the bot to automatically use \`!snipe\` upon message deletion.
    ${autoSnipe === true ? "✅" : "❌"} \`${autoSnipe === true ? "Enabled" : "Disabled"}\`

    **Auto Editsnipe** - ID: \`autoeditsnipe\`, \`aes\`
    Allows the bot to automatically use \`!editsnipe\` upon message edit.
    ${autoEditSnipe === true ? "✅" : "❌"} \`${autoEditSnipe === true ? "Enabled" : "Disabled"}\`

    • To change a setting type \`!groupsettings [ID] [value]\`.
    • To reset all settings back to their default value type \`!groupsettings reset\`.
    • Example: \`!groupsettings snipe disable\`.`
}

function isValidValue(value = "") {
    if (value === "enabled" || value === "disabled" || value === "enable" || value === "disable" || value === "true" || value === "false" || value === "on" || value === "off" || value === "yes" || value === "no") {
        return true
    }
    return false
}

function valueType(value = "") {
    if (value === "enabled" || value === "enable" || value === "true" || value === "on" || value === "yes") {
        return true
    }
    return false
}

module.exports = {
    name: "groupsettings",
    description: "View/change the settings for this group.",
    aliases: ["gs"],
    usage: "[ID] [value]",
    file: __filename,
    permission: "GROUP_OWNERS_COOWNERS_ADMINS",
    cooldown: 5,
    async execute(client, message, args, argsArray, target) {
        if (!argsArray[0]) {
            message.reply(getMenu(message))
        } else {
            if (!argsArray[1]) argsArray[1] = ""

            const setting = argsArray[0].toLowerCase()
            const value = argsArray[1].toLowerCase()

            switch (setting) {
                case "snipe":
                    if (isValidValue(value)) {
                        const type = valueType(value)

                        functions.writeJSON("groups", message.channel.id, type, `file[path].snipe = data`)
                        message.reply(`Snipe is now ${type === true ? "✅" : "❌"} \`${type === true ? "Enabled" : "Disabled"}\`.`)
                    } else {
                        message.reply(invalidValueText)
                    }
                    break
                case "npc":
                case "nonprefixcommands":
                    if (isValidValue(value)) {
                        const type = valueType(value)

                        functions.writeJSON("groups", message.channel.id, type, `file[path].nonPrefixCommands = data`)
                        message.reply(`Non-Prefix Commands are now ${type === true ? "✅" : "❌"} \`${type === true ? "Enabled" : "Disabled"}\`.`)
                    } else {
                        message.reply(invalidValueText)
                    }
                    break
                case "npr":
                case "nonprefixreactions":
                    if (isValidValue(value)) {
                        const type = valueType(value)

                        functions.writeJSON("groups", message.channel.id, type, `file[path].nonPrefixReactions = data`)
                        message.reply(`Non-Prefix Reactions are now ${type === true ? "✅" : "❌"} \`${type === true ? "Enabled" : "Disabled"}\`.`)
                    } else {
                        message.reply(invalidValueText)
                    }
                    break
                case "re":
                case "rareevents":
                    if (isValidValue(value)) {
                        const type = valueType(value)

                        functions.writeJSON("groups", message.channel.id, type, `file[path].rareEvents = data`)
                        message.reply(`Rare Events are now ${type === true ? "✅" : "❌"} \`${type === true ? "Enabled" : "Disabled"}\`.`)
                    } else {
                        message.reply(invalidValueText)
                    }
                    break
                case "as":
                case "autosnipe":
                    if (isValidValue(value)) {
                        const type = valueType(value)

                        functions.writeJSON("groups", message.channel.id, type, `file[path].autoSnipe = data`)
                        message.reply(`Auto snipe is now ${type === true ? "✅" : "❌"} \`${type === true ? "Enabled" : "Disabled"}\`.`)
                    } else {
                        message.reply(invalidValueText)
                    }
                    break
                case "aes":
                case "autoeditsnipe":
                    if (isValidValue(value)) {
                        const type = valueType(value)

                        functions.writeJSON("groups", message.channel.id, type, `file[path].autoEditSnipe = data`)
                        message.reply(`Auto editsnipe is now ${type === true ? "✅" : "❌"} \`${type === true ? "Enabled" : "Disabled"}\`.`)
                    } else {
                        message.reply(invalidValueText)
                    }
                    break
                case "reset":
                    functions.writeJSON("groups", message.channel.id, null, `delete file[path].snipe`)
                    functions.writeJSON("groups", message.channel.id, null, `delete file[path].nonPrefixCommands`)
                    functions.writeJSON("groups", message.channel.id, null, `delete file[path].nonPrefixReactions`)
                    functions.writeJSON("groups", message.channel.id, null, `delete file[path].rareEvents`)
                    functions.writeJSON("groups", message.channel.id, null, `delete file[path].autoSnipe`)
                    functions.writeJSON("groups", message.channel.id, null, `delete file[path].autoEditSnipe`)
                    functions.checkForGroupSettingsJSON(message)
                    message.reply("Every setting has been reset back to their default value.")
                    break
                default:
                    message.reply("Invalid ID.")
                    break
            }
        }

    }
}