const User = require('./User');
const Collection = require('../util/Collection');
const ClientUserSettings = require('./ClientUserSettings');
const ClientUserGuildSettings = require('./ClientUserGuildSettings');
const Constants = require('../util/Constants');
const util = require('util');

/**
 * Represents the logged in client's Discord user.
 * @extends {User}
 */
class ClientUser extends User {
  setup(data) {
    super.setup(data);

    /**
     * Whether or not this account has been verified
     * @type {boolean}
     */
    this.verified = data.verified;
    this.localPresence = {};
    this._typing = new Map();

    /**
     * A Collection of friends for the logged in user
     * <warn>This is only filled when using a user account.</warn>
     * @type {Collection<Snowflake, User>}
     * @deprecated
     */
    this.friends = new Collection();

    /**
     * Various settings for this user
     * <warn>This is only filled when using a user account.</warn>
     * @type {?ClientUserSettings}
     * @deprecated
     */
    this.settings = data.user_settings ? new ClientUserSettings(this, data.user_settings) : null;

    /**
     * All of the user's guild settings
     * <warn>This is only filled when using a user account</warn>
     * @type {Collection<Snowflake, ClientUserGuildSettings>}
     * @deprecated
     */
    this.guildSettings = new Collection();
    if (data.user_guild_settings) {
      for (const settings of data.user_guild_settings) {
        this.guildSettings.set(settings.guild_id, new ClientUserGuildSettings(settings, this.client));
      }
    }
  }

  edit(data) {
    return this.client.rest.methods.updateCurrentUser(data);
  }

  /**
   * An object containing either a user or access token, and an optional nickname.
   * @typedef {Object} GroupDMRecipientOptions
   * @property {UserResolvable|Snowflake} [user] User to add to the Group DM
   * (only available if a user is creating the DM)
   * @property {string} [accessToken] Access token to use to add a user to the Group DM
   * (only available if a bot is creating the DM)
   * @property {string} [nick] Permanent nickname (only available if a bot is creating the DM)
   */

  /**
   * Creates a Group DM.
   * @param {GroupDMRecipientOptions[]} recipients The recipients
   * @returns {Promise<GroupDMChannel>}
   * @example
   * // Create a Group DM with a token provided from OAuth
   * client.user.createGroupDM([{
   *   user: '66564597481480192',
   *   accessToken: token
   * }])
   *   .then(console.log)
   *   .catch(console.error);
   */
  createGroupDM(recipients) {
    return this.client.rest.methods.createGroupDM({
      recipients: recipients.map(u => this.client.resolver.resolveUserID(u.user)),
      accessTokens: recipients.map(u => u.accessToken),
      nicks: recipients.reduce((o, r) => {
        if (r.nick) o[r.user ? r.user.id : r.id] = r.nick;
        return o;
      }, {}),
    });
  }
}

module.exports = ClientUser;
