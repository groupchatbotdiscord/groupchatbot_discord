const functions = require("../functions")
const User = require("../Schemas/User")
const invalidValueText = "Invalid value.\nValid values: `enabled`, `disabled`, `enable`, `disable`, `true`, `false`, `on`, `off`, `yes`, `no`."

function getMenu(message, userData) {
    const passive = userData.settings_passiveMode
    const showUsernameOnGlobalLeaderboard = userData.settings_showUsernameOnGlobalLeaderboard

    return `**Passive Mode** - ID: \`passive\`
    Users won't be able to rob from you but you won't be able to rob from others.
    You also get £100 added to your bank space for every 5 commands rather than £400.
    ${passive === true ? "✅" : "❌"} \`${passive === true ? "Enabled" : "Disabled"}\`

    **Show Username On Global Leaderboard** - ID: \`showusernameongloballeaderboard\`, \`suogl\`
    Allows users to see your username on \`${functions.configJSON.prefix}leaderboard global\`.
    ${showUsernameOnGlobalLeaderboard === true ? "✅" : "❌"} \`${showUsernameOnGlobalLeaderboard === true ? "Enabled" : "Disabled"}\`

    • To change a setting type \`${functions.configJSON.prefix}usersettings [ID] [value]\`.
    • To reset all settings back to their default value type \`${functions.configJSON.prefix}usersettings reset\`.
    • Example: \`${functions.configJSON.prefix}usersettings passive enable\`.`
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
    name: "usersettings",
    description: "View/change your settings.",
    aliases: ["us"],
    usage: "[ID] [value]",
    file: __filename,
    cooldown: 5,
    async execute(client, message, args, argsArray, target) {
        const userData = await User.findOne({ id: message.author.id })

        if (!argsArray[0]) {
            message.reply(getMenu(message, userData))
        } else {
            const passive = userData.settings_passiveMode
            const showUsernameOnGlobalLeaderboard = userData.settings_showUsernameOnGlobalLeaderboard

            if (!argsArray[1]) argsArray[1] = ""

            const setting = argsArray[0].toLowerCase()
            const value = argsArray[1].toLowerCase()

            switch (setting) {
                case "passive":
                    if (isValidValue(value)) {
                        const type = valueType(value)

                        if (type === passive) {
                            return message.reply(`Passive Mode is already ${type === true ? "✅" : "❌"} \`${type === true ? "Enabled" : "Disabled"}\`.`)
                        }

                        if (type === true) {
                            if (!functions.readJSON("cooldowns")[message.author.id])
                                functions.writeJSON("cooldowns", message.author.id, {})

                            const lastCooldown = functions.readJSON("cooldowns")[message.author.id]["passive"] ? functions.readJSON("cooldowns")[message.author.id]["passive"] : null
                            const cooldown = 43200

                            if (lastCooldown && (cooldown * 1000) - (Date.now() - lastCooldown) > 0) {
                                const cooldownInSeconds = ((lastCooldown / 1000) + cooldown).toFixed(0)

                                return message.reply(`Enabling passive mode has a cooldown.

                                    • Try again at <t:${cooldownInSeconds}> (<t:${cooldownInSeconds}:R>).`)
                            }

                            const now = Date.now()

                            functions.writeJSON("cooldowns", message.author.id, now, `file[path]["passive"] = data`)
                        }

                        userData.settings_passiveMode = type
                        await userData.save()

                        message.reply(`Passive Mode is now ${type === true ? "✅" : "❌"} \`${type === true ? "Enabled" : "Disabled"}\`.`)
                    } else {
                        message.reply(invalidValueText)
                    }
                    break
                case "suogl":
                case "showusernameongloballeaderboard":
                    if (isValidValue(value)) {
                        const type = valueType(value)

                        if (type === showUsernameOnGlobalLeaderboard) {
                            return message.reply(`Show Username On Global Leaderboard is already ${type === true ? "✅" : "❌"} \`${type === true ? "Enabled" : "Disabled"}\`.`)
                        }

                        userData.settings_showUsernameOnGlobalLeaderboard = type
                        await userData.save()

                        message.reply(`Show Username On Global Leaderboard is now ${type === true ? "✅" : "❌"} \`${type === true ? "Enabled" : "Disabled"}\`.`)
                    } else {
                        message.reply(invalidValueText)
                    }
                    break
                case "reset":
                    userData.settings_passiveMode = false
                    userData.settings_showUsernameOnGlobalLeaderboard = false
                    await userData.save()
                    message.reply("Every setting has been reset back to their default value.")
                    break
                default:
                    message.reply("Invalid ID.")
                    break
            }
        }
    }
}