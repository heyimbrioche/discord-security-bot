import Logger from '../utils/Logger.js';

class AntiEmbedAbuseSystem {
  constructor(client, config) {
    this.client = client;
    this.config = config || {};
    this.embedTracker = new Map(); // userId -> { count: number, timestamps: [] }
  }

  init() {
    if (!this.config.enabled) return;

    this.client.on('messageCreate', (message) => this.handleMessage(message));
    
    Logger.success('Système Anti-Embed Abuse activé');
  }

  async handleMessage(message) {
    if (!message.guild || message.author.bot) return;
    if (message.embeds.length === 0) return;

    const userId = message.author.id;
    const now = Date.now();

    if (!this.embedTracker.has(userId)) {
      this.embedTracker.set(userId, { count: 0, timestamps: [] });
    }

    const tracker = this.embedTracker.get(userId);
    tracker.timestamps = tracker.timestamps.filter(t => now - t < 60000);
    tracker.timestamps.push(now);
    tracker.count = tracker.timestamps.length;

    // Vérifier le nombre d'embeds par message
    if (message.embeds.length > (this.config.maxEmbedsPerMessage || 3)) {
      await message.delete().catch(() => {});
      Logger.security(`Trop d'embeds dans un message: ${message.author.tag}`, 'high');
      return;
    }

    // Vérifier le spam d'embeds
    if (tracker.count > (this.config.maxEmbedsPerMinute || 5)) {
      await this.handleEmbedSpam(message, tracker.count);
    }

    // Vérifier les embeds suspects (liens de phishing, etc.)
    for (const embed of message.embeds) {
      if (embed.url) {
        const domain = this.extractDomain(embed.url);
        if (this.isSuspiciousDomain(domain)) {
          await this.handleSuspiciousEmbed(message, embed, domain);
        }
      }
    }
  }

  extractDomain(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace('www.', '');
    } catch {
      return null;
    }
  }

  isSuspiciousDomain(domain) {
    if (!domain) return false;
    
    const suspicious = [
      'discord-nitro.com', 'discord-gift.com', 'discordapp-gifts.com',
      'steamgift.com', 'free-nitro.com'
    ];
    
    return suspicious.some(s => domain.includes(s));
  }

  async handleEmbedSpam(message, count) {
    Logger.security(`🚨 EMBED SPAM: ${message.author.tag} - ${count} embeds`, 'high');

    try {
      await message.delete().catch(() => {});

      const member = message.member;
      if (!member) return;

      await member.timeout(1800000, 'Spam d\'embeds').catch(() => {});
    } catch (error) {
      Logger.error(`Erreur Anti-Embed Spam: ${error.message}`);
    }
  }

  async handleSuspiciousEmbed(message, embed, domain) {
    Logger.security(`🚨 EMBED SUSPECT: ${message.author.tag} - ${domain}`, 'critical');

    try {
      await message.delete().catch(() => {});

      const logChannelId = this.config.logChannelId || this.client.config?.logChannelId;
      const logChannel = logChannelId ? this.client.channels.cache.get(logChannelId) : null;

      if (logChannel) {
        await logChannel.send({
          embeds: [{
            title: '🚨 Embed Suspect Détecté',
            description: `**Utilisateur:** ${message.author.tag} (${message.author.id})\n` +
                        `**Domaine:** ${domain}\n` +
                        `**URL:** ${embed.url}\n` +
                        `**Channel:** ${message.channel}`,
            color: 0xff0000,
            timestamp: new Date().toISOString()
          }]
        });
      }

      const member = message.member;
      if (!member) return;

      if (this.config.actionOnSuspiciousEmbed === 'ban') {
        await member.ban({ reason: `Embed suspect: ${domain}` }).catch(() => {});
      } else {
        await member.timeout(86400000, `Embed suspect: ${domain}`).catch(() => {});
      }
    } catch (error) {
      Logger.error(`Erreur Anti-Embed Suspect: ${error.message}`);
    }
  }
}

export default AntiEmbedAbuseSystem;
