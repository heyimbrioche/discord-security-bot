import Logger from '../utils/Logger.js';

class AntiReactionSpamSystem {
  constructor(client, config) {
    this.client = client;
    this.config = config || {};
    this.reactionTracker = new Map(); // userId -> { count: number, timestamps: [] }
  }

  init() {
    if (!this.config.enabled) return;

    this.client.on('messageReactionAdd', (reaction, user) => 
      this.handleReaction(reaction, user));
    
    Logger.success('Système Anti-Reaction Spam activé');
  }

  async handleReaction(reaction, user) {
    if (user.bot || !reaction.message.guild) return;

    const userId = user.id;
    const now = Date.now();

    if (!this.reactionTracker.has(userId)) {
      this.reactionTracker.set(userId, { count: 0, timestamps: [], messages: new Set() });
    }

    const tracker = this.reactionTracker.get(userId);
    
    // Nettoyer les réactions anciennes (10 secondes)
    tracker.timestamps = tracker.timestamps.filter(t => now - t < 10000);
    tracker.timestamps.push(now);
    tracker.count = tracker.timestamps.length;
    tracker.messages.add(reaction.message.id);

    // Vérifier le spam de réactions
    if (tracker.count > (this.config.maxReactionsPer10Seconds || 10)) {
      await this.handleReactionSpam(user, reaction.message.guild, tracker.count);
      return;
    }

    // Vérifier les réactions sur plusieurs messages (spam)
    if (tracker.messages.size > (this.config.maxMessagesPer10Seconds || 5)) {
      await this.handleReactionSpam(user, reaction.message.guild, tracker.messages.size);
      return;
    }
  }

  async handleReactionSpam(user, guild, count) {
    Logger.security(`🚨 REACTION SPAM: ${user.tag} - ${count} réactions`, 'high');

    try {
      const member = await guild.members.fetch(user.id).catch(() => null);
      if (!member) return;

      const logChannelId = this.config.logChannelId || this.client.config?.logChannelId;
      const logChannel = logChannelId ? this.client.channels.cache.get(logChannelId) : null;

      if (logChannel) {
        await logChannel.send({
          embeds: [{
            title: '🚨 Spam de Réactions',
            description: `**Utilisateur:** ${user.tag} (${user.id})\n` +
                        `**Nombre de réactions:** ${count}\n` +
                        `**Action:** ${this.config.actionOnDetection || 'timeout'}`,
            color: 0xff9900,
            timestamp: new Date().toISOString()
          }]
        });
      }

      if (this.config.actionOnDetection === 'ban') {
        await member.ban({ reason: 'Spam de réactions' }).catch(() => {});
      } else {
        await member.timeout(600000, 'Spam de réactions').catch(() => {});
      }
    } catch (error) {
      Logger.error(`Erreur Anti-Reaction Spam: ${error.message}`);
    }
  }
}

export default AntiReactionSpamSystem;
