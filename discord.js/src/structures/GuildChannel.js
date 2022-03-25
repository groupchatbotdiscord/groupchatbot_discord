const Channel = require('./Channel');
const Collection = require('../util/Collection');
const Constants = require('../util/Constants');
const Util = require('../util/Util');

/**
 * Represents a guild channel (i.e. text channels).
 * @extends {Channel}
 */
class GuildChannel extends Channel {
  constructor(guild, data) {
    super(guild.client, data);

    /**
     * The guild the channel is in
     * @type {Guild}
     */
    this.guild = guild;
  }

  setup(data) {
    super.setup(data);

    /**
     * The name of the guild channel
     * @type {string}
     */
    this.name = data.name;

    /**
     * The position of the channel in the list
     * @type {number}
     */
    this.position = data.position;

    /**
     * The ID of the category parent of this channel
     * @type {?Snowflake}
     */
    this.parentID = data.parent_id;
  }

  /**
   * The position of the channel
   * @type {number}
   * @readonly
   */
  get calculatedPosition() {
    const sorted = this.guild._sortedChannels(this.type);
    return sorted.array().indexOf(sorted.get(this.id));
  }

  /**
   * The category parent of this channel
   * @type {?CategoryChannel}
   * @readonly
   */
  get parent() {
    return this.guild.channels.get(this.parentID) || null;
  }

  /**
   * If the permissionOverwrites match the parent channel, null if no parent
   * @type {?boolean}
   * @readonly
   */
  get permissionsLocked() {
    if (!this.parent) return null;
    if (this.permissionOverwrites.size !== this.parent.permissionOverwrites.size) return false;
    return this.permissionOverwrites.every((value, key) => {
      const testVal = this.parent.permissionOverwrites.get(key);
      return testVal !== undefined &&
        testVal.deny === value.deny &&
        testVal.allow === value.allow;
    });
  }

  overwritesFor(member, verified = false, roles = null) {
    if (!verified) member = this.client.resolver.resolveGuildMember(this.guild, member);
    if (!member) return [];

    roles = roles || member.roles;
    const roleOverwrites = [];
    let memberOverwrites;
    let everyoneOverwrites;

    for (const overwrite of this.permissionOverwrites.values()) {
      if (overwrite.id === this.guild.id) {
        everyoneOverwrites = overwrite;
      } else if (roles.has(overwrite.id)) {
        roleOverwrites.push(overwrite);
      } else if (overwrite.id === member.id) {
        memberOverwrites = overwrite;
      }
    }

    return {
      everyone: everyoneOverwrites,
      roles: roleOverwrites,
      member: memberOverwrites,
    };
  }

  /**
   * Locks in the permission overwrites from the parent channel.
   * @returns {Promise<GuildChannel>}
   */
  lockPermissions() {
    if (!this.parent) return Promise.reject(new TypeError('Could not find a parent to this guild channel.'));
    const permissionOverwrites = this.parent.permissionOverwrites.map(overwrite => ({
      deny: overwrite.deny,
      allow: overwrite.allow,
      id: overwrite.id,
      type: overwrite.type,
    }));
    return this.edit({ permissionOverwrites });
  }

  /**
   * The data for a guild channel.
   * @typedef {Object} ChannelData
   * @property {string} [type] The type of the channel (Only when creating)
   * @property {string} [name] The name of the channel
   * @property {number} [position] The position of the channel
   * @property {string} [topic] The topic of the text channel
   * @property {boolean} [nsfw] Whether the channel is NSFW
   * @property {number} [userLimit] The user limit of the channel
   * @property {CategoryChannel|Snowflake} [parent] The parent or parent ID of the channel
   * Overwrites of the channel
   * @property {number} [rateLimitPerUser] The rate limit per user of the channel in seconds
   * @property {string} [reason] Reason for creating the channel (Only when creating)
   */

  /**
   * Edits the channel.
   * @param {ChannelData} data The new data for the channel
   * @param {string} [reason] Reason for editing this channel
   * @returns {Promise<GuildChannel>}
   * @example
   * // Edit a channel
   * channel.edit({ name: 'new-channel' })
   *   .then(console.log)
   *   .catch(console.error);
   */
  edit(data, reason) {
    return this.client.rest.methods.updateChannel(this, data, reason).then(() => this);
  }

  /**
   * Set a new name for the guild channel.
   * @param {string} name The new name for the guild channel
   * @param {string} [reason] Reason for changing the guild channel's name
   * @returns {Promise<GuildChannel>}
   * @example
   * // Set a new channel name
   * channel.setName('not_general')
   *   .then(newChannel => console.log(`Channel's new name is ${newChannel.name}`))
   *   .catch(console.error);
   */
  setName(name, reason) {
    return this.edit({ name }, reason);
  }

  /**
   * Set a new position for the guild channel.
   * @param {number} position The new position for the guild channel
   * @param {boolean} [relative=false] Move the position relative to its current value
   * @returns {Promise<GuildChannel>}
   * @example
   * // Set a new channel position
   * channel.setPosition(2)
   *   .then(newChannel => console.log(`Channel's new position is ${newChannel.position}`))
   *   .catch(console.error);
   */
  setPosition(position, relative) {
    return this.guild.setChannelPosition(this, position, relative).then(() => this);
  }

  /**
   * Set a new parent for the guild channel.
   * @param {CategoryChannel|SnowFlake} parent The new parent for the guild channel
   * @param {string} [reason] Reason for changing the guild channel's parent
   * @returns {Promise<GuildChannel>}
   * @example
   * // Sets the parent of a channel
   * channel.setParent('174674066072928256')
   *   .then(updated => console.log(`Set the category of ${updated.name} to ${updated.parent.name}`))
   *   .catch(console.error);
   */
  setParent(parent, reason) {
    parent = this.client.resolver.resolveChannelID(parent);
    return this.edit({ parent }, reason);
  }

  /**
   * Set a new topic for the guild channel.
   * @param {string} topic The new topic for the guild channel
   * @param {string} [reason] Reason for changing the guild channel's topic
   * @returns {Promise<GuildChannel>}
   * @example
   * // Set a new channel topic
   * channel.setTopic('Needs more rate limiting')
   *   .then(updated => console.log(`Channel's new topic is ${updated.topic}`))
   *   .catch(console.error);
   */
  setTopic(topic, reason) {
    return this.edit({ topic }, reason);
  }

  /* eslint-disable max-len */
  /**
   * Options to clone a guild channel.
   * @typedef {Object} GuildChannelCloneOptions
   * @property {string} [name=this.name] Name of the new channel
   * @property {string} [type=this.type] Type of the new channel
   * @property {string} [topic=this.topic] Topic of the new channel (only text)
   * @property {boolean} [nsfw=this.nsfw] Whether the new channel is nsfw (only text)
   * @property {number} [rateLimitPerUser=ThisType.rateLimitPerUser] Ratelimit per user for the new channel (only text)
   * @property {ChannelResolvable} [parent=this.parent] Parent of the new channel
   * @property {string} [reason] Reason for cloning this channel
   */
  /* eslint-enable max-len */

  /**
   * Clone this channel.
   * @param {string|GuildChannelCloneOptions} [nameOrOptions={}] Name for the new channel.
   * **(deprecated, use options)**
   * Alternatively options for cloning the channel
   * @param {boolean} [withPermissions=true] Whether to clone the channel with this channel's permission overwrites
   * **(deprecated, use options)**
   * @param {boolean} [withTopic=true] Whether to clone the channel with this channel's topic
   * **(deprecated, use options)**
   * @param {string} [reason] Reason for cloning this channel **(deprecated, user options)**
   * @returns {Promise<GuildChannel>}
   * @example
   * // Clone a channel
   * channel.clone({ topic: null, reason: 'Needed a clone' })
   *   .then(clone => console.log(`Cloned ${channel.name} to make a channel called ${clone.name}`))
   *   .catch(console.error);
   */
  clone(nameOrOptions = {}, withPermissions = true, withTopic = true, reason) {
    // If more than one parameter was specified or the first is a string,
    // convert them to a compatible options object and issue a warning
    if (arguments.length > 1 || typeof nameOrOptions === 'string') {
      process.emitWarning(
        'GuildChannel#clone: Clone channels using an options object instead of separate parameters.',
        'Deprecation Warning'
      );

      nameOrOptions = {
        name: nameOrOptions,
        permissionOverwrites: withPermissions ? this.permissionOverwrites : null,
        topic: withTopic ? this.topic : null,
        reason: reason || null,
      };
    }

    Util.mergeDefault({
      name: this.name,
      permissionOverwrites: this.permissionOverwrites,
      topic: this.topic,
      type: this.type,
      nsfw: this.nsfw,
      parent: this.parent,
      bitrate: this.bitrate,
      userLimit: this.userLimit,
      rateLimitPerUser: this.rateLimitPerUser,
      reason: null,
    }, nameOrOptions);

    return this.guild.createChannel(nameOrOptions.name, nameOrOptions);
  }

  /**
   * Deletes this channel.
   * @param {string} [reason] Reason for deleting this channel
   * @returns {Promise<GuildChannel>}
   * @example
   * // Delete the channel
   * channel.delete('Making room for new channels')
   *   .then(deleted => console.log(`Deleted ${deleted.name} to make room for new channels`))
   *   .catch(console.error);
   */
  delete(reason) {
    return this.client.rest.methods.deleteChannel(this, reason);
  }

  /**
   * Checks if this channel has the same type, topic, position, name, overwrites and ID as another channel.
   * In most cases, a simple `channel.id === channel2.id` will do, and is much faster too.
   * @param {GuildChannel} channel Channel to compare with
   * @returns {boolean}
   */
  equals(channel) {
    let equal = channel &&
      this.id === channel.id &&
      this.type === channel.type &&
      this.topic === channel.topic &&
      this.position === channel.position &&
      this.name === channel.name;

    if (equal) {
      if (this.permissionOverwrites && channel.permissionOverwrites) {
        equal = this.permissionOverwrites.equals(channel.permissionOverwrites);
      } else {
        equal = !this.permissionOverwrites && !channel.permissionOverwrites;
      }
    }

    return equal;
  }

  /**
   * Whether the channel is muted
   * <warn>This is only available when using a user account.</warn>
   * @type {?boolean}
   * @readonly
   * @deprecated
   */
  get muted() {
    if (this.client.user.bot) return null;
    try {
      return this.client.user.guildSettings.get(this.guild.id).channelOverrides.get(this.id).muted;
    } catch (err) {
      return false;
    }
  }

  /**
   * The type of message that should notify you
   * <warn>This is only available when using a user account.</warn>
   * @type {?MessageNotificationType}
   * @readonly
   * @deprecated
   */
  get messageNotifications() {
    if (this.client.user.bot) return null;
    try {
      return this.client.user.guildSettings.get(this.guild.id).channelOverrides.get(this.id).messageNotifications;
    } catch (err) {
      return Constants.MessageNotificationTypes[3];
    }
  }

  /**
   * When concatenated with a string, this automatically returns the channel's mention instead of the Channel object.
   * @returns {string}
   * @example
   * // Logs: Hello from <#123456789012345678>
   * console.log(`Hello from ${channel}`);
   * @example
   * // Logs: Hello from <#123456789012345678>
   * console.log('Hello from ' + channel);
   */
  toString() {
    return `<#${this.id}>`;
  }
}

module.exports = GuildChannel;
