# ⚠️ Warning ⚠️

This is a userbot which **is against Discord's community guidelines**, I am not responsible for any actions Discord may take.  
Don't use an account you value, make a new Discord account for userbots.
Additionally, we no longer update this project. **You may come across issues that never existed before**.

# Requirements

• [Node.JS v16.14.0](https://nodejs.org/download/release/v16.14.0/) - This may not be the **required** version but GCB was made on v16.14.0.  
• [MongoDB Server](https://www.mongodb.com/try/download/community)

# Optional
• [Ngrok](https://ngrok.com/download)

# Info

Some things **do** still use JSON files as the currency system was my main target for the MongoDB system.

I'm also fully aware that the code isn't clean, I've been trying to sort that out for a while.

For commands that use **config.json**'s **websiteUrl** property you need to have an ngrok website setup to use port 8080.  
Example: **groupchatbot.eu.ngrok.io** (**"websiteUrl": "groupchatbot.eu.ngrok.io"**).  
**Don't** include **https://** or the **/** at the end of **io**.

I've added an alternative **!help** (located in ./resources/) command for those that don't want to bother with ngrok, keep in mind some commands will not work without ngrok.

# Setup

Before you begin, make sure you clone the repository ([click here to clone it](https://github.com/groupchatbotdiscord/groupchatbot_discord/archive/refs/heads/main.zip)).

Create a new Discord account and get the accounts token, if you don't know how to do that [use this video](https://youtu.be/WWHZoa0SxCc?t=144).

After you've got the account token go to **config.json** (located in ./data/) and replace **YOUR TOKEN HERE** with the token.

For `!sendfriendrequest` replace **YOUR EMAIL HERE** with the account email and then replace **YOUR PASSWORD HERE** with the account password.

Open command prompt in the root directory and then use `npm i`, when it's done copy **discord.js** from the root directory to **node_modules**, this gives you Discord.JS v11 modifications.

Start the bot by using `node index.js` in command prompt.

# Adding the bot to a group

Send a friend request to your bots account and then accept it on the bot account, now add the bot to a group.  
If you don't have a second account to make a group add a random person from your friends list to the group and then remove them from the group.
