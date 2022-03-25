const TextBasedChannel = require('./interfaces/TextBasedChannel');
const Constants = require('../util/Constants');
const Presence = require('./Presence').Presence;
const Snowflake = require('../util/Snowflake');
const util = require('util');

/**
 * Represents a user on Discord.
 * @implements {TextBasedChannel}
 */
class User {
  constructor(client, data) {
    /**
     * The client that created the instance of the user
     * @name User#client
     * @type {Client}
     * @readonly
     */
    Object.defineProperty(this, 'client', { value: client });

    if (data) this.setup(data);
  }

  setup(data) {
    /**
     * The ID of the user
     * @type {Snowflake}
     */
    this.id = data.id;

    /**
     * The username of the user
     * @type {string}
     */
    this.username = data.username;

    /**
     * A discriminator based on username for the user
     * @type {string}
     */
    this.discriminator = data.discriminator;

    /**
     * The ID of the user's avatar
     * @type {string}
     */
    this.avatar = data.avatar;

    /**
     * The user banner's hash
     * <info>The user must be force fetched for this property to be present or be updated</info>
     * @type {?string}
     */
    this.banner = data.banner;

    /**
     * The base 10 accent color of the user's banner
     * <info>The user must be force fetched for this property to be present or be updated</info>
     * @type {?number}
     */
    this.accentColor = data.accent_color;

    /**
     * Whether or not the user is a bot
     * @type {boolean}
     */
    this.bot = Boolean(data.bot);

    /**
     * Whether this is an Official Discord System user (part of the urgent message system)
     * @type {?boolean}
     * @name User#system
     */
    if (typeof data.system !== 'undefined') this.system = Boolean(data.system);

    /**
     * The ID of the last message sent by the user, if one was sent
     * @type {?Snowflake}
     */
    this.lastMessageID = null;

    /**
     * The Message object of the last message sent by the user, if one was sent
     * @type {?Message}
     */
    this.lastMessage = null;
  }

  patch(data) {
    for (const prop of ['id', 'username', 'discriminator', 'avatar', 'bot']) {
      if (typeof data[prop] !== 'undefined') this[prop] = data[prop];
    }
    if (data.token) this.client.token = data.token;
  }

  /**
   * The timestamp the user was created at
   * @type {number}
   * @readonly
   */
  get createdTimestamp() {
    return Snowflake.deconstruct(this.id).timestamp;
  }

  /**
   * The time the user was created
   * @type {Date}
   * @readonly
   */
  get createdAt() {
    return new Date(this.createdTimestamp);
  }

  /**
   * The presence of this user
   * @type {Presence}
   * @readonly
   */
  get presence() {
    if (this.client.presences.has(this.id)) return this.client.presences.get(this.id);
    for (const guild of this.client.guilds.values()) {
      if (guild.presences.has(this.id)) return guild.presences.get(this.id);
    }
    return new Presence(undefined, this.client);
  }

  /**
   * A link to the user's avatar
   * @type {?string}
   * @readonly
   */
  get avatarURL() {
    if (!this.avatar) return null;
    return Constants.Endpoints.User(this).Avatar(this.client.options.http.cdn, this.avatar);
  }

  /**
   * A link to the user's default avatar
   * @type {string}
   * @readonly
   */
  get defaultAvatarURL() {
    const avatars = Object.keys(Constants.DefaultAvatars);
    const avatar = avatars[this.discriminator % avatars.length];
    return Constants.Endpoints.CDN(this.client.options.http.host).Asset(`${Constants.DefaultAvatars[avatar]}.png`);
  }

  /**
   * A link to the user's banner
   * @type {?string}
   * @readonly
   */
  get bannerURL() {
    if (!this.banner) return null;
    return Constants.Endpoints.User(this).Banner(this.client.options.http.cdn, this.banner)
  }

  /**
   * A link to the user's avatar if they have one. Otherwise a link to their default avatar will be returned
   * @type {string}
   * @readonly
   */
  get displayAvatarURL() {
    return this.avatarURL || this.defaultAvatarURL;
  }

  /**
   * A link to the user's banner
   * @type {String}
   * @readonly
   */
  get displayBannerURL() {
    return this.bannerURL
  }

  /**
   * The Discord "tag" (e.g. `hydrabolt#0001`) for this user
   * @type {string}
   * @readonly
   */
  get tag() {
    return `${this.username}#${this.discriminator}`;
  }

  /**
   * The DM between the client's user and this user
   * @type {?DMChannel}
   * @readonly
   */
  get dmChannel() {
    return this.client.channels.find(c => c.type === 'dm' && c.recipient.id === this.id);
  }

  /**
   * Creates a DM channel between the client and the user.
   * @returns {Promise<DMChannel>}
   */
  createDM() {
    return this.client.rest.methods.createDM(this);
  }

  /**
   * Deletes a DM channel (if one exists) between the client and the user. Resolves with the channel if successful.
   * @returns {Promise<DMChannel>}
   */
  deleteDM() {
    return this.client.rest.methods.deleteChannel(this);
  }

  /**
   * Get the profile of the user.
   * <warn>This is only available when using a user account.</warn>
   * @returns {Promise<UserProfile>}
   * @deprecated
   */
  fetchProfile() {
    return this.client.rest.methods.fetchUserProfile(this);
  }

  /**
   * Checks if the user is equal to another. It compares ID, username, discriminator, avatar, and bot flags.
   * It is recommended to compare equality by using `user.id === user2.id` unless you want to compare all properties.
   * @param {User} user User to compare with
   * @returns {boolean}
   */
  equals(user) {
    let equal = user &&
      this.id === user.id &&
      this.username === user.username &&
      this.discriminator === user.discriminator &&
      this.avatar === user.avatar &&
      this.bot === Boolean(user.bot);

    return equal;
  }

  /**
   * When concatenated with a string, this automatically concatenates the user's mention instead of the User object.
   * @returns {string}
   * @example
   * // logs: Hello from <@123456789>!
   * console.log(`Hello from ${user}!`);
   */
  toString() {
    return `<@${this.id}>`;
  }

  // These are here only for documentation purposes - they are implemented by TextBasedChannel
  /* eslint-disable no-empty-function */
  send() { }
  sendMessage() { }
  sendEmbed() { }
  sendFile() { }
  sendCode() { }
}

TextBasedChannel.applyToClass(User);

User.prototype.fetchProfile =
  util.deprecate(User.prototype.fetchProfile, 'User#fetchProfile: userbot methods will be removed');

module.exports = User;
