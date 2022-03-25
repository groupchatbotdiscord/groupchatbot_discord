const Action = require('./Action');

class GuildChannelsPositionUpdate extends Action {
  handle(data) {
    const client = this.client;

    const guild = client.guilds.get(data.guild_id);
    if (guild) {
      for (const channel of data.channels) {
        const channel2 = guild.channels.get(channel.id);
        if (channel2) channel2.position = channel.position;
      }
    }

    return { guild };
  }
}

module.exports = GuildChannelsPositionUpdate;
