import Logger from '../utils/Logger.js';

class AntiEmojiSystem {
  constructor(client, config) {
    this.client = client;
    this.config = config || {};
    this.emojiTracker = new Map(); // userId -> { count: number, timestamps: [] }
  }

  init() {
    if (!this.config.enabled) return;

    this.client.on('emojiCreate', (emoji) => this.handleEmojiCreate(emoji));
    this.client.on('messageCreate', (message) => this.handleEmojiSpam(message));
    
    Logger.success('Système Anti-Emoji activé');
  }

  async handleEmojiCreate(emoji) {
    if (!emoji.guild) return;

    const auditLogs = await emoji.guild.fetchAuditLogs({
      limit: 1,
      type: 60 // EMOJI_CREATE
    }).catch(() => null);

    if (!auditLogs) return;
    const entry = auditLogs.entries.first();
    if (!entry || !entry.executor) return;

    const userId = entry.executor.id;
    const now = Date.now();

    if (!this.emojiTracker.has(userId)) {
      this.emojiTracker.set(userId, { count: 0, timestamps: [] });
    }

    const tracker = this.emojiTracker.get(userId);
    tracker.timestamps = tracker.timestamps.filter(t => now - t < 60000);
    tracker.timestamps.push(now);
    tracker.count = tracker.timestamps.length;

    if (tracker.count > (this.config.maxEmojisPerMinute || 5)) {
      await this.handleThreat(entry.executor, emoji.guild, 
        `Création excessive d'emojis (${tracker.count})`, tracker.count);
    }
  }

  async handleEmojiSpam(message) {
    if (!message.guild || message.author.bot) return;

    // Compter les emojis dans le message
    const emojiPattern = /<a?:[\w]+:\d+>|[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;
    const emojis = message.content.match(emojiPattern) || [];
    
    if (emojis.length > (this.config.maxEmojisPerMessage || 10)) {
      await message.delete().catch(() => {});
      Logger.security(`Spam d'emojis détecté: ${message.author.tag}`, 'high');
      
      const member = message.member;
      if (member && this.config.actionOnDetection === 'timeout') {
        await member.timeout(600000, 'Spam d\'emojis').catch(() => {});
      }
    }
  }

  async handleThreat(user, guild, reason, count) {
    Logger.security(`🚨 EMOJI THREAT: ${user.tag} - ${reason}`, 'high');

    try {
      const member = await guild.members.fetch(user.id).catch(() => null);
      if (!member) return;

      const logChannelId = this.config.logChannelId || this.client.config?.logChannelId;
      const logChannel = logChannelId ? this.client.channels.cache.get(logChannelId) : null;

      if (logChannel) {
        await logChannel.send({
          embeds: [{
            title: '🚨 Alerte Emoji',
            description: `**Utilisateur:** ${user.tag} (${user.id})\n` +
                        `**Raison:** ${reason}`,
            color: 0xff9900,
            timestamp: new Date().toISOString()
          }]
        });
      }

      if (this.config.actionOnDetection === 'ban') {
        await member.ban({ reason: `Anti-Emoji: ${reason}` }).catch(() => {});
      } else {
        await member.timeout(1800000, `Anti-Emoji: ${reason}`).catch(() => {});
      }
    } catch (error) {
      Logger.error(`Erreur Anti-Emoji: ${error.message}`);
    }
  }
}

export default AntiEmojiSystem;
