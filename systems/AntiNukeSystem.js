import Logger from '../utils/Logger.js';

class AntiNukeSystem {
  constructor(client, config) {
    this.client = client;
    this.config = config;
    this.activityTracker = new Map();
  }

  init() {
    if (!this.config.enabled) return;
    
    this.client.on('channelUpdate', (oldChannel, newChannel) => 
      this.handleChannelUpdate(oldChannel, newChannel));
    this.client.on('roleUpdate', (oldRole, newRole) => 
      this.handleRoleUpdate(oldRole, newRole));
    this.client.on('guildUpdate', (oldGuild, newGuild) => 
      this.handleGuildUpdate(oldGuild, newGuild));
    
    Logger.success('Système Anti-Nuke activé');
  }

  trackAction(userId, actionType) {
    if (!this.activityTracker.has(userId)) {
      this.activityTracker.set(userId, []);
    }
    const now = Date.now();
    const actions = this.activityTracker.get(userId);
    actions.push({ type: actionType, timestamp: now });
    
    // Nettoyer les actions anciennes
    this.activityTracker.set(userId, 
      actions.filter(a => now - a.timestamp < 60000)
    );
  }

  async handleChannelUpdate(oldChannel, newChannel) {
    if (!newChannel.guild) return;
    
    const auditLogs = await newChannel.guild.fetchAuditLogs({
      limit: 1,
      type: 11
    });

    const entry = auditLogs.entries.first();
    if (!entry || !entry.executor) return;

    // Vérifier les changements de permissions suspects
    if (oldChannel.permissionOverwrites.cache.size !== 
        newChannel.permissionOverwrites.cache.size) {
      this.trackAction(entry.executor.id, 'permissionChange');
      const count = this.activityTracker.get(entry.executor.id)
        .filter(a => a.type === 'permissionChange').length;

      if (count > this.config.maxPermissionChangesPerMinute) {
        await this.handleThreat(entry.executor, newChannel.guild, 
          'Changements de permissions suspects', count);
      }
    }
  }

  async handleRoleUpdate(oldRole, newRole) {
    if (!newRole.guild) return;

    const auditLogs = await newRole.guild.fetchAuditLogs({
      limit: 1,
      type: 31
    });

    const entry = auditLogs.entries.first();
    if (!entry || !entry.executor) return;

    // Vérifier les changements de permissions dangereux
    const dangerousPerms = ['Administrator', 'ManageGuild', 'ManageChannels'];
    const oldPerms = oldRole.permissions.toArray();
    const newPerms = newRole.permissions.toArray();
    
    const addedDangerous = newPerms.filter(p => 
      dangerousPerms.includes(p) && !oldPerms.includes(p)
    );

    if (addedDangerous.length > 0) {
      await this.handleThreat(entry.executor, newRole.guild,
        `Ajout de permissions dangereuses: ${addedDangerous.join(', ')}`, 1);
    }
  }

  async handleGuildUpdate(oldGuild, newGuild) {
    const auditLogs = await newGuild.fetchAuditLogs({
      limit: 1,
      type: 1
    });

    const entry = auditLogs.entries.first();
    if (!entry || !entry.executor) return;

    // Vérifier les changements critiques du serveur
    if (oldGuild.name !== newGuild.name || 
        oldGuild.icon !== newGuild.icon ||
        oldGuild.verificationLevel !== newGuild.verificationLevel) {
      await this.handleThreat(entry.executor, newGuild,
        'Modification critique du serveur', 1);
    }
  }

  async handleThreat(user, guild, reason, count) {
    Logger.security(`🚨 NUKE ATTEMPT: ${user.tag} - ${reason}`, 'critical');

    try {
      const member = await guild.members.fetch(user.id).catch(() => null);
      if (!member) return;

      // Bannir immédiatement
      await member.ban({ reason: `Anti-Nuke: ${reason}` }).catch(() => {});

      const logChannelId = this.config.logChannelId || this.client.config?.logChannelId;
      const logChannel = logChannelId ? this.client.channels.cache.get(logChannelId) : null;
      if (logChannel) {
        await logChannel.send({
          embeds: [{
            title: '🚨 TENTATIVE DE NUKE DÉTECTÉE',
            description: `**Utilisateur:** ${user.tag} (${user.id})\n` +
                        `**Raison:** ${reason}\n` +
                        `**Action:** Bannissement immédiat`,
            color: 0xff0000,
            timestamp: new Date().toISOString()
          }]
        });
      }
    } catch (error) {
      Logger.error(`Erreur Anti-Nuke: ${error.message}`);
    }
  }
}

export default AntiNukeSystem;
