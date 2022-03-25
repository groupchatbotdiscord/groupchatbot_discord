const fs = require("fs")
const functions = require("../functions")
const spotify = require("../index").spotify

module.exports = {
    name: "spotify",
    description: `Downloads <trackUrl>.`,
    aliases: [],
    usage: "<trackUrl>",
    file: __filename,
    async execute(client, message, args, argsArray, target) {
        if (functions.configJSON.spotifyClientId === "YOUR SPOTIFY CLIENT ID HERE" && functions.configJSON.spotifyClientSecret === "YOUR SPOTIFY CLIENT SECRET HERE")
            return message.reply("The owner of this bot hasn't entered their Spotify application credentials.")

        if (functions.configJSON.websiteUrl === "YOUR NGROK WEBSITE URL HERE") return message.reply(`The owner of this bot hasn't entered an ngrok website.

        This command uses the website due to 8mb limits.`)

        if (argsArray[0]) {
            let data = null

            data = await spotify.getTrack(argsArray[0]).catch(_ => { })

            if (data) {
                let message2 = await message.reply(`Please wait. This could take some time.`)

                if (!fs.existsSync(`./resources/channels/${message.channel.id}`)) fs.mkdirSync(`./resources/channels/${message.channel.id}`)
                if (!fs.existsSync(`./resources/channels/${message.channel.id}/${message.id}`)) fs.mkdirSync(`./resources/channels/${message.channel.id}/${message.id}`)
                fs.mkdirSync(`./resources/channels/${message.channel.id}/${message.id}/spotify`)

                const song = await spotify.downloadTrack(argsArray[0])

                fs.writeFileSync(`./resources/channels/${message.channel.id}/${message.id}/spotify/song.mp3`, song)

                const stats = fs.statSync(`./resources/channels/${message.channel.id}/${message.id}/spotify/song.mp3`)

                if ((stats.size / (1024 * 1024)) < 8) {
                    message.reply("", {
                        files: [
                            {
                                attachment: fs.readFileSync(`./resources/channels/${message.channel.id}/${message.id}/spotify/song.mp3`),
                                name: "song.mp3"
                            }
                        ],
                        disableAutoQuote: true,
                        disableNotificationReminder: true
                    })
                        .then(_ => message2.delete())
                } else {
                    message2.delete()

                    message.reply(`Please paste the following URL into your web browser (Discord doesn't embed mp3 links):
                    https://${functions.configJSON.websiteUrl}/channels/${message.channel.id}/${message.id}/spotify/song.mp3
                    
                    • You have a day to download this file, GCB removes message_id folders that are at least one day old.`)
                }
            } else {
                message.reply(`You need to provide a valid Spotify track URL.`)
            }
        } else {
            message.reply(`You need to provide the Spotify track URL.`)
        }
    }
}