const AbstractHandler = require('./AbstractHandler');

class RelationshipAddHandler extends AbstractHandler {
  handle(packet) {
    const client = this.packetManager.client;
    const data = packet.d;
    if (data.type === 1) {
      client.fetchUser(data.id, true, true).then(user => {
        client.user.friends.set(user.id, user);
      });
    }
  }
}

module.exports = RelationshipAddHandler;
