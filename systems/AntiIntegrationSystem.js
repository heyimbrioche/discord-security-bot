import Logger from '../utils/Logger.js';

class AntiIntegrationSystem {
  constructor(client, config) {
    this.client = client;
    this.config = config || {};
    this.integrationTracker = new Map(); // userId -> { count: number, timestamps: [] }
  }

  init() {
    if (!this.config.enabled) return;

    this.client.on('guildIntegrationsUpdate', (guild) => this.handleIntegrationUpdate(guild));
    
    Logger.success('Système Anti-Integration activé');
  }

  async handleIntegrationUpdate(guild) {
    const auditLogs = await guild.fetchAuditLogs({
      limit: 5,
      type: 80 // INTEGRATION_CREATE
    }).catch(() => null);

    if (!auditLogs) return;

    for (const entry of auditLogs.entries.values()) {
      if (!entry.executor) continue;

      const userId = entry.executor.id;
      const now = Date.now();

      if (!this.integrationTracker.has(userId)) {
        this.integrationTracker.set(userId, { count: 0, timestamps: [] });
      }

      const tracker = this.integrationTracker.get(userId);
      tracker.timestamps = tracker.timestamps.filter(t => now - t < 60000);
      tracker.timestamps.push(now);
      tracker.count = tracker.timestamps.length;

      if (tracker.count > (this.config.maxIntegrationsPerMinute || 2)) {
        await this.handleThreat(entry.executor, guild, 
          `Création excessive d'intégrations (${tracker.count})`, tracker.count);
      }

      // Vérifier les intégrations suspectes
      const integration = entry.changes?.find(c => c.key === 'application_id');
      if (integration) {
        await this.checkSuspiciousIntegration(guild, entry.executor, integration.new);
      }
    }
  }

  async checkSuspiciousIntegration(guild, user, applicationId) {
    // Vérifier si l'application est connue comme malveillante
    const suspiciousApps = this.config.suspiciousApplications || [];
    
    if (suspiciousApps.includes(applicationId)) {
      Logger.security(`🚨 Intégration suspecte détectée: ${applicationId}`, 'critical');
      
      try {
        // Supprimer l'intégration
        const integrations = await guild.fetchIntegrations();
        const integration = integrations.find(i => i.application?.id === applicationId);
        
        if (integration) {
          await integration.delete().catch(() => {});
        }

        const member = await guild.members.fetch(user.id).catch(() => null);
        if (member) {
          await member.ban({ reason: 'Intégration malveillante détectée' }).catch(() => {});
        }

        const logChannelId = this.config.logChannelId || this.client.config?.logChannelId;
        const logChannel = logChannelId ? this.client.channels.cache.get(logChannelId) : null;

        if (logChannel) {
          await logChannel.send({
            embeds: [{
              title: '🚨 Intégration Malveillante',
              description: `**Utilisateur:** ${user.tag} (${user.id})\n` +
                          `**Application:** ${applicationId}\n` +
                          `**Action:** Intégration supprimée, utilisateur banni`,
              color: 0xff0000,
              timestamp: new Date().toISOString()
            }]
          });
        }
      } catch (error) {
        Logger.error(`Erreur lors de la suppression d'intégration: ${error.message}`);
      }
    }
  }

  async handleThreat(user, guild, reason, count) {
    Logger.security(`🚨 INTEGRATION THREAT: ${user.tag} - ${reason}`, 'high');

    try {
      const member = await guild.members.fetch(user.id).catch(() => null);
      if (!member) return;

      const logChannelId = this.config.logChannelId || this.client.config?.logChannelId;
      const logChannel = logChannelId ? this.client.channels.cache.get(logChannelId) : null;

      if (logChannel) {
        await logChannel.send({
          embeds: [{
            title: '🚨 Alerte Intégration',
            description: `**Utilisateur:** ${user.tag} (${user.id})\n` +
                        `**Raison:** ${reason}`,
            color: 0xff9900,
            timestamp: new Date().toISOString()
          }]
        });
      }

      if (this.config.actionOnDetection === 'ban') {
        await member.ban({ reason: `Anti-Integration: ${reason}` }).catch(() => {});
      } else {
        await member.timeout(3600000, `Anti-Integration: ${reason}`).catch(() => {});
      }
    } catch (error) {
      Logger.error(`Erreur Anti-Integration: ${error.message}`);
    }
  }
}

export default AntiIntegrationSystem;
