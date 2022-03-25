const Util = require('./util/Util');

module.exports = {
  // "Root" classes (starting points)
  Client: require('./client/Client'),
  WebhookClient: require('./client/WebhookClient'),

  // Utilities
  Collection: require('./util/Collection'),
  Constants: require('./util/Constants'),
  DiscordAPIError: require('./client/rest/DiscordAPIError'),
  Snowflake: require('./util/Snowflake'),
  SnowflakeUtil: require('./util/Snowflake'),
  Util: Util,
  util: Util,
  version: require('../package').version,

  // Shortcuts to Util methods
  escapeMarkdown: Util.escapeMarkdown,
  resolveString: Util.resolveString,
  splitMessage: Util.splitMessage,

  // Structures
  Attachment: require('./structures/Attachment'),
  CategoryChannel: require('./structures/CategoryChannel'),
  Channel: require('./structures/Channel'),
  ClientUser: require('./structures/ClientUser'),
  ClientUserSettings: require('./structures/ClientUserSettings'),
  Collector: require('./structures/interfaces/Collector'),
  DMChannel: require('./structures/DMChannel'),
  Emoji: require('./structures/Emoji'),
  Game: require('./structures/Presence').Game,
  GroupDMChannel: require('./structures/GroupDMChannel'),
  Guild: require('./structures/Guild'),
  GuildAuditLogs: require('./structures/GuildAuditLogs'),
  GuildChannel: require('./structures/GuildChannel'),
  GuildMember: require('./structures/GuildMember'),
  Message: require('./structures/Message'),
  MessageAttachment: require('./structures/MessageAttachment'),
  MessageCollector: require('./structures/MessageCollector'),
  MessageEmbed: require('./structures/MessageEmbed'),
  MessageMentions: require('./structures/MessageMentions'),
  MessageReaction: require('./structures/MessageReaction'),
  NewsChannel: require('./structures/NewsChannel'),
  Presence: require('./structures/Presence').Presence,
  ReactionEmoji: require('./structures/ReactionEmoji'),
  ReactionCollector: require('./structures/ReactionCollector'),
  RichEmbed: require('./structures/RichEmbed'),
  Role: require('./structures/Role'),
  StoreChannel: require('./structures/StoreChannel'),
  TextChannel: require('./structures/TextChannel'),
  User: require('./structures/User'),
  Webhook: require('./structures/Webhook'),
};
