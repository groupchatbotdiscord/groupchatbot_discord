const Collection = require('../util/Collection');
const Snowflake = require('../util/Snowflake');

/**
 * The target type of an entry, e.g. `GUILD`. Here are the available types:
 * * GUILD
 * * CHANNEL
 * * USER
 * * ROLE
 * * EMOJI
 * * MESSAGE
 * @typedef {string} AuditLogTargetType
 */

/**
 * Key mirror of all available audit log targets.
 * @name GuildAuditLogs.Targets
 * @type {AuditLogTargetType}
 */
const Targets = {
  ALL: 'ALL',
  GUILD: 'GUILD',
  CHANNEL: 'CHANNEL',
  USER: 'USER',
  ROLE: 'ROLE',
  EMOJI: 'EMOJI',
  MESSAGE: 'MESSAGE',
  UNKNOWN: 'UNKNOWN',
};

/**
 * The action of an entry. Here are the available actions:
 * * ALL: null
 * * GUILD_UPDATE: 1
 * * CHANNEL_CREATE: 10
 * * CHANNEL_UPDATE: 11
 * * CHANNEL_DELETE: 12
 * * CHANNEL_OVERWRITE_CREATE: 13
 * * CHANNEL_OVERWRITE_UPDATE: 14
 * * CHANNEL_OVERWRITE_DELETE: 15
 * * MEMBER_UPDATE: 24
 * * MEMBER_ROLE_UPDATE: 25
 * * MEMBER_MOVE: 26
 * * MEMBER_DISCONNECT: 27
 * * BOT_ADD: 28,
 * * ROLE_CREATE: 30
 * * ROLE_UPDATE: 31
 * * ROLE_DELETE: 32
 * * EMOJI_CREATE: 60
 * * EMOJI_UPDATE: 61
 * * EMOJI_DELETE: 62
 * * MESSAGE_DELETE: 72
 * * MESSAGE_BULK_DELETE: 73
 * @typedef {?number|string} AuditLogAction
 */

/**
 * All available actions keyed under their names to their numeric values.
 * @name GuildAuditLogs.Actions
 * @type {AuditLogAction}
 */
const Actions = {
  ALL: null,
  GUILD_UPDATE: 1,
  CHANNEL_CREATE: 10,
  CHANNEL_UPDATE: 11,
  CHANNEL_DELETE: 12,
  CHANNEL_OVERWRITE_CREATE: 13,
  CHANNEL_OVERWRITE_UPDATE: 14,
  CHANNEL_OVERWRITE_DELETE: 15,
  MEMBER_UPDATE: 24,
  MEMBER_ROLE_UPDATE: 25,
  MEMBER_MOVE: 26,
  MEMBER_DISCONNECT: 27,
  BOT_ADD: 28,
  ROLE_CREATE: 30,
  ROLE_UPDATE: 31,
  ROLE_DELETE: 32,
  EMOJI_CREATE: 60,
  EMOJI_UPDATE: 61,
  EMOJI_DELETE: 62,
  MESSAGE_DELETE: 72,
  MESSAGE_BULK_DELETE: 73,
};


/**
 * Audit logs entries are held in this class.
 */
class GuildAuditLogs {
  constructor(guild, data) {
    if (data.users) for (const user of data.users) guild.client.dataManager.newUser(user);

    /**
     * The entries for this guild's audit logs
     * @type {Collection<Snowflake, GuildAuditLogsEntry>}
     */
    this.entries = new Collection();
    for (const item of data.audit_log_entries) {
      const entry = new GuildAuditLogsEntry(this, guild, item);
      this.entries.set(entry.id, entry);
    }
  }

  /**
   * Handles possible promises for entry targets.
   * @returns {Promise<GuildAuditLogs>}
   */
  static build(...args) {
    const logs = new GuildAuditLogs(...args);
    return Promise.all(logs.entries.map(e => e.target)).then(() => logs);
  }

  /**
   * The target of an entry. It can be one of:
   * * A guild
   * * A user
   * * A role
   * * An emoji
   * * An object with an id key if target was deleted
   * * An object where the keys represent either the new value or the old value
   * @typedef {?Object|Guild|User|Role|Emoji} AuditLogEntryTarget
   */

  /**
   * Find target type from entry action.
   * @param {number} target The action target
   * @returns {?string}
   */
  static targetType(target) {
    if (target < 10) return Targets.GUILD;
    if (target < 20) return Targets.CHANNEL;
    if (target < 30) return Targets.USER;
    if (target < 40) return Targets.ROLE;
    if (target < 50) return;
    if (target < 60) return;
    if (target < 70) return Targets.EMOJI;
    if (target < 80) return Targets.MESSAGE;
    return null;
  }

  /**
   * The action type of an entry, e.g. `CREATE`. Here are the available types:
   * * CREATE
   * * DELETE
   * * UPDATE
   * * ALL
   * @typedef {string} AuditLogActionType
   */


  /**
   * Finds the action type from the entry action.
   * @param {AuditLogAction} action The action target
   * @returns {AuditLogActionType}
   */
  static actionType(action) {
    if ([
      Actions.CHANNEL_CREATE,
      Actions.CHANNEL_OVERWRITE_CREATE,
      Actions.BOT_ADD,
      Actions.ROLE_CREATE,
      Actions.EMOJI_CREATE,
    ].includes(action)) return 'CREATE';

    if ([
      Actions.CHANNEL_DELETE,
      Actions.CHANNEL_OVERWRITE_DELETE,
      Actions.MEMBER_DISCONNECT,
      Actions.ROLE_DELETE,
      Actions.EMOJI_DELETE,
      Actions.MESSAGE_DELETE,
      Actions.MESSAGE_BULK_DELETE,
    ].includes(action)) return 'DELETE';

    if ([
      Actions.GUILD_UPDATE,
      Actions.CHANNEL_UPDATE,
      Actions.CHANNEL_OVERWRITE_UPDATE,
      Actions.MEMBER_UPDATE,
      Actions.MEMBER_ROLE_UPDATE,
      Actions.MEMBER_MOVE,
      Actions.ROLE_UPDATE,
      Actions.EMOJI_UPDATE,
    ].includes(action)) return 'UPDATE';

    return 'ALL';
  }
}

/**
 * Audit logs entry.
 */
class GuildAuditLogsEntry {
  // eslint-disable-next-line complexity
  constructor(logs, guild, data) {
    const targetType = GuildAuditLogs.targetType(data.action_type);
    /**
     * The target type of this entry
     * @type {AuditLogTargetType}
     */
    this.targetType = targetType;

    /**
     * The action type of this entry
     * @type {AuditLogActionType}
     */
    this.actionType = GuildAuditLogs.actionType(data.action_type);

    /**
     * Specific action type of this entry in its string representation
     * @type {AuditLogAction}
     */
    this.action = Object.keys(Actions).find(k => Actions[k] === data.action_type);

    /**
     * The reason of this entry
     * @type {?string}
     */
    this.reason = data.reason || null;

    /**
     * The user that executed this entry
     * @type {User}
     */
    this.executor = guild.client.users.get(data.user_id);

    /**
     * An entry in the audit log representing a specific change.
     * @typedef {object} AuditLogChange
     * @property {string} key The property that was changed, e.g. `nick` for nickname changes
     * @property {*} [old] The old value of the change, e.g. for nicknames, the old nickname
     * @property {*} [new] The new value of the change, e.g. for nicknames, the new nickname
     */

    /**
     * Specific property changes
     * @type {AuditLogChange[]}
     */
    this.changes = data.changes ? data.changes.map(c => ({ key: c.key, old: c.old_value, new: c.new_value })) : null;

    /**
     * The ID of this entry
     * @type {Snowflake}
     */
    this.id = data.id;

    /**
     * Any extra data from the entry
     * @type {?Object|Role|GuildMember}
     */
    this.extra = null;
    switch (data.action_type) {
      case Actions.MEMBER_MOVE:
      case Actions.MESSAGE_DELETE:
      case Actions.MESSAGE_BULK_DELETE:
        this.extra = {
          channel: guild.channels.get(data.options.channel_id) || { id: data.options.channel_id },
          count: Number(data.options.count),
        };
        break;

      case Actions.MEMBER_DISCONNECT:
        this.extra = {
          count: Number(data.options.count),
        };
        break;

      case Actions.CHANNEL_OVERWRITE_CREATE:
      case Actions.CHANNEL_OVERWRITE_UPDATE:
      case Actions.CHANNEL_OVERWRITE_DELETE:
        switch (data.options.type) {
          case 'member':
            this.extra = guild.members.get(data.options.id) ||
              { id: data.options.id, type: 'member' };
            break;
          case 'role':
            this.extra = guild.roles.get(data.options.id) ||
              { id: data.options.id, name: data.options.role_name, type: 'role' };
            break;
          default:
            break;
        }
        break;

      default:
        break;
    }

    /**
     * The target of this entry
     * @type {AuditLogEntryTarget}
     */
    this.target = null;
    if (targetType === Targets.UNKNOWN) {
      this.changes.reduce((o, c) => {
        o[c.key] = c.new || c.old;
        return o;
      }, {});
      this.target.id = data.target_id;
      // MEMBER_DISCONNECT and similar types do not provide a target_id.
    } else if (targetType === Targets.USER && data.target_id) {
      this.target = guild.client.users.get(data.target_id);
    } else if (targetType === Targets.GUILD) {
      this.target = guild.client.guilds.get(data.target_id);
    } else if (targetType === Targets.MESSAGE) {
      // Discord sends a channel id for the MESSAGE_BULK_DELETE action type.
      this.target = data.action_type === Actions.MESSAGE_BULK_DELETE ?
        guild.channels.get(data.target_id) || { id: data.target_id } :
        guild.client.users.get(data.target_id);
    } else if (data.target_id) {
      this.target = guild[`${targetType.toLowerCase()}s`].get(data.target_id) || { id: data.target_id };
    }
  }

  /**
   * The timestamp this entry was created at
   * @type {number}
   * @readonly
   */
  get createdTimestamp() {
    return Snowflake.deconstruct(this.id).timestamp;
  }

  /**
   * The time this entry was created
   * @type {Date}
   * @readonly
   */
  get createdAt() {
    return new Date(this.createdTimestamp);
  }
}

GuildAuditLogs.Actions = Actions;
GuildAuditLogs.Targets = Targets;
GuildAuditLogs.Entry = GuildAuditLogsEntry;

module.exports = GuildAuditLogs;
