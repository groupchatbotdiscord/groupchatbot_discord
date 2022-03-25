const fetch = require("node-fetch")

module.exports = {
    name: "steam",
    description: "Shows steam info about <gameName>.",
    usage: "<gameName>",
    aliases: [],
    file: __filename,
    async execute(client, message, args, argsArray) {
        if (argsArray[0]) {
            const message2 = await message.reply("Please wait.")
            let response = await fetch(`https://api.steampowered.com/ISteamApps/GetAppList/v0002`)

            response = await response.json()

            let cache = await response.applist.apps.sort((a, b) => {
                if (a.name.trim() < b.name.trim())
                    return -1
                if (a.name.trim() > b.name.trim())
                    return 1
                return 0
            })

            let game = cache
                .filter(value => value.name
                    .toLowerCase()
                    .replaceAll(/[^\x00-\x7F]/g, "")
                    .replaceAll(":", "")
                    .startsWith(args
                        .toLowerCase()
                        .replaceAll(/[^\x00-\x7F]/g, "")
                        .replaceAll(":", ""))) || cache
                            .find(value => value.appid === parseInt(argsArray[0])) || undefined

            if (game[0]) {
                game = game.slice(0, 25)

                if (game.length === 1) {
                    game = game[0].appid
                } else {
                    const description = []

                    game.forEach((value, index) => {
                        description.push(`${index + 1} - ${value.name}`)
                    })

                    message2.edit(`**Choose Game**
                    ${description.join("\n")}`)

                    const filter = response => response.author.id === message.author.id

                    const collected = await message.channel.awaitMessages(filter, { maxMatches: 1 })

                    const number = parseInt(collected.first().content)

                    if (number && number <= game.length) {
                        game = game[number - 1].appid
                    } else {
                        game = null

                        message2.edit("Invalid choice.")
                    }
                }

                if (!game) return

                let response = await fetch(`https://store.steampowered.com/api/appdetails?appids=${game}`)

                response = await response.json()

                let response2 = await fetch(`https://steamspy.com/api.php?request=appdetails&appid=${game}`)

                response2 = await response2.json()

                const json = response[game] || response || null
                const json2 = response2

                if (!json.success) {
                    message2.edit("The Steam API doesn't have this game documented.")
                } else {
                    const arrayOfThingsToShow = []

                    if (json.data.name)
                        arrayOfThingsToShow.push(`**Game Name**\n${json.data.name}`)

                    if (json.data.developers[0])
                        arrayOfThingsToShow.push(`**Developers**\n${json.data.developers.join(", ")}`)

                    if (json.data.publishers[0])
                        arrayOfThingsToShow.push(`**Publishers**\n${json.data.publishers.join(", ")}`)

                    if (json2.positive)
                        arrayOfThingsToShow.push(`**Likes**\n${json2.positive}`)

                    if (json2.negative)
                        arrayOfThingsToShow.push(`**Dislikes**\n${json2.negative}`)

                    if (json.data.release_date)
                        arrayOfThingsToShow.push(`**Release Date**\n${json.data.release_date.date}${json.data.release_date.coming_soon === true ? " (Coming Soon)" : ""}`)

                    if (json2.owners)
                        arrayOfThingsToShow.push(`**Owners**\n${json2.owners.replace("..", "-")}`)

                    if (json.data.price_overview) {
                        if (json.data.is_free)
                            arrayOfThingsToShow.push(`**Price**\nFree`)
                        else
                            arrayOfThingsToShow.push(`**Price**\n${json.data.price_overview.final_formatted}`)
                    }

                    if (json.data.platforms)
                        arrayOfThingsToShow.push(`**Platforms**
                        Windows - ${json.data.platforms.windows === true ? "✓" : "✘"}
                        Mac - ${json.data.platforms.mac === true ? "✓" : "✘"}
                        Linux - ${json.data.platforms.linux === true ? "✓" : "✘"}`)

                    arrayOfThingsToShow.push(`https://cdn.akamai.steamstatic.com/steam/apps/${game}/header.jpg`)

                    message2.edit(arrayOfThingsToShow.join("\n\n"))
                }
            } else {
                message2.edit("Failed to find the game you're looking for.")
            }
        } else {
            message.reply(`This command requires 1 parameter.

            **Usage**
            !steam <gameName>

            **Example**
            !steam Terraria`)
        }
    }
}