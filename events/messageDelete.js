const { Client, Message } = require("discord.js")
const functions = require("../functions")
const fs = require("fs")
const https = require("https")

module.exports = {
    name: "messageDelete",
    once: false,
    /**
     * @param {Client} client
     * @param {Message} message
     */
    async execute(client, message) {
        if (message.type === "DEFAULT" || message.type === "REPLY") {
            const attachmentUrls = []
            const deletedAt = Date.now()

            if (!functions.readJSON("groups").snipeData[message.channel.id])
                functions.writeJSON("groups", "snipeData", {}, `file[path]["${message.channel.id}"] = data`)
            if (!functions.readJSON("groups").snipeData[message.channel.id][message.author.id])
                functions.writeJSON("groups", "snipeData", {}, `file[path]["${message.channel.id}"]["${message.author.id}"] = data`)

            if (!functions.readJSON("snipe")[message.channel.id])
                functions.writeJSON("snipe", message.channel.id, {}, `file[path] = data`)
            if (!functions.readJSON("snipe")[message.channel.id].logs)
                functions.writeJSON("snipe", message.channel.id, [], `file[path].logs = data`)

            const replyingTo = message.referencedMessage ? message.referencedMessage.url : ""
            message.attachments.forEach(value => attachmentUrls.push(value.url))
            functions.writeJSON("groups", "snipeData", message.content, `file[path]["${message.channel.id}"]["message"] = data`)
            functions.writeJSON("groups", "snipeData", deletedAt, `file[path]["${message.channel.id}"]["deletedAt"] = data`)
            functions.writeJSON("groups", "snipeData", message.author.id, `file[path]["${message.channel.id}"]["userId"] = data`)
            functions.writeJSON("groups", "snipeData", attachmentUrls, `file[path]["${message.channel.id}"]["attachmentUrls"] = data`)
            functions.writeJSON("groups", "snipeData", replyingTo, `file[path]["${message.channel.id}"]["replyingTo"] = data`)
            functions.writeJSON("groups", "snipeData", message.id, `file[path]["${message.channel.id}"]["messageId"] = data`)
            functions.writeJSON("groups", "snipeData", message.content, `file[path]["${message.channel.id}"]["${message.author.id}"]["message"] = data`)
            functions.writeJSON("groups", "snipeData", deletedAt, `file[path]["${message.channel.id}"]["${message.author.id}"]["deletedAt"] = data`)
            functions.writeJSON("groups", "snipeData", attachmentUrls, `file[path]["${message.channel.id}"]["${message.author.id}"]["attachmentUrls"] = data`)
            functions.writeJSON("groups", "snipeData", replyingTo, `file[path]["${message.channel.id}"]["${message.author.id}"]["replyingTo"] = data`)
            functions.writeJSON("groups", "snipeData", message.id, `file[path]["${message.channel.id}"]["${message.author.id}"]["messageId"] = data`)

            const logs = [...functions.readJSON("snipe")[message.channel.id].logs]
            logs.push({
                message: message.content,
                deletedAt: deletedAt,
                userId: message.author.id,
                attachmentUrls: attachmentUrls,
                replyingTo: replyingTo,
                messageId: message.id
            })
            functions.writeJSON("snipe", "logs", logs, `file["${message.channel.id}"][path] = data`)

            if (functions.readJSON("groups")[message.channel.id].autoSnipe === true) {
                const arrayOfThingsToShow = [`**Message Author**: ${message.author.tag}`]

                if (message.referencedMessage) {
                    arrayOfThingsToShow.push(`**Replied Message URL**: ${message.referencedMessage.url}`)
                }

                if (message.content.length > 0) {
                    arrayOfThingsToShow.push(`**Message**: ${message.content}`)
                }

                if (attachmentUrls.length > 0) {
                    arrayOfThingsToShow.push(`**Attachments**: ${attachmentUrls.join("\n")}`)
                }

                arrayOfThingsToShow.push("`Auto Snipe`")

                message.channel.send(arrayOfThingsToShow.join("\n\n"), { autoQuote: true })
            }

            if (functions.configJSON.websiteUrl === "YOUR NGROK WEBSITE URL HERE") return

            if (message.attachments.size > 0) {
                if (!fs.existsSync(`./resources/channels/${message.channel.id}`)) fs.mkdirSync(`./resources/channels/${message.channel.id}`)
                if (!fs.existsSync(`./resources/channels/${message.channel.id}/${message.id}`)) fs.mkdirSync(`./resources/channels/${message.channel.id}/${message.id}`)
                fs.mkdirSync(`./resources/channels/${message.channel.id}/${message.id}/snipe`)

                let i = 0

                message.attachments.forEach(value => {
                    const file = fs.createWriteStream(`./resources/channels/${message.channel.id}/${message.id}/snipe/${value.filename}`)
                    https.get(value.url, response => {
                        response.pipe(file)
                        file.on("finish", async _ => {
                            file.close()
                            i += 1
                        })
                    })
                })

                const interval = setInterval(_ => {
                    if (i === message.attachments.size) {
                        clearInterval(interval)

                        const files = []

                        fs.readdirSync(`./resources/channels/${message.channel.id}/${message.id}/snipe`).forEach(file => {
                            files.push(`https://${functions.configJSON.websiteUrl}/channels/${message.channel.id}/${message.id}/snipe/${file}`)
                        })

                        const groupSnipeData = functions.readJSON("groups").snipeData[message.channel.id]
                        const groupUserSnipeData = functions.readJSON("groups").snipeData[message.channel.id][message.author.id]
                        const groupSnipeLogs = functions.readJSON("snipe")[message.channel.id].logs

                        if (groupSnipeData.messageId === message.id) {
                            functions.writeJSON("groups", "snipeData", files, `file[path]["${message.channel.id}"]["attachmentUrls"] = data`)
                        }

                        if (groupUserSnipeData.messageId === message.id) {
                            functions.writeJSON("groups", "snipeData", files, `file[path]["${message.channel.id}"]["${message.author.id}"]["attachmentUrls"] = data`)
                        }

                        const filtered = groupSnipeLogs.filter(v => v.messageId === message.id)[0]

                        filtered.attachmentUrls = files

                        functions.writeJSON("snipe", "logs", groupSnipeLogs, `file["${message.channel.id}"][path] = data`)
                    }
                }, 100)
            }
        }
    }
}