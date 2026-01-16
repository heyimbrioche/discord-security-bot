import Logger from '../utils/Logger.js';

class RateLimitSystem {
  constructor(client, config) {
    this.client = client;
    this.config = config;
    this.userActions = new Map(); // userId -> { actions: [], timestamps: [] }
  }

  init() {
    if (!this.config.enabled) return;
    
    // Intercepter toutes les actions importantes
    this.client.on('messageCreate', (message) => this.trackAction(message.author.id, 'message'));
    this.client.on('channelCreate', () => this.trackGuildAction('channelCreate'));
    this.client.on('roleCreate', () => this.trackGuildAction('roleCreate'));
    
    Logger.success('Système de Rate Limiting activé');
  }

  async trackGuildAction(actionType) {
    // Récupérer l'utilisateur depuis les audit logs
    const guilds = this.client.guilds.cache;
    for (const guild of guilds.values()) {
      try {
        const auditLogs = await guild.fetchAuditLogs({ limit: 1 });
        const entry = auditLogs.entries.first();
        if (entry && entry.executor) {
          this.trackAction(entry.executor.id, actionType);
        }
      } catch {}
    }
  }

  trackAction(userId, actionType) {
    if (!this.userActions.has(userId)) {
      this.userActions.set(userId, { actions: [], timestamps: [] });
    }

    const userData = this.userActions.get(userId);
    const now = Date.now();

    // Nettoyer les actions anciennes
    userData.timestamps = userData.timestamps.filter(t => now - t < 60000);
    userData.actions = userData.actions.filter((_, i) => 
      userData.timestamps[i] >= now - 60000
    );

    userData.actions.push(actionType);
    userData.timestamps.push(now);

    // Vérifier le rate limit
    if (userData.actions.length > this.config.maxActionsPerUserPerMinute) {
      this.handleRateLimitExceeded(userId, userData.actions.length);
    }
  }

  async handleRateLimitExceeded(userId, actionCount) {
    Logger.security(`⚠️  RATE LIMIT EXCEEDED: ${userId} (${actionCount} actions/min)`, 'high');

    const user = this.client.users.cache.get(userId);
    if (!user) return;

    // Trouver tous les serveurs où l'utilisateur est présent
    const guilds = this.client.guilds.cache.filter(g => 
      g.members.cache.has(userId)
    );

    for (const guild of guilds.values()) {
      try {
        const member = await guild.members.fetch(userId);
        if (member) {
          // Timeout temporaire
          await member.timeout(300000, 'Rate limit dépassé').catch(() => {});
        }
      } catch {}
    }
  }

  getActionCount(userId) {
    const userData = this.userActions.get(userId);
    return userData?.actions.length || 0;
  }
}

export default RateLimitSystem;
