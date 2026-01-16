import Logger from '../utils/Logger.js';

class AntiRaidSystem {
  constructor(client, config) {
    this.client = client;
    this.config = config || {};
    this.activityTracker = new Map(); // userId -> { actions: [], timestamps: [] }
    this.suspiciousUsers = new Map(); // userId -> suspicionLevel
  }

  init() {
    if (!this.config.enabled) return;

    // Écouter tous les événements critiques
    this.client.on('channelCreate', (channel) => this.handleChannelCreate(channel));
    this.client.on('channelDelete', (channel) => this.handleChannelDelete(channel));
    this.client.on('guildBanAdd', (ban) => this.handleBan(ban));
    this.client.on('guildMemberRemove', (member) => this.handleKick(member));
    this.client.on('inviteCreate', (invite) => this.handleInviteCreate(invite));
    this.client.on('messageCreate', (message) => this.handleMessage(message));
    this.client.on('roleCreate', (role) => this.handleRoleCreate(role));
    this.client.on('roleDelete', (role) => this.handleRoleDelete(role));

    Logger.success('Système Anti-Raid activé');
  }

  trackAction(userId, actionType) {
    if (!this.activityTracker.has(userId)) {
      this.activityTracker.set(userId, { actions: [], timestamps: [] });
    }

    const userActivity = this.activityTracker.get(userId);
    const now = Date.now();

    // Nettoyer les actions anciennes (plus de 1 minute)
    userActivity.timestamps = userActivity.timestamps.filter(
      timestamp => now - timestamp < 60000
    );
    userActivity.actions = userActivity.actions.filter(
      (_, index) => userActivity.timestamps[index] >= now - 60000
    );

    userActivity.actions.push(actionType);
    userActivity.timestamps.push(now);

    return userActivity;
  }

  async handleChannelCreate(channel) {
    if (!channel.guild) return;
    
    const auditLogs = await channel.guild.fetchAuditLogs({
      limit: 1,
      type: 10 // CHANNEL_CREATE
    });

    const entry = auditLogs.entries.first();
    if (!entry || !entry.executor) return;

    const userActivity = this.trackAction(entry.executor.id, 'channelCreate');
    const count = userActivity.actions.filter(a => a === 'channelCreate').length;

    if (count > this.config.maxChannelsPerMinute) {
      await this.handleThreat(entry.executor, channel.guild, 'Création excessive de channels', count);
    }
  }

  async handleChannelDelete(channel) {
    if (!channel.guild) return;
    
    const auditLogs = await channel.guild.fetchAuditLogs({
      limit: 1,
      type: 11 // CHANNEL_DELETE
    });

    const entry = auditLogs.entries.first();
    if (!entry || !entry.executor) return;

    const userActivity = this.trackAction(entry.executor.id, 'channelDelete');
    const count = userActivity.actions.filter(a => a === 'channelDelete').length;

    if (count > this.config.maxChannelDeletionsPerMinute || 2) {
      await this.handleThreat(entry.executor, channel.guild, 'Suppression excessive de channels', count);
    }
  }

  async handleBan(ban) {
    const auditLogs = await ban.guild.fetchAuditLogs({
      limit: 1,
      type: 22 // MEMBER_BAN_ADD
    });

    const entry = auditLogs.entries.first();
    if (!entry || !entry.executor) return;

    const userActivity = this.trackAction(entry.executor.id, 'ban');
    const count = userActivity.actions.filter(a => a === 'ban').length;

    if (count > this.config.maxBansPerMinute) {
      await this.handleThreat(entry.executor, ban.guild, 'Bannissements excessifs', count);
    }
  }

  async handleKick(member) {
    const auditLogs = await member.guild.fetchAuditLogs({
      limit: 1,
      type: 20 // MEMBER_KICK
    });

    const entry = auditLogs.entries.first();
    if (!entry || !entry.executor) return;

    const userActivity = this.trackAction(entry.executor.id, 'kick');
    const count = userActivity.actions.filter(a => a === 'kick').length;

    if (count > this.config.maxKicksPerMinute) {
      await this.handleThreat(entry.executor, member.guild, 'Exclusions excessives', count);
    }
  }

  async handleInviteCreate(invite) {
    if (!invite.guild) return;

    const auditLogs = await invite.guild.fetchAuditLogs({
      limit: 1,
      type: 40 // INVITE_CREATE
    });

    const entry = auditLogs.entries.first();
    if (!entry || !entry.executor) return;

    const userActivity = this.trackAction(entry.executor.id, 'inviteCreate');
    const count = userActivity.actions.filter(a => a === 'inviteCreate').length;

    if (count > this.config.maxInvitesPerMinute) {
      await this.handleThreat(entry.executor, invite.guild, 'Création excessive d\'invitations', count);
    }
  }

  async handleMessage(message) {
    if (!message.guild || message.author.bot) return;

    // Vérifier les mentions massives
    const mentionCount = message.mentions.users.size + message.mentions.roles.size;
    if (mentionCount > this.config.maxMentionsPerMessage) {
      await message.delete().catch(() => {});
      await this.handleThreat(message.author, message.guild, 'Mentions massives', mentionCount);
      return;
    }

    // Vérifier le rate limit de messages
    const userActivity = this.trackAction(message.author.id, 'message');
    const messageCount = userActivity.actions.filter(a => a === 'message').length;

    if (messageCount > this.config.maxMessagesPerSecond * 10) { // Sur 10 secondes
      await this.handleThreat(message.author, message.guild, 'Spam de messages', messageCount);
    }
  }

  async handleRoleCreate(role) {
    if (!role.guild) return;

    const auditLogs = await role.guild.fetchAuditLogs({
      limit: 1,
      type: 30 // ROLE_CREATE
    });

    const entry = auditLogs.entries.first();
    if (!entry || !entry.executor) return;

    const userActivity = this.trackAction(entry.executor.id, 'roleCreate');
    const count = userActivity.actions.filter(a => a === 'roleCreate').length;

    if (count > this.config.maxRolesPerMinute) {
      await this.handleThreat(entry.executor, role.guild, 'Création excessive de rôles', count);
    }
  }

  async handleRoleDelete(role) {
    if (!role.guild) return;

    const auditLogs = await role.guild.fetchAuditLogs({
      limit: 1,
      type: 32 // ROLE_DELETE
    });

    const entry = auditLogs.entries.first();
    if (!entry || !entry.executor) return;

    const userActivity = this.trackAction(entry.executor.id, 'roleDelete');
    const count = userActivity.actions.filter(a => a === 'roleDelete').length;

    if (count > (this.config.maxRoleDeletionsPerMinute || 2)) {
      await this.handleThreat(entry.executor, role.guild, 'Suppression excessive de rôles', count);
    }
  }

  async handleThreat(user, guild, reason, count) {
    Logger.security(`⚠️  THREAT DETECTED: ${user.tag} (${user.id}) - ${reason} (${count} actions)`, 'high');

    try {
      // Envoyer une alerte dans le channel de log si configuré
      const logChannelId = this.config.logChannelId || this.client.config?.logChannelId;
      const logChannel = logChannelId ? this.client.channels.cache.get(logChannelId) : null;
      if (logChannel) {
        await logChannel.send({
          embeds: [{
            title: '🚨 Alerte Anti-Raid',
            description: `**Utilisateur suspect détecté**\n\n` +
                        `**Utilisateur:** ${user.tag} (${user.id})\n` +
                        `**Raison:** ${reason}\n` +
                        `**Nombre d'actions:** ${count}\n` +
                        `**Action prise:** ${this.config.actionOnDetection}`,
            color: 0xff0000,
            timestamp: new Date().toISOString()
          }]
        });
      }

      // Prendre l'action configurée
      const member = await guild.members.fetch(user.id).catch(() => null);
      if (!member) return;

      switch (this.config.actionOnDetection) {
        case 'ban':
          await member.ban({ reason: `Anti-Raid: ${reason}` }).catch(() => {});
          break;
        case 'kick':
          await member.kick(`Anti-Raid: ${reason}`).catch(() => {});
          break;
        case 'timeout':
          await member.timeout(3600000, `Anti-Raid: ${reason}`).catch(() => {}); // 1 heure
          break;
        case 'mute':
          // Retirer tous les rôles sauf @everyone et ajouter un rôle mute si disponible
          const muteRole = guild.roles.cache.find(r => r.name.toLowerCase() === 'muted');
          if (muteRole) {
            await member.roles.set([muteRole.id], `Anti-Raid: ${reason}`).catch(() => {});
          }
          break;
      }

      // Augmenter le niveau de suspicion
      const currentSuspicion = this.suspiciousUsers.get(user.id) || 0;
      this.suspiciousUsers.set(user.id, currentSuspicion + 1);

    } catch (error) {
      Logger.error(`Erreur lors de la gestion de la menace: ${error.message}`);
    }
  }

  getSuspicionLevel(userId) {
    return this.suspiciousUsers.get(userId) || 0;
  }
}

export default AntiRaidSystem;
