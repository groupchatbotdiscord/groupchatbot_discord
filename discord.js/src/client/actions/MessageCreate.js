const Action = require('./Action');
const Message = require('../../structures/Message');

class MessageCreateAction extends Action {
  handle(data) {
    const client = this.client;

    const channel = client.channels.get((data instanceof Array ? data[0] : data).channel_id);
    let user
    try {
      user = client.users.get((data instanceof Array ? data[0] : data).author.id);
    } catch (error) { }
    if (channel) {
      if (data instanceof Array) {
        const messages = new Array(data.length);
        for (let i = 0; i < data.length; i++) {
          messages[i] = channel._cacheMessage(new Message(channel, data[i], client));
        }
        const lastMessage = messages[messages.length - 1];
        channel.lastMessageID = lastMessage.id;
        if (user) {
          user.lastMessageID = lastMessage.id;
          user.lastMessage = lastMessage;
        }
        if (data.type === 1) {
          // Added
          channel.recipients = channel.recipients.set(data.mentions[0].id, data.mentions[0])
        } else if (data.type === 2) {
          // Removed
          channel.recipients = channel.recipients.delete(data.mentions[0].id)
        }
        return {
          messages,
        };
      } else {
        const message = channel._cacheMessage(new Message(channel, data, client));
        channel.lastMessageID = data.id;
        if (user) {
          user.lastMessageID = data.id;
          user.lastMessage = message;
        }
        if (data.type === 1) {
          const user = client.dataManager.newUser(data.mentions[0])
          channel.recipients.set(user.id, user)
        } else if (data.type === 2) {
          const user = client.dataManager.newUser(data.mentions[0])
          channel.recipients.delete(user.id)
        }
        return {
          message,
        };
      }
    }

    return {
      message: null,
    };
  }
}

module.exports = MessageCreateAction;
