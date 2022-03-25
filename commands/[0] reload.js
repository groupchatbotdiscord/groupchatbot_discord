const fs = require("fs")

module.exports = {
    name: "reload",
    aliases: ["rl"],
    permission: "BOT_OWNER",
    file: __filename,
    async execute(client, message, args, argsArray) {
        let commandName = argsArray[0]

        if (commandName === "*") {
            let success = 0
            let fail = 0

            client.commands.clear()

            const commandFiles = fs.readdirSync("./commands")

            commandFiles.forEach(file => {
                try {
                    delete require.cache[require.resolve(`../commands/${file}`)]

                    const command = require(`../commands/${file}`)

                    client.commands.set(command.name, command)

                    success += 1
                } catch (error) {
                    console.log(error)

                    fail += 1
                }
            })

            let success2 = 0
            let fail2 = 0
            let ignored = 0

            const eventFiles = fs.readdirSync("./events")

            eventFiles.forEach(file => {
                if (file === "ready.js" || file === "ready.ts") return ignored += 1

                if (file.startsWith("!")) {
                    client.removeAllListeners(file.replace("! ", "").replace(".js", "").replace(".ts", ""))

                    return ignored += 1
                }

                try {
                    delete require.cache[require.resolve(`../events/${file}`)]

                    const event = require(`../events/${file}`)

                    client.removeAllListeners(event.name)

                    if (event.once) {
                        client.once(event.name, (...args) => event.execute(client, ...args))
                    } else {
                        client.on(event.name, (...args) => event.execute(client, ...args))
                    }

                    success2 += 1
                } catch (error) {
                    console.log(error)

                    fail2 += 1
                }
            })

            message.reply(`**Successful Command Reloads**: ${success}

            **Failed Command Reloads**: ${fail}

            **Successful Event Reloads**: ${success2}

            **Failed Event Reloads**: ${fail2}

            **Ignored Event Reloads**: ${ignored}`)
        } else {
            const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName))

            commandName = command ? command.name : commandName

            if (command) {
                try {
                    delete require.cache[require.resolve(command.file)]

                    client.commands.delete(commandName)

                    const pull = require(command.file)

                    client.commands.set(commandName, pull)

                    message.reply(`${commandName} has been reloaded.`)
                } catch (error) {
                    message.reply(`Failed to reload ${commandName}.`)

                    console.log(error)
                }
            } else {
                message.reply(`Couldn't find ${commandName}.`)
            }
        }
    }
}