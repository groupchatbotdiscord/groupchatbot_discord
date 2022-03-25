const fs = require("fs")
const functions = require("../functions")
const ytdl = require("ytdl-core")

module.exports = {
    name: "youtube",
    description: `Downloads <url>.`,
    aliases: ["yt"],
    usage: "<url>",
    file: __filename,
    async execute(client, message, args, argsArray, target) {
        if (functions.configJSON.websiteUrl === "YOUR NGROK WEBSITE URL HERE") return message.reply(`The owner of this bot hasn't entered an ngrok website.
        
        This command uses the website due to 8mb limits.`)

        if (argsArray[0]) {
            if (ytdl.validateURL(argsArray[0])) {
                let message2 = await message.reply(`Please wait. This could take some time.`)

                if (!fs.existsSync(`./resources/channels/${message.channel.id}`)) fs.mkdirSync(`./resources/channels/${message.channel.id}`)
                if (!fs.existsSync(`./resources/channels/${message.channel.id}/${message.id}`)) fs.mkdirSync(`./resources/channels/${message.channel.id}/${message.id}`)
                fs.mkdirSync(`./resources/channels/${message.channel.id}/${message.id}/youtube`)

                ytdl(argsArray[0], { quality: "highestvideo", filter: "videoandaudio" })
                    .pipe(fs.createWriteStream(`./resources/channels/${message.channel.id}/${message.id}/youtube/video.mp4`))
                    .on("finish", _ => {
                        message2.delete()

                        const stats = fs.statSync(`./resources/channels/${message.channel.id}/${message.id}/youtube/video.mp4`)

                        if ((stats.size / (1024 * 1024)) < 8) {
                            message.reply("", {
                                files: [
                                    {
                                        attachment: fs.readFileSync(`./resources/channels/${message.channel.id}/${message.id}/youtube/video.mp4`),
                                        name: "video.mp4"
                                    }
                                ],
                                disableAutoQuote: true,
                                disableNotificationReminder: true
                            })
                        } else {
                            message.reply(`If the video cannot be played on Discord please paste the URL into your web browser.
                            https://${functions.configJSON.websiteUrl}/channels/${message.channel.id}/${message.id}/youtube/video.mp4

                            • You have a day to download this file, GCB removes message_id folders that are at least one day old.`)
                        }
                    })
            } else {
                message.reply(`You need to provide a valid YouTube video URL.`)
            }
        } else {
            message.reply(`You need to provide the YouTube video URL.`)
        }
    }
}