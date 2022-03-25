const AbstractHandler = require('./AbstractHandler');

const ClientUser = require('../../../../structures/ClientUser');

class ReadyHandler extends AbstractHandler {
  handle(packet) {
    const client = this.packetManager.client;
    const data = packet.d;

    client.ws.heartbeat();

    data.user.user_settings = data.user_settings;
    data.user.user_guild_settings = data.user_guild_settings;

    const clientUser = new ClientUser(client, data.user);
    client.user = clientUser;
    client.readyAt = new Date();
    client.users.set(clientUser.id, clientUser);

    for (const guild of data.guilds) if (!client.guilds.has(guild.id)) client.dataManager.newGuild(guild);
    for (const privateDM of data.private_channels) client.dataManager.newChannel(privateDM);

    for (const relation of data.relationships) {
      const user = client.dataManager.newUser(relation.user);
      if (relation.type === 1) {
        client.user.friends.set(user.id, user);
      }
    }

    data.presences = data.presences || [];
    for (const presence of data.presences) {
      client.dataManager.newUser(presence.user);
      client._setPresence(presence.user.id, presence);
    }

    if (!client.user.bot && client.options.sync) client.setInterval(client.syncGuilds.bind(client), 30000);

    const t = client.setTimeout(() => {
      client.ws.connection.triggerReady();
    }, 1200 * data.guilds.length);

    const guildCount = data.guilds.length;

    if (client.getMaxListeners() !== 0) client.setMaxListeners(client.getMaxListeners() + guildCount);

    client.once('ready', () => {
      client.syncGuilds();
      if (client.getMaxListeners() !== 0) client.setMaxListeners(client.getMaxListeners() - guildCount);
      client.clearTimeout(t);
    });

    const ws = this.packetManager.ws;

    ws.sessionID = data.session_id;
    client.emit('debug', `READY ${ws.sessionID}`);
    ws.checkIfReady();
  }
}

module.exports = ReadyHandler;
