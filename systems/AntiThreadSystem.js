import Logger from '../utils/Logger.js';

class AntiThreadSystem {
  constructor(client, config) {
    this.client = client;
    this.config = config || {};
    this.threadTracker = new Map(); // userId -> { count: number, timestamps: [] }
  }

  init() {
    if (!this.config.enabled) return;

    this.client.on('threadCreate', (thread) => this.handleThreadCreate(thread));
    
    Logger.success('Système Anti-Thread activé');
  }

  async handleThreadCreate(thread) {
    if (!thread.guild) return;

    // Récupérer le créateur depuis les audit logs ou le message parent
    let creatorId = null;
    
    try {
      const auditLogs = await thread.guild.fetchAuditLogs({
        limit: 1,
        type: 110 // THREAD_CREATE
      });
      const entry = auditLogs.entries.first();
      creatorId = entry?.executor?.id;
    } catch {}

    // Si pas trouvé dans audit logs, chercher dans le message parent
    if (!creatorId && thread.parent) {
      try {
        const messages = await thread.parent.messages.fetch({ limit: 1 });
        const lastMessage = messages.first();
        if (lastMessage) {
          creatorId = lastMessage.author.id;
        }
      } catch {}
    }

    if (!creatorId) return;

    const now = Date.now();

    if (!this.threadTracker.has(creatorId)) {
      this.threadTracker.set(creatorId, { count: 0, timestamps: [] });
    }

    const tracker = this.threadTracker.get(creatorId);
    tracker.timestamps = tracker.timestamps.filter(t => now - t < 60000);
    tracker.timestamps.push(now);
    tracker.count = tracker.timestamps.length;

    if (tracker.count > (this.config.maxThreadsPerMinute || 3)) {
      await this.handleThreat(creatorId, thread.guild, 
        `Création excessive de threads (${tracker.count})`, tracker.count);
    }
  }

  async handleThreat(userId, guild, reason, count) {
    Logger.security(`🚨 THREAD THREAT: ${userId} - ${reason}`, 'high');

    try {
      const user = await this.client.users.fetch(userId).catch(() => null);
      if (!user) return;

      const member = await guild.members.fetch(userId).catch(() => null);
      if (!member) return;

      const logChannelId = this.config.logChannelId || this.client.config?.logChannelId;
      const logChannel = logChannelId ? this.client.channels.cache.get(logChannelId) : null;

      if (logChannel) {
        await logChannel.send({
          embeds: [{
            title: '🚨 Alerte Thread',
            description: `**Utilisateur:** ${user.tag} (${userId})\n` +
                        `**Raison:** ${reason}`,
            color: 0xff9900,
            timestamp: new Date().toISOString()
          }]
        });
      }

      if (this.config.actionOnDetection === 'ban') {
        await member.ban({ reason: `Anti-Thread: ${reason}` }).catch(() => {});
      } else {
        await member.timeout(1800000, `Anti-Thread: ${reason}`).catch(() => {});
      }
    } catch (error) {
      Logger.error(`Erreur Anti-Thread: ${error.message}`);
    }
  }
}

export default AntiThreadSystem;
