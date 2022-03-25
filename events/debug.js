module.exports = {
    name: "debug",
    once: false,
    async execute(client, info) {
        if (info.includes("as the websocket is at state 1")) {
            await client.ws.destroy()
            await client.ws.connect("wss://gateway.discord.gg/?v=9&encoding=json")
        }
    }
}