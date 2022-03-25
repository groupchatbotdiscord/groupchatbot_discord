const functions = require("../functions")
const puppeteer = require("puppeteer")
let sendFriendRequestCooldown = {}

async function sendFriendRequest(page, message, message2, browser, startTime) {
    try {
        await page.waitForSelector("div[aria-label='Add Friend']", { visible: true })
        await page.click("div[aria-label='Add Friend']")

        await page.waitForSelector("input[placeholder='Enter a Username#0000']", { visible: true })
        await page.type("input[placeholder='Enter a Username#0000']", message.author.tag)
        await page.click("button[type='submit']")
        await browser.close()

        delete sendFriendRequestCooldown[message.author.id]
        const endTime = Date.now()

        message2.edit(`Check your pending friend requests. This process took ${functions.msToTime(endTime - startTime)}.

        • If you didn't receive a friend request make sure you have friend requests enabled and you don't have the bot blocked.`)
    } catch (error) {
        if (sendFriendRequestCooldown[message.author.id])
            sendFriendRequest(page, message, message2, browser, startTime)
    }
}

module.exports = {
    name: "sendfriendrequest",
    description: "Sends you a friend request.",
    aliases: ["sfr"],
    file: __filename,
    async execute(client, message, args, argsArray, target) {
        if (functions.configJSON.email === "YOUR EMAIL HERE" && functions.configJSON.password === "YOUR PASSWORD HERE") return message.reply("The bot owner hasn't setup this bots email/password.")

        if (client.user.friends.has(message.author.id)) return message.reply("You're already friends with the bot.")

        if (sendFriendRequestCooldown[message.author.id]) return message.reply("You've already used this command, please wait until the previous request is done.")

        const startTime = Date.now()

        sendFriendRequestCooldown[message.author.id] = true
        const message2 = await message.reply("Please wait.")

        try {
            const browser = await puppeteer.launch({
                headless: false,
                defaultViewport: null,
                args: functions.configJSON.defaultArgs
            })
            const page = await browser.newPage()
            page.goto("https://discord.com/login", { timeout: 0 })

            await page.waitForSelector("input[name='email']", { visible: true, timeout: 0 })
            await page.type("input[name='email']", functions.configJSON.email)
            await page.type("input[name='password']", functions.configJSON.password)
            await page.click("button[type='submit']")

            await page.waitForSelector("button[class^='searchBarComponent']", { visible: true })

            await page.waitForTimeout(1000)

            sendFriendRequest(page, message, message2, browser, startTime)
        } catch (error) {
            message2.edit("An error occurred. Please try again.")
            delete sendFriendRequestCooldown[message.author.id]
        }
    }
}