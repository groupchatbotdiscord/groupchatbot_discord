const Action = require('./Action');

class GuildRolesPositionUpdate extends Action {
  handle(data) {
    const client = this.client;

    const guild = client.guilds.get(data.guild_id);
    if (guild) {
      for (const role of data.roles) {
        const role2 = guild.roles.get(role.id);
        if (role2) role2.position = role.position;
      }
    }

    return { guild };
  }
}

module.exports = GuildRolesPositionUpdate;
