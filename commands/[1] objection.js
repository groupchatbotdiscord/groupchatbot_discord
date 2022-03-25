const functions = require("../functions")
const fs = require("fs")
const { Message, Client } = require("discord.js")
const { objection } = require("../data/config.json")
const puppeteer = require("puppeteer")

module.exports = {
    name: "objection",
    description: "Creates an objection using <numberOfMessages> messages.",
    usage: "<numberOfMessages>",
    aliases: ["obj"],
    cooldown: 60,
    file: __filename,
    /**
     * @param {Client} client
     * @param {Message} message
     * @param {Message} value
     */
    async execute(client, message, args, argsArray) {
        const availableCharacters = functions.newCharactersArray
        const charactersToUse = []

        if (argsArray[0] && parseInt(argsArray[0])) {
            let amount = 1000
            if (parseInt(argsArray[0]) < 1000) {
                amount = parseInt(argsArray[0])
            }
            let message2 = await message.reply(`Fetching ${amount} message${amount === 1 ? "" : "s"}.
                Please wait.`)
            const browser = await puppeteer.launch({
                headless: false
            })
            const page = await browser.newPage()
            await page.goto("https://objection.lol/maker")
            const json = {
                "type": "scene",
                "options": {
                    "chatbox": 0,
                    "textSpeed": 35,
                    "textBlipFrequency": 64,
                    "autoplaySpeed": 1000,
                },
                "groups": [
                    {
                        "iid": 1,
                        "name": "Main",
                        "type": "n",
                        "frames": []
                    }
                ],
                "courtRecord": {
                    "evidence": [],
                    "profiles": []
                },
                "aliases": [],
                "pairs": [],
                "version": 4
            }
            let keys
            let currentMusic = "[#bgm2]"
            let messages = await message.channel.fetchMessages({ limit: amount > 100 ? 100 : amount, before: message.id })
            messages = messages.array().reverse()
            if (amount > 900) {
                const messages2 = await message.channel.fetchMessages({ limit: amount - 900, before: messages[0].id })
                messages2.array().forEach(value => messages.unshift(value))
                const messages3 = await message.channel.fetchMessages({ limit: amount - 900, before: messages[0].id })
                messages3.array().forEach(value => messages.unshift(value))
                const messages4 = await message.channel.fetchMessages({ limit: amount - 900, before: messages[0].id })
                messages4.array().forEach(value => messages.unshift(value))
                const messages5 = await message.channel.fetchMessages({ limit: amount - 900, before: messages[0].id })
                messages5.array().forEach(value => messages.unshift(value))
                const messages6 = await message.channel.fetchMessages({ limit: amount - 900, before: messages[0].id })
                messages6.array().forEach(value => messages.unshift(value))
                const messages7 = await message.channel.fetchMessages({ limit: amount - 900, before: messages[0].id })
                messages7.array().forEach(value => messages.unshift(value))
                const messages8 = await message.channel.fetchMessages({ limit: amount - 900, before: messages[0].id })
                messages8.array().forEach(value => messages.unshift(value))
                const messages9 = await message.channel.fetchMessages({ limit: amount - 900, before: messages[0].id })
                messages9.array().forEach(value => messages.unshift(value))
                const messages10 = await message.channel.fetchMessages({ limit: amount - 900, before: messages[0].id })
                messages10.array().forEach(value => messages.unshift(value))
            } else if (amount > 800) {
                const messages2 = await message.channel.fetchMessages({ limit: amount - 800, before: messages[0].id })
                messages2.array().forEach(value => messages.unshift(value))
                const messages3 = await message.channel.fetchMessages({ limit: amount - 800, before: messages[0].id })
                messages3.array().forEach(value => messages.unshift(value))
                const messages4 = await message.channel.fetchMessages({ limit: amount - 800, before: messages[0].id })
                messages4.array().forEach(value => messages.unshift(value))
                const messages5 = await message.channel.fetchMessages({ limit: amount - 800, before: messages[0].id })
                messages5.array().forEach(value => messages.unshift(value))
                const messages6 = await message.channel.fetchMessages({ limit: amount - 800, before: messages[0].id })
                messages6.array().forEach(value => messages.unshift(value))
                const messages7 = await message.channel.fetchMessages({ limit: amount - 800, before: messages[0].id })
                messages7.array().forEach(value => messages.unshift(value))
                const messages8 = await message.channel.fetchMessages({ limit: amount - 800, before: messages[0].id })
                messages8.array().forEach(value => messages.unshift(value))
                const messages9 = await message.channel.fetchMessages({ limit: amount - 800, before: messages[0].id })
                messages9.array().forEach(value => messages.unshift(value))
            } else if (amount > 700) {
                const messages2 = await message.channel.fetchMessages({ limit: amount - 700, before: messages[0].id })
                messages2.array().forEach(value => messages.unshift(value))
                const messages3 = await message.channel.fetchMessages({ limit: amount - 700, before: messages[0].id })
                messages3.array().forEach(value => messages.unshift(value))
                const messages4 = await message.channel.fetchMessages({ limit: amount - 700, before: messages[0].id })
                messages4.array().forEach(value => messages.unshift(value))
                const messages5 = await message.channel.fetchMessages({ limit: amount - 700, before: messages[0].id })
                messages5.array().forEach(value => messages.unshift(value))
                const messages6 = await message.channel.fetchMessages({ limit: amount - 700, before: messages[0].id })
                messages6.array().forEach(value => messages.unshift(value))
                const messages7 = await message.channel.fetchMessages({ limit: amount - 700, before: messages[0].id })
                messages7.array().forEach(value => messages.unshift(value))
                const messages8 = await message.channel.fetchMessages({ limit: amount - 700, before: messages[0].id })
                messages8.array().forEach(value => messages.unshift(value))
            } else if (amount > 600) {
                const messages2 = await message.channel.fetchMessages({ limit: amount - 600, before: messages[0].id })
                messages2.array().forEach(value => messages.unshift(value))
                const messages3 = await message.channel.fetchMessages({ limit: amount - 600, before: messages[0].id })
                messages3.array().forEach(value => messages.unshift(value))
                const messages4 = await message.channel.fetchMessages({ limit: amount - 600, before: messages[0].id })
                messages4.array().forEach(value => messages.unshift(value))
                const messages5 = await message.channel.fetchMessages({ limit: amount - 600, before: messages[0].id })
                messages5.array().forEach(value => messages.unshift(value))
                const messages6 = await message.channel.fetchMessages({ limit: amount - 600, before: messages[0].id })
                messages6.array().forEach(value => messages.unshift(value))
                const messages7 = await message.channel.fetchMessages({ limit: amount - 600, before: messages[0].id })
                messages7.array().forEach(value => messages.unshift(value))
            } else if (amount > 500) {
                const messages2 = await message.channel.fetchMessages({ limit: amount - 500, before: messages[0].id })
                messages2.array().forEach(value => messages.unshift(value))
                const messages3 = await message.channel.fetchMessages({ limit: amount - 500, before: messages[0].id })
                messages3.array().forEach(value => messages.unshift(value))
                const messages4 = await message.channel.fetchMessages({ limit: amount - 500, before: messages[0].id })
                messages4.array().forEach(value => messages.unshift(value))
                const messages5 = await message.channel.fetchMessages({ limit: amount - 500, before: messages[0].id })
                messages5.array().forEach(value => messages.unshift(value))
                const messages6 = await message.channel.fetchMessages({ limit: amount - 500, before: messages[0].id })
                messages6.array().forEach(value => messages.unshift(value))
            } else if (amount > 400) {
                const messages2 = await message.channel.fetchMessages({ limit: amount - 400, before: messages[0].id })
                messages2.array().forEach(value => messages.unshift(value))
                const messages3 = await message.channel.fetchMessages({ limit: amount - 400, before: messages[0].id })
                messages3.array().forEach(value => messages.unshift(value))
                const messages4 = await message.channel.fetchMessages({ limit: amount - 400, before: messages[0].id })
                messages4.array().forEach(value => messages.unshift(value))
                const messages5 = await message.channel.fetchMessages({ limit: amount - 400, before: messages[0].id })
                messages5.array().forEach(value => messages.unshift(value))
            } else if (amount > 300) {
                const messages2 = await message.channel.fetchMessages({ limit: amount - 300, before: messages[0].id })
                messages2.array().forEach(value => messages.unshift(value))
                const messages3 = await message.channel.fetchMessages({ limit: amount - 300, before: messages[0].id })
                messages3.array().forEach(value => messages.unshift(value))
                const messages4 = await message.channel.fetchMessages({ limit: amount - 300, before: messages[0].id })
                messages4.array().forEach(value => messages.unshift(value))
            } else if (amount > 200) {
                const messages2 = await message.channel.fetchMessages({ limit: amount - 200, before: messages[0].id })
                messages2.array().forEach(value => messages.unshift(value))
                const messages3 = await message.channel.fetchMessages({ limit: amount - 200, before: messages[0].id })
                messages3.array().forEach(value => messages.unshift(value))
            } else if (amount > 100) {
                const messages2 = await message.channel.fetchMessages({ limit: amount - 100, before: messages[0].id })
                messages2.array().forEach(value => messages.unshift(value))
            }

            messages.forEach(value => {
                let content = value.content

                if (content === "") {
                    if (value.embeds[0] && value.embeds[0].description) {
                        content = value.embeds[0].description
                    } else if (value.embeds[0] && !value.embeds[0].description) {
                        content = "[No Embed Description]"
                    } else {
                        content = "[No Message Content]"
                    }
                }

                content = value.cleanContent.replace(/(https?)\S*/g, "[link]")

                value.attachments.forEach(_ => content += " [attachment]")

                if (!charactersToUse.find(value2 => value2.id === value.author.id)) {
                    if (Object.keys(availableCharacters).length === 0) {
                        charactersToUse.push({
                            "id": value.author.id,
                            "character": "gallery"
                        })
                    } else {
                        keys = Object.keys(availableCharacters)
                        if (availableCharacters.phoenix_wright) {
                            charactersToUse.push({
                                "id": value.author.id,
                                "character": "phoenix_wright"
                            })
                            delete availableCharacters.phoenix_wright
                        } else if (availableCharacters.miles_edgeworth) {
                            charactersToUse.push({
                                "id": value.author.id,
                                "character": "miles_edgeworth"
                            })
                            delete availableCharacters.miles_edgeworth
                        } else {
                            const character = availableCharacters[keys[Math.floor(Math.random() * keys.length)]]
                            charactersToUse.push({
                                "id": value.author.id,
                                "character": character
                            })
                            delete availableCharacters[character]
                        }
                    }
                }

                keys = Object.keys(objection.poses[charactersToUse.find(value2 => value2.id === value.author.id).character])

                let bubbleToUse = 0

                const oldContent = content

                if (value.referencedMessage) {
                    try {
                        content = `Replying to @${value.referencedMessage.author.username}: ${oldContent}`
                    } catch (error) {
                        content = `Replying to Unknown User: ${oldContent}`
                    }
                }

                if (!json.groups[0].frames[0]) {
                    content = `${currentMusic}${content}`
                }

                if (functions.generateChance(20)) {
                    const bubbleKeys = Object.keys(objection.bubbles)
                    bubbleToUse = objection.bubbles[bubbleKeys[Math.floor(Math.random() * bubbleKeys.length)]]
                    const musicKeys = Object.keys(objection.music)
                    let musicToUse = musicKeys[Math.floor(Math.random() * musicKeys.length)]
                    do {
                        musicToUse = musicKeys[Math.floor(Math.random() * musicKeys.length)]
                    } while (objection.music[musicToUse] === currentMusic)
                    currentMusic = objection.music[musicToUse]
                    content = `${objection.music[musicToUse]}${content}`.replace("[#bgm2]", "")
                }

                const poseId = objection.poses[charactersToUse.find(value2 => value2.id === value.author.id).character][keys[Math.floor(Math.random() * keys.length)]]
                if (poseId === 92 && functions.generateChance(50)) {
                    json.groups[0].frames.push({
                        "id": -1,
                        "iid": 1,
                        "text": `[#bgmfo][#p5000][#bgm26]${content}`.substring(0, 615),
                        "poseId": poseId,
                        "pairPoseId": null,
                        "bubbleType": bubbleToUse,
                        "username": value.author.username,
                        "mergeNext": false,
                        "doNotTalk": false,
                        "goNext": false,
                        "poseAnimation": true,
                        "flipped": null,
                        "frameActions": [],
                        "frameFades": [],
                        "characterId": null,
                        "popupId": null,
                        "pairId": null,
                        "transition": null
                    })
                    currentMusic = "[#bgm26]"
                } else {
                    json.groups[0].frames.push({
                        "id": -1,
                        "iid": 1,
                        "text": content.substring(0, 615),
                        "poseId": poseId,
                        "pairPoseId": null,
                        "bubbleType": bubbleToUse,
                        "username": value.author.username,
                        "mergeNext": false,
                        "doNotTalk": false,
                        "goNext": false,
                        "poseAnimation": true,
                        "flipped": null,
                        "frameActions": [{ "actionId": 15, "actionParam": "1000" }],
                        "frameFades": [],
                        "characterId": null,
                        "popupId": null,
                        "pairId": null,
                        "transition": null
                    })
                }
            })
            const element = await page.waitForSelector("input[type='file']", { timeout: 5000 })
            fs.writeFileSync(`./data/pending/${message.id}.objection`, Buffer.from(JSON.stringify(json)).toString("base64"))
            await element.uploadFile(`./data/pending/${message.id}.objection`)
            await page.waitForSelector("i[class='v-icon notranslate v-icon--left mdi mdi-share theme--dark']", { visible: true, timeout: 5000 })
            await page.click("i[class='v-icon notranslate v-icon--left mdi mdi-share theme--dark']")

            await message2.edit(`The bot owner has to complete a captcha.
                Please wait.

                • Using ${messages.length} message${messages.length === 1 ? "" : "s"}.`)

            const interval = setInterval(async _ => {
                if (page.url().startsWith("https://objection.lol/objection/")) {
                    clearInterval(interval)
                    fs.rmSync(`./data/pending/${message.id}.objection`)
                    const nonEmptyCount = messages.filter(message => message.content !== "").length
                    const emptyCount = messages.filter(message => message.content === "").length
                    message2.delete()
                    message.reply(`Your objection has been generated.

                        **URL**
                        ${page.url()}

                        • Successfully used ${nonEmptyCount} message${nonEmptyCount === 1 ? "" : "s"}
                        • Skipped ${emptyCount} message${emptyCount === 1 ? "" : "s"}`)
                }
            }, 100)
        } else {
            message.reply(`You need 1 parameter to use this command.

                    **Usage**: ${functions.configJSON.prefix}objection <numberOfMessages>

                    **Example**: ${functions.configJSON.prefix}objection 100`)

            if (this.cooldown) {
                let now = Date.now() - (this.cooldown * 1000 - 5000)

                functions.writeJSON("cooldowns", message.author.id, now, `file[path]["${this.name}"] = data`)
            }
        }

    }
}