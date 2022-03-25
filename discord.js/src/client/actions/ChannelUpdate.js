const GroupDMChannel = require("../../structures/GroupDMChannel")
const Constants = require('../../util/Constants');

class ChannelUpdateAction extends require('./Action') {
  handle(data) {
    if (data.type === Constants.ChannelTypes.GROUP_DM) {
      try {
        const client = this.client;
        let channel = client.channels.get(data.id);
        if (channel) {
          const oldChannel = require('../../util/Util').cloneObject(channel);
          if (Constants.ChannelTypes[channel.type.toUpperCase()] !== data.type) {
            const newChannel = new GroupDMChannel(channel, data);
            if (channel.messages && newChannel.messages) {
              for (const [id, message] of channel.messages)
                if (id)
                  newChannel.messages.set(id, message);
            }
            channel.name = newChannel.name
            channel.icon = newChannel.icon
            channel.ownerID = newChannel.ownerID
            channel.messages = newChannel.messages
            channel.deleted = newChannel.deleted
            channel.id = newChannel.id
            channel.lastMessageID = newChannel.lastMessageID
            // this.client.channels.set(channel.id, channel);
          } else {
            channel.setup(data);
          }

          client.emit(Constants.Events.CHANNEL_UPDATE, oldChannel, channel);
          return {
            old: oldChannel,
            updated: channel,
          };
        }

        return {
          old: null,
          updated: null,
        };
      } catch (error) {
        console.error(`Channel Update Error: ${error.stack}`)
      }
    }
  }
}

/**
 * Emitted whenever a channel is updated - e.g. name change, topic change.
 * @event Client#channelUpdate
 * @param {Channel} oldChannel The channel before the update
 * @param {Channel} newChannel The channel after the update
 */

module.exports = ChannelUpdateAction;
