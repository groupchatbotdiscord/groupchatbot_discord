const functions = require("../functions")
const config = require("../data/config.json")
const fetch = require("node-fetch")

async function setCustomStatus(text) {
    let response = await fetch("https://discord.com/api/v9/users/@me/settings", {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            "authorization": config.token
        },
        body: JSON.stringify({
            custom_status: {
                text: text
            }
        })
    })
    response = response.json()
    return response
}

async function setStatus(client) {
    const groupCount = client.channels.filter(channel => channel.type === "group").size
    const groups = `${groupCount} group${groupCount === 1 ? "" : "s"}`

    setCustomStatus(`${groups}`)
}

module.exports = {
    name: "ready",
    once: true,
    async execute(client) {
        console.log(`Connected to ${client.user.username}`.green)

        setInterval(_ => {
            client.channels.forEach(channel => {
                if (functions.readJSON("groups")[channel.id] && functions.readJSON("groups")[channel.id].lockedGroupName) {
                    const lockedGroupName = functions.readJSON("groups")[channel.id].lockedGroupName

                    if (channel.name !== lockedGroupName) {
                        channel.setName(lockedGroupName)
                    }
                }
            })
        }, 1000)

        setInterval(async _ => {
            const status = client.ws.connection.status
            if (status === 1) {
                new Promise((resolve, reject) => {
                    client.manager.connectToWebSocket(config.token, resolve, reject)
                }).catch(e => {
                    return Promise.reject(e)
                })
            }
            setStatus(client)
        }, 15000)
    }
}