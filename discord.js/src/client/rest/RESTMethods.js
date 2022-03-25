const querystring = require('querystring');
const long = require('long');
const Constants = require('../../util/Constants');
const Endpoints = Constants.Endpoints;
const Collection = require('../../util/Collection');
const Util = require('../../util/Util');

const RichEmbed = require('../../structures/RichEmbed');
const User = require('../../structures/User');
const GuildMember = require('../../structures/GuildMember');
const Message = require('../../structures/Message');
const Role = require('../../structures/Role');
const Webhook = require('../../structures/Webhook');
const UserProfile = require('../../structures/UserProfile');
const Channel = require('../../structures/Channel');
const GroupDMChannel = require('../../structures/GroupDMChannel');
const Guild = require('../../structures/Guild');
const GuildAuditLogs = require('../../structures/GuildAuditLogs');

class RESTMethods {
  constructor(restManager) {
    this.rest = restManager;
    this.client = restManager.client;
    this._ackToken = null;
  }

  login(token = this.client.token) {
    return new Promise((resolve, reject) => {
      if (!token || typeof token !== 'string') throw new Error(Constants.Errors.INVALID_TOKEN);
      token = token.replace(/^Bot\s*/i, '');
      this.client.manager.connectToWebSocket(token, resolve, reject);
    }).catch(e => {
      this.client.destroy();
      return Promise.reject(e);
    });
  }

  logout() {
    return this.rest.makeRequest('post', Endpoints.logout, true, {});
  }

  getGateway(bot = false) {
    return this.rest.makeRequest('get', bot ? Endpoints.gateway.bot : Endpoints.gateway, true);
  }

  fetchEmbed(guildID) {
    return this.rest.makeRequest('get', Endpoints.Guild(guildID).embed, true).then(data => ({
      enabled: data.enabled,
      channel: data.channel_id ? this.client.channels.get(data.channel_id) : null,
    }));
  }

  sendMessage(channel, content, { tts, nonce, embed, disableEveryone, split, message_reference, allowed_mentions } = {}, files = null) {
    return new Promise((resolve, reject) => { // eslint-disable-line complexity
      if (typeof content !== 'undefined') content = this.client.resolver.resolveString(content);

      // The nonce has to be a uint64 :<
      if (typeof nonce !== 'undefined') {
        nonce = parseInt(nonce);
        if (isNaN(nonce) || nonce < 0) throw new RangeError('Message nonce must fit in an unsigned 64-bit integer.');
      }

      if (content) {
        if (split && typeof split !== 'object') split = {};

        // Add zero-width spaces to @everyone/@here
        if (disableEveryone || (typeof disableEveryone === 'undefined' && this.client.options.disableEveryone)) {
          content = content.replace(/@(everyone|here)/g, '@\u200b$1');
        }

        // Split the content
        if (split) content = Util.splitMessage(content, split);
      }

      const send = chan => {
        if (content instanceof Array) {
          const messages = [];
          (function sendChunk(list, index) {
            const options = index === list.length - 1 ? { tts, embed, files } : { tts };
            chan.send(list[index], options).then(message => {
              messages.push(message);
              if (index >= list.length - 1) return resolve(messages);
              return sendChunk(list, ++index);
            }).catch(reject);
          }(content, 0));
        } else {
          this.rest.makeRequest('post', Endpoints.Channel(chan).messages, true, {
            content, tts, nonce, embed, message_reference, allowed_mentions
          }, files).then(data => resolve(this.client.actions.MessageCreate.handle(data).message), reject);
        }
      };

      if (channel instanceof User || channel instanceof GuildMember) this.createDM(channel).then(send, reject);
      else send(channel);
    });
  }

  updateMessage(message, content, { flags, embed, message_reference, removeAttachments } = {}) {
    if (typeof content !== 'undefined') content = this.client.resolver.resolveString(content);

    const embeds = []

    if (embed instanceof RichEmbed) embeds.push(embed.toJSON());

    const body = {
      content,
      embeds,
      flags,
      message_reference,
      allowed_mentions: {
        replied_user: false
      }
    }

    if (removeAttachments && removeAttachments === true) {
      body.attachments = []
    }

    return this.rest.makeRequest('patch', Endpoints.Message(message), true, body).then(data => this.client.actions.MessageUpdate.handle(data).updated);
  }

  deleteMessage(message) {
    return this.rest.makeRequest('delete', Endpoints.Message(message), true)
      .then(() =>
        this.client.actions.MessageDelete.handle({
          id: message.id,
          channel_id: message.channel.id,
        }).message
      );
  }

  ackMessage(message) {
    return this.rest.makeRequest('post', Endpoints.Message(message).ack, true, { token: this._ackToken }).then(res => {
      if (res.token) this._ackToken = res.token;
      return message;
    });
  }

  ackTextChannel(channel) {
    return this.rest.makeRequest('post', Endpoints.Channel(channel).Message(channel.lastMessageID).ack, true, {
      token: this._ackToken,
    }).then(res => {
      if (res.token) this._ackToken = res.token;
      return channel;
    });
  }

  ackGuild(guild) {
    return this.rest.makeRequest('post', Endpoints.Guild(guild).ack, true).then(() => guild);
  }

  bulkDeleteMessages(channel, messages) {
    return this.rest.makeRequest('post', Endpoints.Channel(channel).messages.bulkDelete, true, {
      messages: messages,
    }).then(() =>
      this.client.actions.MessageDeleteBulk.handle({
        channel_id: channel.id,
        ids: messages,
      }).messages
    );
  }

  search(target, options) {
    if (typeof options === 'string') options = { content: options };
    if (options.before) {
      if (!(options.before instanceof Date)) options.before = new Date(options.before);
      options.maxID = long.fromNumber(options.before.getTime() - 14200704e5).shiftLeft(22).toString();
    }
    if (options.after) {
      if (!(options.after instanceof Date)) options.after = new Date(options.after);
      options.minID = long.fromNumber(options.after.getTime() - 14200704e5).shiftLeft(22).toString();
    }
    if (options.during) {
      if (!(options.during instanceof Date)) options.during = new Date(options.during);
      const t = options.during.getTime() - 14200704e5;
      options.minID = long.fromNumber(t).shiftLeft(22).toString();
      options.maxID = long.fromNumber(t + 86400000).shiftLeft(22).toString();
    }
    if (options.channel) options.channel = this.client.resolver.resolveChannelID(options.channel);
    if (options.author) options.author = this.client.resolver.resolveUserID(options.author);
    if (options.mentions) options.mentions = this.client.resolver.resolveUserID(options.options.mentions);
    options = {
      content: options.content,
      max_id: options.maxID,
      min_id: options.minID,
      has: options.has,
      channel_id: options.channel,
      author_id: options.author,
      author_type: options.authorType,
      context_size: options.contextSize,
      sort_by: options.sortBy,
      sort_order: options.sortOrder,
      limit: options.limit,
      offset: options.offset,
      mentions: options.mentions,
      mentions_everyone: options.mentionsEveryone,
      link_hostname: options.linkHostname,
      embed_provider: options.embedProvider,
      embed_type: options.embedType,
      attachment_filename: options.attachmentFilename,
      attachment_extension: options.attachmentExtension,
      include_nsfw: options.nsfw,
    };

    for (const key of Object.keys(options)) if (options[key] === undefined) delete options[key];
    const queryString = (querystring.stringify(options).match(/[^=&?]+=[^=&?]+/g) || []).join('&');

    let endpoint;
    if (target instanceof Channel) {
      endpoint = Endpoints.Channel(target).search;
    } else if (target instanceof Guild) {
      endpoint = Endpoints.Guild(target).search;
    } else {
      throw new TypeError('Target must be a TextChannel, DMChannel, GroupDMChannel, or Guild.');
    }
    return this.rest.makeRequest('get', `${endpoint}?${queryString}`, true).then(body => {
      const messages = body.messages.map(x =>
        x.map(m => new Message(this.client.channels.get(m.channel_id), m, this.client))
      );
      return {
        totalResults: body.total_results,
        messages,
      };
    });
  }

  createChannel(guild, name, options) {
    const {
      type,
      topic,
      nsfw,
      bitrate,
      userLimit,
      parent,
      permissionOverwrites,
      position,
      rateLimitPerUser,
      reason,
    } = options;
    return this.rest.makeRequest('post', Endpoints.Guild(guild).channels, true, {
      name,
      topic,
      type: type ? Constants.ChannelTypes[type.toUpperCase()] : Constants.ChannelTypes.TEXT,
      nsfw,
      bitrate,
      user_limit: userLimit,
      parent_id: parent instanceof Channel ? parent.id : parent,
      position,
      rate_limit_per_user: rateLimitPerUser,
    },
      undefined,
      reason).then(data => this.client.actions.ChannelCreate.handle(data).channel);
  }

  createDM(recipient) {
    const dmChannel = this.getExistingDM(recipient);
    if (dmChannel) return Promise.resolve(dmChannel);
    return this.rest.makeRequest('post', Endpoints.User(this.client.user).channels, true, {
      recipient_id: recipient.id,
    }).then(data => this.client.actions.ChannelCreate.handle(data).channel);
  }

  createGroupDM(options) {
    const data = this.client.user.bot ?
      { access_tokens: options.accessTokens, nicks: options.nicks } :
      { recipients: options.recipients };
    return this.rest.makeRequest('post', Endpoints.User('@me').channels, true, data)
      .then(res => new GroupDMChannel(this.client, res));
  }

  addUserToGroupDM(channel, options) {
    const data = this.client.user.bot ?
      { nick: options.nick, access_token: options.accessToken } :
      { recipient: options.id };
    return this.rest.makeRequest('put', Endpoints.Channel(channel).Recipient(options.id), true, data)
      .then(() => channel);
  }

  removeUserFromGroupDM(channel, userId) {
    return this.rest.makeRequest('delete', Endpoints.Channel(channel).Recipient(userId), true)
      .then(() => channel);
  }

  updateGroupDMChannel(channel, _data) {
    const data = {};
    data.name = _data.name;
    data.icon = _data.icon;
    return this.rest.makeRequest('patch', Endpoints.Channel(channel), true, data).then(() => channel);
  }

  getExistingDM(recipient) {
    return this.client.channels.find(channel =>
      channel.recipient && channel.recipient.id === recipient.id
    );
  }

  deleteChannel(channel, reason) {
    if (channel instanceof User || channel instanceof GuildMember) channel = this.getExistingDM(channel);
    if (!channel) return Promise.reject(new Error('No channel to delete.'));
    return this.rest.makeRequest('delete', Endpoints.Channel(channel), true, undefined, undefined, reason)
      .then(data => {
        data.id = channel.id;
        return this.client.actions.ChannelDelete.handle(data).channel;
      });
  }

  updateChannel(channel, _data, reason) {
    const data = {};
    data.name = (_data.name || channel.name).trim();
    data.topic = typeof _data.topic === 'undefined' ? channel.topic : _data.topic;
    data.nsfw = typeof _data.nsfw === 'undefined' ? channel.nsfw : _data.nsfw;
    data.position = _data.position || channel.position;
    data.bitrate = _data.bitrate || (channel.bitrate ? channel.bitrate * 1000 : undefined);
    data.user_limit = typeof _data.userLimit !== 'undefined' ? _data.userLimit : channel.userLimit;
    data.parent_id = _data.parent instanceof Channel ? _data.parent.id : _data.parent;
    data.rate_limit_per_user = typeof _data.rateLimitPerUser !== 'undefined' ?
      _data.rateLimitPerUser : channel.rateLimitPerUser;
    return this.rest.makeRequest('patch', Endpoints.Channel(channel), true, data, undefined, reason).then(newData =>
      this.client.actions.ChannelUpdate.handle(newData).updated
    );
  }

  leaveGuild(guild) {
    if (guild.ownerID === this.client.user.id) return Promise.reject(new Error('Guild is owned by the client.'));
    return this.rest.makeRequest('delete', Endpoints.User('@me').Guild(guild.id), true).then(() =>
      this.client.actions.GuildDelete.handle({ id: guild.id }).guild
    );
  }

  // Untested but probably will work
  deleteGuild(guild) {
    return this.rest.makeRequest('delete', Endpoints.Guild(guild), true).then(() =>
      this.client.actions.GuildDelete.handle({ id: guild.id }).guild
    );
  }

  getUser(userID, cache) {
    return this.rest.makeRequest('get', Endpoints.User(userID), true).then(data => {
      if (cache) return this.client.actions.UserGet.handle(data).user;
      else return new User(this.client, data);
    });
  }

  updateCurrentUser(_data, password) {
    const user = this.client.user;
    const data = {};
    data.username = _data.username || user.username;
    data.avatar = typeof _data.avatar === 'undefined' ? user.avatar : this.client.resolver.resolveBase64(_data.avatar);
    return this.rest.makeRequest('patch', Endpoints.User('@me'), true, data).then(newData =>
      this.client.actions.UserUpdate.handle(newData).updated
    );
  }

  updateGuild(guild, data, reason) {
    return this.rest.makeRequest('patch', Endpoints.Guild(guild), true, data, undefined, reason).then(newData =>
      this.client.actions.GuildUpdate.handle(newData).updated
    );
  }

  deleteGuildRole(role, reason) {
    return this.rest.makeRequest(
      'delete', Endpoints.Guild(role.guild).Role(role.id), true,
      undefined, undefined, reason)
      .then(() =>
        this.client.actions.GuildRoleDelete.handle({
          guild_id: role.guild.id,
          role_id: role.id,
        }).role
      );
  }

  setChannelOverwrite(channel, payload) {
    return this.rest.makeRequest('put', `${Endpoints.Channel(channel).permissions}/${payload.id}`, true, payload);
  }

  deletePermissionOverwrites(overwrite, reason) {
    return this.rest.makeRequest(
      'delete', `${Endpoints.Channel(overwrite.channel).permissions}/${overwrite.id}`,
      true, undefined, undefined, reason
    ).then(() => overwrite);
  }

  getChannelMessages(channel, payload = {}) {
    const params = [];
    if (payload.limit) params.push(`limit=${payload.limit}`);
    if (payload.around) params.push(`around=${payload.around}`);
    else if (payload.before) params.push(`before=${payload.before}`);
    else if (payload.after) params.push(`after=${payload.after}`);

    let endpoint = Endpoints.Channel(channel).messages;
    if (params.length > 0) endpoint += `?${params.join('&')}`;
    return this.rest.makeRequest('get', endpoint, true);
  }

  getChannelMessage(channel, messageID) {
    const msg = channel.messages.get(messageID);
    if (msg) return Promise.resolve(msg);
    return this.rest.makeRequest('get', Endpoints.Channel(channel).Message(messageID), true);
  }

  getGuild(guild) {
    return this.rest.makeRequest('get', Endpoints.Guild(guild), true);
  }

  getGuildMember(guild, userID, cache) {
    return this.rest.makeRequest('get', Endpoints.Guild(guild).Member(userID), true).then(data => {
      if (cache) return this.client.actions.GuildMemberGet.handle(guild, data).member;
      else return new GuildMember(guild, data);
    });
  }

  updateGuildMember(member, data, reason) {
    if (data.channel) {
      const channel = this.client.resolver.resolveChannel(data.channel);
      data.channel_id = channel.id;
      data.channel = undefined;
    } else if (data.channel === null) {
      data.channel_id = null;
      data.channel = undefined;
    }
    if (data.roles) data.roles = [...new Set(data.roles.map(role => role instanceof Role ? role.id : role))];

    let endpoint = Endpoints.Member(member);
    // Fix your endpoints, discord ;-;
    if (member.id === this.client.user.id) {
      const keys = Object.keys(data);
      if (keys.length === 1 && keys[0] === 'nick') {
        endpoint = Endpoints.Member(member).nickname;
      }
    }

    return this.rest.makeRequest('patch', endpoint, true, data, undefined, reason).then(newData =>
      member.guild._updateMember(member, newData).mem
    );
  }

  addMemberRole(member, role, reason) {
    return new Promise((resolve, reject) => {
      if (member._roles.includes(role.id)) return resolve(member);

      const listener = (oldMember, newMember) => {
        if (newMember.id === member.id && !oldMember._roles.includes(role.id) && newMember._roles.includes(role.id)) {
          this.client.removeListener(Constants.Events.GUILD_MEMBER_UPDATE, listener);
          resolve(newMember);
        }
      };

      this.client.on(Constants.Events.GUILD_MEMBER_UPDATE, listener);
      const timeout = this.client.setTimeout(() => {
        this.client.removeListener(Constants.Events.GUILD_MEMBER_UPDATE, listener);
        reject(new Error('Adding the role timed out.'));
      }, 10e3);

      return this.rest.makeRequest('put', Endpoints.Member(member).Role(role.id), true, undefined, undefined, reason)
        .catch(err => {
          this.client.removeListener(Constants.Events.GUILD_MEMBER_UPDATE, listener);
          this.client.clearTimeout(timeout);
          reject(err);
        });
    });
  }

  sendTyping(channelID) {
    return this.rest.makeRequest('post', Endpoints.Channel(channelID).typing, true);
  }

  removeMemberRole(member, role, reason) {
    return new Promise((resolve, reject) => {
      if (!member._roles.includes(role.id)) return resolve(member);

      const listener = (oldMember, newMember) => {
        if (newMember.id === member.id && oldMember._roles.includes(role.id) && !newMember._roles.includes(role.id)) {
          this.client.removeListener(Constants.Events.GUILD_MEMBER_UPDATE, listener);
          resolve(newMember);
        }
      };

      this.client.on(Constants.Events.GUILD_MEMBER_UPDATE, listener);
      const timeout = this.client.setTimeout(() => {
        this.client.removeListener(Constants.Events.GUILD_MEMBER_UPDATE, listener);
        reject(new Error('Removing the role timed out.'));
      }, 10e3);

      return this.rest.makeRequest('delete', Endpoints.Member(member).Role(role.id), true, undefined, undefined, reason)
        .catch(err => {
          this.client.removeListener(Constants.Events.GUILD_MEMBER_UPDATE, listener);
          this.client.clearTimeout(timeout);
          reject(err);
        });
    });
  }

  createEmoji(guild, image, name, roles, reason) {
    const data = { image, name };
    if (roles) data.roles = roles.map(r => r.id ? r.id : r);
    return this.rest.makeRequest('post', Endpoints.Guild(guild).emojis, true, data, undefined, reason)
      .then(emoji => this.client.actions.GuildEmojiCreate.handle(guild, emoji).emoji);
  }

  updateEmoji(emoji, _data, reason) {
    const data = {};
    if (_data.name) data.name = _data.name;
    if (_data.roles) data.roles = _data.roles.map(r => r.id ? r.id : r);
    return this.rest.makeRequest('patch', Endpoints.Guild(emoji.guild).Emoji(emoji.id), true, data, undefined, reason)
      .then(newEmoji => this.client.actions.GuildEmojiUpdate.handle(emoji, newEmoji).emoji);
  }

  deleteEmoji(emoji, reason) {
    return this.rest.makeRequest('delete', Endpoints.Guild(emoji.guild).Emoji(emoji.id), true, undefined, reason)
      .then(() => this.client.actions.GuildEmojiDelete.handle(emoji).emoji);
  }

  getGuildAuditLogs(guild, options = {}) {
    if (options.before && options.before instanceof GuildAuditLogs.Entry) options.before = options.before.id;
    if (options.after && options.after instanceof GuildAuditLogs.Entry) options.after = options.after.id;
    if (typeof options.type === 'string') options.type = GuildAuditLogs.Actions[options.type];

    const queryString = (querystring.stringify({
      before: options.before,
      after: options.after,
      limit: options.limit,
      user_id: this.client.resolver.resolveUserID(options.user),
      action_type: options.type,
    }).match(/[^=&?]+=[^=&?]+/g) || []).join('&');

    return this.rest.makeRequest('get', `${Endpoints.Guild(guild).auditLogs}?${queryString}`, true)
      .then(data => GuildAuditLogs.build(guild, data));
  }

  getWebhook(id, token) {
    return this.rest.makeRequest('get', Endpoints.Webhook(id, token), !token).then(data =>
      new Webhook(this.client, data)
    );
  }

  getGuildWebhooks(guild) {
    return this.rest.makeRequest('get', Endpoints.Guild(guild).webhooks, true).then(data => {
      const hooks = new Collection();
      for (const hook of data) hooks.set(hook.id, new Webhook(this.client, hook));
      return hooks;
    });
  }

  getChannelWebhooks(channel) {
    return this.rest.makeRequest('get', Endpoints.Channel(channel).webhooks, true).then(data => {
      const hooks = new Collection();
      for (const hook of data) hooks.set(hook.id, new Webhook(this.client, hook));
      return hooks;
    });
  }

  createWebhook(channel, name, avatar, reason) {
    return this.rest.makeRequest('post', Endpoints.Channel(channel).webhooks, true, { name, avatar }, undefined, reason)
      .then(data => new Webhook(this.client, data));
  }

  editWebhook(webhook, options, reason) {
    let endpoint;
    let auth;

    // Changing the channel of a webhook or specifying a reason requires a bot token
    if (options.channel_id || reason) {
      endpoint = Endpoints.Webhook(webhook.id);
      auth = true;
    } else {
      endpoint = Endpoints.Webhook(webhook.id, webhook.token);
      auth = false;
    }

    return this.rest.makeRequest('patch', endpoint, auth, options, undefined, reason).then(data => {
      webhook.name = data.name;
      webhook.avatar = data.avatar;
      webhook.channelID = data.channel_id;
      return webhook;
    });
  }

  deleteWebhook(webhook, reason) {
    return this.rest.makeRequest(
      'delete', Endpoints.Webhook(webhook.id, webhook.token),
      false, undefined, undefined, reason);
  }

  sendWebhookMessage(webhook, content, { avatarURL, tts, embeds, username } = {}, files = null) {
    return new Promise((resolve, reject) => {
      username = username || webhook.name;

      if (content instanceof Array) {
        const messages = [];
        (function sendChunk(list, index) {
          const options = index === list.length - 1 ? { tts, embeds, files } : { tts };
          webhook.send(list[index], options).then(message => {
            messages.push(message);
            if (index >= list.length - 1) return resolve(messages);
            return sendChunk(list, ++index);
          }).catch(reject);
        }(content, 0));
      } else {
        this.rest.makeRequest('post', `${Endpoints.Webhook(webhook.id, webhook.token)}?wait=true`, false, {
          username,
          avatar_url: avatarURL,
          content,
          tts,
          embeds,
        }, files).then(data => {
          if (!this.client.channels) resolve(data);
          else resolve(this.client.actions.MessageCreate.handle(data).message);
        }, reject);
      }
    });
  }

  sendSlackWebhookMessage(webhook, body) {
    return this.rest.makeRequest(
      'post', `${Endpoints.Webhook(webhook.id, webhook.token)}/slack?wait=true`, false, body
    );
  }

  fetchUserProfile(user) {
    return this.rest.makeRequest('get', Endpoints.User(user).profile, true).then(data =>
      new UserProfile(user, data)
    );
  }

  updateEmbed(guildID, embed, reason) {
    return this.rest.makeRequest('patch', Endpoints.Guild(guildID).embed, true, {
      enabled: embed.enabled,
      channel_id: this.client.resolver.resolveChannelID(embed.channel),
    }, undefined, reason);
  }

  setRolePositions(guildID, roles) {
    return this.rest.makeRequest('patch', Endpoints.Guild(guildID).roles, true, roles).then(() =>
      this.client.actions.GuildRolesPositionUpdate.handle({
        guild_id: guildID,
        roles,
      }).guild
    );
  }

  setChannelPositions(guildID, channels) {
    return this.rest.makeRequest('patch', Endpoints.Guild(guildID).channels, true, channels).then(() =>
      this.client.actions.GuildChannelsPositionUpdate.handle({
        guild_id: guildID,
        channels,
      }).guild
    );
  }

  addMessageReaction(message, emoji) {
    return this.rest.makeRequest(
      'put', Endpoints.Message(message).Reaction(emoji).User('@me'), true
    ).then(() =>
      message._addReaction(Util.parseEmoji(emoji), message.client.user)
    );
  }

  removeMessageReaction(message, emoji, userID) {
    const endpoint = Endpoints.Message(message).Reaction(emoji).User(userID === this.client.user.id ? '@me' : userID);
    return this.rest.makeRequest('delete', endpoint, true).then(() =>
      this.client.actions.MessageReactionRemove.handle({
        user_id: userID,
        message_id: message.id,
        emoji: Util.parseEmoji(emoji),
        channel_id: message.channel.id,
      }).reaction
    );
  }

  removeMessageReactionEmoji(message, emoji) {
    const endpoint = Endpoints.Message(message).Reaction(emoji);
    return this.rest.makeRequest('delete', endpoint, true).then(() =>
      this.client.actions.MessageReactionRemoveEmoji.handle({
        message_id: message.id,
        emoji: Util.parseEmoji(emoji),
        channel_id: message.channel.id,
      }).reaction
    );
  }

  removeMessageReactions(message) {
    return this.rest.makeRequest('delete', Endpoints.Message(message).reactions, true)
      .then(() => message);
  }

  getMessageReactionUsers(message, emoji, options) {
    const queryString = (querystring.stringify(options).match(/[^=&?]+=[^=&?]+/g) || []).join('&');

    return this.rest.makeRequest('get', `${Endpoints.Message(message).Reaction(emoji)}?${queryString}`, true);
  }

  patchUserSettings(data) {
    return this.rest.makeRequest('patch', Constants.Endpoints.User('@me').settings, true, data);
  }

  patchClientUserGuildSettings(guildID, data) {
    return this.rest.makeRequest('patch', Constants.Endpoints.User('@me').Guild(guildID).settings, true, data);
  }
}

module.exports = RESTMethods;
