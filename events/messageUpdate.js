const functions = require("../functions")

module.exports = {
    name: "messageUpdate",
    once: false,
    async execute(client, oldMessage, newMessage) {
        if (newMessage.type === "DEFAULT" || newMessage.type === "REPLY" && oldMessage.content !== newMessage.content) {
            const editedAt = Date.now()

            if (!functions.readJSON("groups").editSnipeData[newMessage.channel.id])
                functions.writeJSON("groups", "editSnipeData", {}, `file[path]["${newMessage.channel.id}"] = data`)
            if (!functions.readJSON("groups").editSnipeData[newMessage.channel.id][newMessage.author.id])
                functions.writeJSON("groups", "editSnipeData", {}, `file[path]["${newMessage.channel.id}"]["${newMessage.author.id}"] = data`)

            if (!functions.readJSON("editsnipe")[newMessage.channel.id])
                functions.writeJSON("editsnipe", newMessage.channel.id, {}, `file[path] = data`)
            if (!functions.readJSON("editsnipe")[newMessage.channel.id].logs)
                functions.writeJSON("editsnipe", newMessage.channel.id, [], `file[path].logs = data`)

            functions.writeJSON("groups", "editSnipeData", `${oldMessage.content}`, `file[path]["${newMessage.channel.id}"]["oldMessage"] = data`)
            functions.writeJSON("groups", "editSnipeData", `${newMessage.content}`, `file[path]["${newMessage.channel.id}"]["newMessage"] = data`)
            functions.writeJSON("groups", "editSnipeData", `${editedAt}`, `file[path]["${newMessage.channel.id}"]["deletedAt"] = data`)
            functions.writeJSON("groups", "editSnipeData", `${newMessage.url}`, `file[path]["${newMessage.channel.id}"]["url"] = data`)
            functions.writeJSON("groups", "editSnipeData", `${newMessage.author.id}`, `file[path]["${newMessage.channel.id}"]["userId"] = data`)
            functions.writeJSON("groups", "editSnipeData", `${oldMessage.content}`, `file[path]["${newMessage.channel.id}"]["${newMessage.author.id}"]["oldMessage"] = data`)
            functions.writeJSON("groups", "editSnipeData", `${newMessage.content}`, `file[path]["${newMessage.channel.id}"]["${newMessage.author.id}"]["newMessage"] = data`)
            functions.writeJSON("groups", "editSnipeData", `${editedAt}`, `file[path]["${newMessage.channel.id}"]["${newMessage.author.id}"]["deletedAt"] = data`)
            functions.writeJSON("groups", "editSnipeData", `${newMessage.url}`, `file[path]["${newMessage.channel.id}"]["${newMessage.author.id}"]["url"] = data`)

            const logs = [...functions.readJSON("editsnipe")[newMessage.channel.id].logs]
            logs.push({
                oldMessage: oldMessage.content,
                newMessage: newMessage.content,
                editedAt: editedAt,
                url: newMessage.url,
                userId: newMessage.author.id
            })
            functions.writeJSON("editsnipe", "logs", logs, `file["${newMessage.channel.id}"][path] = data`)

            if (functions.readJSON("groups")[newMessage.channel.id].autoEditSnipe === true) {
                const arrayOfThingsToShow = [
                    `**Message Author**: ${newMessage.author.tag}`,
                    `**Message URL**: ${newMessage.url}`
                ]

                if (oldMessage.content.length > 0) {
                    arrayOfThingsToShow.push(`**Old Message**: ${oldMessage.content}`)
                }

                if (newMessage.content.length > 0) {
                    arrayOfThingsToShow.push(`**New Message**: ${newMessage.content}`)
                }

                arrayOfThingsToShow.push("`Auto Edit Snipe`")

                newMessage.channel.send(arrayOfThingsToShow.join("\n\n"), { autoQuote: true })
            }
        }
    }
}