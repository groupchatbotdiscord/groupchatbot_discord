const Channel = require('./Channel');
const TextBasedChannel = require('./interfaces/TextBasedChannel');
const Collection = require('../util/Collection');
const Constants = require('../util/Constants');

/*
{ type: 3,
  recipients:
   [ { username: 'Charlie',
       id: '123',
       discriminator: '6631',
       avatar: '123' },
     { username: 'Ben',
       id: '123',
       discriminator: '2055',
       avatar: '123' },
     { username: 'Adam',
       id: '123',
       discriminator: '2406',
       avatar: '123' } ],
  owner_id: '123',
  name: null,
  last_message_id: '123',
  id: '123',
  icon: null }
*/

/**
 * Represents a Group DM on Discord.
 * @extends {Channel}
 * @implements {TextBasedChannel}
 */
let dataManager = null
class GroupDMChannel extends Channel {
  constructor(client, data) {
    super(client, data);
    this.type = 'group';
    this.messages = new Collection();
  }

  setup(data) {
    super.setup(data);

    if (this.client && this.client.dataManager) {
      dataManager = this.client.dataManager
    }

    /**
     * The name of this Group DM, can be null if one isn't set
     * @type {string}
     */
    this.name = data.name;

    /**
     * A hash of this Group DM icon
     * @type {?string}
     */
    this.icon = data.icon;

    /**
     * The user ID of this Group DM's owner
     * @type {string}
     */
    this.ownerID = data.owner_id;

    if (!this.recipients) {
      /**
       * A collection of the recipients of this DM, mapped by their ID
       * @type {Collection<Snowflake, User>}
       */
      this.recipients = new Collection();
    }
    
    if (data.recipients) {
      for (const recipient of data.recipients) {
        try {
          if (dataManager) {
            const user = dataManager.newUser(recipient);
            this.recipients.set(user.id, user);
          } else {
            const user = this.client.dataManager.newUser(recipient);
            this.recipients.set(user.id, user);
          }
        } catch { }
      }
    }

    /**
     * The ID of the last message in the channel, if one was sent
     * @type {?Snowflake}
     */
    this.lastMessageID = data.last_message_id;
  }

  /**
   * The owner of this Group DM
   * @type {User}
   * @readonly
   */
  get owner() {
    return this.client.users.get(this.ownerID);
  }

  /**
   * The URL to this guild's icon
   * @type {?string}
   * @readonly
   */
  get iconURL() {
    if (!this.icon) return null;
    return Constants.Endpoints.Channel(this).Icon(this.client.options.http.cdn, this.icon);
  }

  edit(data) {
    const _data = {};
    if (data.name) _data.name = data.name;
    if (typeof data.icon !== 'undefined') _data.icon = data.icon;
    return this.client.rest.methods.updateGroupDMChannel(this, _data);
  }

  /**
   * Whether this channel equals another channel. It compares all properties, so for most operations
   * it is advisable to just compare `channel.id === channel2.id` as it is much faster and is often
   * what most users need.
   * @param {GroupDMChannel} channel Channel to compare with
   * @returns {boolean}
   */
  equals(channel) {
    const equal = channel &&
      this.id === channel.id &&
      this.name === channel.name &&
      this.icon === channel.icon &&
      this.ownerID === channel.ownerID;

    if (equal) {
      return this.recipients.equals(channel.recipients);
    }

    return equal;
  }

  /**
   * Add a user to the DM
   * @param {UserResolvable|string} accessTokenOrID Access token or user resolvable
   * @param {string} [nick] Permanent nickname to give the user (only available if a bot is creating the DM)
   * @returns {Promise<GroupDMChannel>}
   */

  addUser(accessTokenOrID, nick) {
    return this.client.rest.methods.addUserToGroupDM(this, {
      nick,
      id: this.client.resolver.resolveUserID(accessTokenOrID),
      accessToken: accessTokenOrID,
    });
  }

  /**
   * Set a new GroupDMChannel icon.
   * @param {Base64Resolvable|BufferResolvable} icon The new icon of the group dm
   * @returns {Promise<GroupDMChannel>}
   * @example
   * // Edit the group dm icon
   * channel.setIcon('./icon.png')
   *  .then(updated => console.log('Updated the channel icon'))
   *  .catch(console.error);
   */
  setIcon(icon) {
    return this.client.resolver.resolveImage(icon).then(data => this.edit({ icon: data }));
  }

  /**
   * Sets a new name for this Group DM.
   * @param {string} name New name for this Group DM
   * @returns {Promise<GroupDMChannel>}
   */
  setName(name) {
    return this.edit({ name });
  }

  /**
   * Removes a user from this Group DM.
   * @param {UserResolvable} user User to remove
   * @returns {Promise<GroupDMChannel>}
   */
  removeUser(user) {
    const id = this.client.resolver.resolveUserID(user);
    return this.client.rest.methods.removeUserFromGroupDM(this, id);
  }

  /**
   * When concatenated with a string, this automatically concatenates the channel's name instead of the Channel object.
   * @returns {string}
   * @example
   * // Logs: Hello from My Group DM!
   * console.log(`Hello from ${channel}!`);
   * @example
   * // Logs: Hello from My Group DM!
   * console.log(`Hello from ' + channel + '!');
   */
  toString() {
    return this.name;
  }

  // These are here only for documentation purposes - they are implemented by TextBasedChannel
  /* eslint-disable no-empty-function */
  send() { }
  sendMessage() { }
  sendEmbed() { }
  sendFile() { }
  sendFiles() { }
  sendCode() { }
  fetchMessage() { }
  fetchMessages() { }
  search() { }
  createCollector() { }
  createMessageCollector() { }
  awaitMessages() { }
  acknowledge() { }
  _cacheMessage() { }
}

TextBasedChannel.applyToClass(GroupDMChannel, true, ['bulkDelete']);

module.exports = GroupDMChannel;
