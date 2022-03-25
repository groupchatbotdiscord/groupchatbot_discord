const moment = require("moment")
const fs = require("fs")
const express = require("express")
const app = express()
const { Message, Client, User } = require("discord.js")
const User2 = require("./Schemas/User.js")

module.exports = {
    /**
     * @param {String} jsonFileName
     * @param {String} path
     * @param {*} data
     * @param {String} codeToRun
     * @return {void}
     */
    writeJSON: async function (jsonFileName, path, data, codeToRun) {
        const file = this.readJSON(jsonFileName)

        if (!codeToRun) codeToRun = "file[path] = data"

        eval(codeToRun)

        const newJson = JSON.stringify(file, null, "\t")

        fs.writeFileSync(`./data/${jsonFileName}.json`, newJson)
    },

    /**
     * @param {Number} min Minimum number
     * @param {Number} max Maximum number
     * @return {Number}
     */
    generateNumber: function (min, max) {
        const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min

        return randomNumber
    },

    /**
     * @param {Number} chance % chance, 50 for 50% chance
     * @return {Boolean}
     */
    generateChance: function (chance) {
        return Math.random() < chance / 100
    },

    /**
     * @param {Number} ms Milliseconds to convert
     * @param {String} remove Optionally remove milliseconds from the returned result
     * @return {String}
     */
    msToTime: function (ms, remove) {
        const duration = moment.duration(ms)
        const years = duration.years()
        const months = duration.months()
        const weeks = duration.weeks()
        const days = duration.days()
        const hours = duration.hours()
        const minutes = duration.minutes()
        const seconds = duration.seconds()
        const milliseconds = duration.milliseconds()
        let time = "0s"
        let yearsFormat = `${years}y`
        let monthsFormat = `${months}m`
        let weeksFormat = `${weeks}w`
        let daysFormat = `${days}d`
        let hoursFormat = `${hours}h`
        let minutesFormat = `${minutes}m`
        let secondsFormat = `${seconds}s`
        let millisecondsFormat = `${milliseconds}ms`
        if (years > 0) time = `${yearsFormat}, ${monthsFormat}, ${weeksFormat}, ${daysFormat}, ${hoursFormat}, ${minutesFormat}, ${secondsFormat}, ${millisecondsFormat}`
        else if (months > 0) time = `${monthsFormat}, ${weeksFormat}, ${daysFormat}, ${hoursFormat}, ${minutesFormat}, ${secondsFormat}, ${millisecondsFormat}`
        else if (weeks > 0) time = `${weeksFormat}, ${daysFormat}, ${hoursFormat}, ${minutesFormat}, ${secondsFormat}, ${millisecondsFormat}`
        else if (days > 0) time = `${daysFormat}, ${hoursFormat}, ${minutesFormat}, ${secondsFormat}, ${millisecondsFormat}`
        else if (hours > 0) time = `${hoursFormat}, ${minutesFormat}, ${secondsFormat}, ${millisecondsFormat}`
        else if (minutes > 0) time = `${minutesFormat}, ${secondsFormat}, ${millisecondsFormat}`
        else if (seconds > 0) time = `${secondsFormat}, ${millisecondsFormat}`
        else if (milliseconds > 0) time = `${millisecondsFormat}`
        return remove === "ms" ? time.replace(`, ${millisecondsFormat}`, "") : time
    },

    /**
     * Gets user from the "mention" argument
     * @param {Client} client
     * @param {String} mention
     * @returns {Boolean | User}
     */
    getUserFromMention: async function (client, mention, command, recipients) {
        if (!mention) return false

        if (mention.startsWith("<@") && mention.endsWith(">")) {
            mention = mention.slice(2, -1)

            if (mention.startsWith("!")) {
                mention = mention.slice(1)
            }

            const target = await client.fetchUser(mention, true, true).catch(_ => { })

            if (target) {
                if (command === "rob" && !recipients.has(target.id)) {
                    return `Rob ID`
                }
                return target
            } else {
                return false
            }
        } else {
            const target = await client.fetchUser(mention, true, true).catch(_ => { })
            if (target) {
                if (command === "rob" && !recipients.has(target.id)) {
                    return `Rob ID`
                }
                return target
            } else {
                return false
            }
        }
    },

    /**
     * @param {Client} client
     */
    expressPages: async function (client) {
        app.get("/commands", (_, res) => res.sendFile("commands.html", { root: "./resources" }))
        app.use("/static/Whitney", express.static("./resources/Whitney.woff"))
        app.use("/other", express.static("./resources/other"))
        app.use("/channels", express.static("./resources/channels"))

        app.get("/api/get_command_info", (req, res) => {
            const info = []

            fs.readdirSync("./commands").forEach(commandName => {
                if (commandName.startsWith("[0]")) return

                delete require.cache[require.resolve(`./commands/${commandName}`)]
                const command = require(`./commands/${commandName}`)

                const aliases = [...command.aliases].map(element => `!${element}`)

                const description = []

                if (command.description) description.push(command.description)

                let permission = "Everyone"

                switch (command.permission) {
                    case "BOT_OWNER":
                        permission = "Bot Owner"
                        break
                    case "GROUP_OWNERS":
                        permission = "Group Owners"
                        break
                    case "GROUP_OWNERS_COOWNERS":
                        permission = "Group Owners & Group Co-Owners"
                        break
                    case "GROUP_OWNERS_COOWNERS_ADMINS":
                        permission = "Group Owners, Group Co-Owners & Group Admins"
                        break
                    case "TESTING":
                        permission = "No-one (Command In Testing)"
                        break
                    case "REWORKING":
                        permission = "No-one (Command Being Reworked)"
                        break
                }

                info.push({
                    name: command.name,
                    title: `!${command.name}${command.usage ? ` ${command.usage}` : ""}`,
                    description: description.join("\n\n").replace(/^ +/gm, ""),
                    aliases: aliases.join(", ") || "None",
                    category: commandName.slice(0, 3).replace("[", "").replace("]", ""),
                    permission: permission
                })
            })

            res.send(info)
        })

        app.listen(8080)
    },

    readJSON: function (fileName) {
        const file = JSON.parse(fs.readFileSync(`./data/${fileName}.json`, "utf8"))
        return file
    },

    get shopJSON() {
        delete require.cache[require.resolve(`./data/shop.json`)]
        return require("./data/shop.json")
    },

    get configJSON() {
        delete require.cache[require.resolve(`./data/config.json`)]
        return require("./data/config.json")
    },

    /**
     * @param {Message} message
     */
    checkForGroupSettingsJSON: function (message) {
        if (!this.readJSON("groups")[message.channel.id]) this.writeJSON("groups", message.channel.id, {}, `file[path] = data`)

        if (!this.readJSON("groups")[message.channel.id].hasOwnProperty("snipe")) this.writeJSON("groups", message.channel.id, true, `file[path].snipe = data`)

        if (!this.readJSON("groups")[message.channel.id].hasOwnProperty("nonPrefixCommands")) this.writeJSON("groups", message.channel.id, false, `file[path].nonPrefixCommands = data`)

        if (!this.readJSON("groups")[message.channel.id].hasOwnProperty("nonPrefixReactions")) this.writeJSON("groups", message.channel.id, true, `file[path].nonPrefixReactions = data`)

        if (!this.readJSON("groups")[message.channel.id].hasOwnProperty("rareEvents")) this.writeJSON("groups", message.channel.id, true, `file[path].rareEvents = data`)

        if (!this.readJSON("groups")[message.channel.id].hasOwnProperty("autoSnipe")) this.writeJSON("groups", message.channel.id, false, `file[path].autoSnipe = data`)

        if (!this.readJSON("groups")[message.channel.id].hasOwnProperty("autoEditSnipe")) this.writeJSON("groups", message.channel.id, false, `file[path].autoEditSnipe = data`)
    },

    /**
     * @param {String} text
     * @param {String} fileName
     * @param {Boolean} logToConsole
     */
    log: function (text, fileName, logToConsole = true) {
        const stream = fs.createWriteStream(`./logs/${fileName}.log`, { flags: "a" })

        stream.write(`[${moment().format("dddd, MMMM D hh:mm:ss A [GMT] ZZ")}] - ${text}\n\n`)
        stream.end()

        if (logToConsole) console.log(`Wrote to ${fileName}.log`.green)
    },

    get newCharactersArray() {
        const array = [
            {
                "apollo_justice": "apollo_justice",
                "mia_fey": "mia_fey",
                "phoenix_wright": "phoenix_wright",
                "franziska_von_karma": "franziska_von_karma",
                "godot": "godot",
                "klavier_gavin": "klavier_gavin",
                "miles_edgeworth": "miles_edgeworth",
                "winston_payne": "winston_payne",
                "judges_brother": "judges_brother",
                "judge": "judge",
                "acro": "acro",
                "adrian_andrews": "adrian_andrews",
                "angel_starr": "angel_starr",
                "april_may": "april_may",
                "bellboy": "bellboy",
                "benjamin_and_trilo": "benjamin_and_trilo",
                "bikini": "bikini",
                "cody_hackins": "cody_hackins",
                "dahlia_hawthorne": "dahlia_hawthorne",
                "damon_gant": "damon_gant",
                "daryan_crescend": "daryan_crescend",
                "desirée_delite": "desirée_delite",
                "dee_vasquez": "dee_vasquez",
                "dick_gumshoe": "dick_gumshoe",
                "director_hotti": "director_hotti",
                "drew_misham": "drew_misham",
                "elise_deauxnim": "elise_deauxnim",
                "ema_skye": "ema_skye",
                "frank_sahwit": "frank_sahwit",
                "furio_tigre": "furio_tigre",
                "guy_eldoon": "guy_eldoon",
                "ini_miney": "ini_miney",
                "iris": "iris",
                "jake_marshall": "jake_marshall",
                "jean_armstrong": "jean_armstrong",
                "kristoph_gavin": "kristoph_gavin",
                "lana_skye": "lana_skye",
                "larry_butz": "larry_butz",
                "lisa_basil": "lisa_basil",
                "lotta_hart": "lotta_hart",
                "luke_atmey": "luke_atmey",
                "maggey_byrde": "maggey_byrde",
                "marvin_grossberg": "marvin_grossberg",
                "matt_engarde": "matt_engarde",
                "max_galactica": "max_galactica",
                "maya_fey": "maya_fey",
                "mike_meekins": "mike_meekins",
                "moe": "moe",
                "morgan_fey": "morgan_fey",
                "pearl_fey": "pearl_fey",
                "penny_nichols": "penny_nichols",
                "polly": "polly",
                "redd_white": "redd_white",
                "regina_berry": "regina_berry",
                "richard_wellington": "richard_wellington",
                "ron_delite": "ron_delite",
                "sal_manella": "sal_manella",
                "shelly_de_killer_radio": "shelly_de_killer_radio",
                "spark_brushel": "spark_brushel",
                "terry_fawles": "terry_fawles",
                "trucy_wright": "trucy_wright",
                "vera_misham": "vera_misham",
                "victor_kudo": "victor_kudo",
                "viola_cadaverini": "viola_cadaverini",
                "wendy_oldbag": "wendy_oldbag",
                "will_powers": "will_powers",
                "winfred_kitaki": "winfred_kitaki",
                "wocky_kitaki": "wocky_kitaki",
                "yanni_yogi": "yanni_yogi"
            }
        ]

        const shadowArray = [...array]

        return shadowArray[0]
    },

    /**
     * @param {import("discord.js").Snowflake} id
     * @param {Number} amountToAdd
     */
    addToWallet: async function (id, amountToAdd) {
        const data = await User2.findOne({ id })

        return await User2.findOneAndUpdate(
            {
                id
            },
            {
                currency_wallet: data.currency_wallet + amountToAdd
            },
            {
                useFindAndModify: true
            }
        )
    },

    /**
     * @param {import("discord.js").Snowflake} id
     * @param {Number} amountToRemove
     */
    removeFromWallet: async function (id, amountToRemove) {
        const data = await User2.findOne({ id })

        return await User2.findOneAndUpdate(
            {
                id
            },
            {
                currency_wallet: data.currency_wallet - amountToRemove
            },
            {
                useFindAndModify: true
            }
        )
    },

    /**
     * @param {import("discord.js").Snowflake} id
     * @param {Number} amountToAdd
     */
    addToBank: async function (id, amountToAdd) {
        const data = await User2.findOne({ id })

        return await User2.findOneAndUpdate(
            {
                id
            },
            {
                currency_bank: data.currency_bank + amountToAdd
            },
            {
                useFindAndModify: true
            }
        )
    },

    /**
     * @param {import("discord.js").Snowflake} id
     * @param {Number} amountToRemove
     */
    removeFromBank: async function (id, amountToRemove) {
        const data = await User2.findOne({ id })

        return await User2.findOneAndUpdate(
            {
                id
            },
            {
                currency_bank: data.currency_bank - amountToRemove
            },
            {
                useFindAndModify: true
            }
        )
    },

    /**
     * @param {import("discord.js").Snowflake} id
     * @param {Number} timeInMinutes
     * @param {String} url
     */
    setPrisonTime: async function (id, timeInMinutes, url) {
        const timeInSeconds = timeInMinutes * 60

        const prisonTime = parseInt(Date.now() / 1000) + timeInSeconds

        return await User2.findOneAndUpdate(
            {
                id
            },
            {
                currency_prison: prisonTime,
                currency_prisonUrl: url
            },
            {
                useFindAndModify: true
            }
        )
    },

    /**
     * @param {import("discord.js").Snowflake} id
     */
    getGlobalPlacement: async function (id) {
        const json = await User2.find().lean()

        const top10 = json.sort((a, b) => (b.currency_wallet + b.currency_bank) - (a.currency_wallet + a.currency_bank))

        const globalIndex = top10.findIndex(v => v.id === id) + 1

        return globalIndex
    },

    clearNotifs: async function (id) {
        return await User2.findOneAndUpdate(
            {
                id
            },
            {
                currency_logs: []
            },
            {
                useFindAndModify: true
            }
        )
    },

    checkForDatabaseData: async function (id) {
        let returnData = await User2.findOne({ id })

        if (!returnData) {
            const passive = false
            const showUsernameOnGlobalLeaderboard = false

            const wallet = 0
            const bank = 0
            const bankLimit = 5000
            const inventory = { padlock: 0, invisibilityPotion: 0 }
            const commandUsageCount = 0

            const newUser = await User2.create({
                id,

                settings_passiveMode: passive,
                settings_showUsernameOnGlobalLeaderboard: showUsernameOnGlobalLeaderboard,

                currency_wallet: wallet,
                currency_bank: bank,
                currency_bankLimit: bankLimit,
                currency_logs: [],
                currency_inventory: inventory,
                currency_commandUsageCount: commandUsageCount,
                currency_activeItems: {}
            })

            returnData = await newUser.save()
        }

        return returnData
    }
}