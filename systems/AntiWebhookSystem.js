import Logger from '../utils/Logger.js';

class AntiWebhookSystem {
  constructor(client, config) {
    this.client = client;
    this.config = config || {};
    this.webhookTracker = new Map(); // userId -> { count: number, timestamps: [] }
  }

  init() {
    if (!this.config.enabled) return;

    this.client.on('webhookUpdate', (channel) => this.handleWebhookUpdate(channel));
    this.client.on('messageCreate', (message) => this.handleWebhookMessage(message));
    
    Logger.success('Système Anti-Webhook activé');
  }

  async handleWebhookUpdate(channel) {
    if (!channel.guild) return;

    const auditLogs = await channel.guild.fetchAuditLogs({
      limit: 1,
      type: 50 // WEBHOOK_CREATE
    }).catch(() => null);

    if (!auditLogs) return;
    const entry = auditLogs.entries.first();
    if (!entry || !entry.executor) return;

    const userId = entry.executor.id;
    const now = Date.now();

    if (!this.webhookTracker.has(userId)) {
      this.webhookTracker.set(userId, { count: 0, timestamps: [] });
    }

    const tracker = this.webhookTracker.get(userId);
    tracker.timestamps = tracker.timestamps.filter(t => now - t < 60000);
    tracker.timestamps.push(now);
    tracker.count = tracker.timestamps.length;

    if (tracker.count > (this.config.maxWebhooksPerMinute || 3)) {
      await this.handleThreat(entry.executor, channel.guild, 
        `Création excessive de webhooks (${tracker.count})`, tracker.count);
    }
  }

  async handleWebhookMessage(message) {
    if (!message.webhookId || !message.guild) return;

    // Détecter les messages de webhook suspects (spam, liens, etc.)
    const linkPattern = /(https?:\/\/[^\s]+)/g;
    const links = message.content.match(linkPattern) || [];
    
    if (links.length > 2) {
      await message.delete().catch(() => {});
      Logger.security(`Webhook suspect supprimé: ${message.webhookId}`, 'high');
    }

    // Vérifier le spam de webhooks
    const webhookId = message.webhookId;
    const now = Date.now();
    const key = `webhook_${webhookId}`;

    if (!this.webhookTracker.has(key)) {
      this.webhookTracker.set(key, { count: 0, timestamps: [] });
    }

    const tracker = this.webhookTracker.get(key);
    tracker.timestamps = tracker.timestamps.filter(t => now - t < 10000);
    tracker.timestamps.push(now);
    tracker.count = tracker.timestamps.length;

    if (tracker.count > (this.config.maxWebhookMessagesPer10Seconds || 5)) {
      await message.delete().catch(() => {});
      // Supprimer le webhook
      const webhook = await message.channel.fetchWebhooks().then(whs => 
        whs.find(w => w.id === webhookId)
      ).catch(() => null);
      
      if (webhook) {
        await webhook.delete('Spam détecté').catch(() => {});
        Logger.security(`Webhook spam supprimé: ${webhookId}`, 'high');
      }
    }
  }

  async handleThreat(user, guild, reason, count) {
    Logger.security(`🚨 WEBHOOK THREAT: ${user.tag} - ${reason}`, 'high');

    try {
      const member = await guild.members.fetch(user.id).catch(() => null);
      if (!member) return;

      const logChannelId = this.config.logChannelId || this.client.config?.logChannelId;
      const logChannel = logChannelId ? this.client.channels.cache.get(logChannelId) : null;

      if (logChannel) {
        await logChannel.send({
          embeds: [{
            title: '🚨 Alerte Webhook',
            description: `**Utilisateur:** ${user.tag} (${user.id})\n` +
                        `**Raison:** ${reason}\n` +
                        `**Action:** ${this.config.actionOnDetection || 'timeout'}`,
            color: 0xff0000,
            timestamp: new Date().toISOString()
          }]
        });
      }

      if (this.config.actionOnDetection === 'ban') {
        await member.ban({ reason: `Anti-Webhook: ${reason}` }).catch(() => {});
      } else {
        await member.timeout(3600000, `Anti-Webhook: ${reason}`).catch(() => {});
      }
    } catch (error) {
      Logger.error(`Erreur Anti-Webhook: ${error.message}`);
    }
  }
}

export default AntiWebhookSystem;
