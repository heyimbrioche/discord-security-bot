import Logger from '../utils/Logger.js';

class AntiPhishingSystem {
  constructor(client, config) {
    this.client = client;
    this.config = config;
    this.suspiciousDomains = new Set([
      'discord-nitro.com', 'discord-gift.com', 'discordapp-gifts.com',
      'discordnitro.com', 'discordgift.site', 'discord-app.com',
      'steamcommunity.com-gift.com', 'steamgift.com',
      'discord-nitro-gift.com', 'discordnitro.gift', 'discord-gifts.com',
      'discord-nitro-free.com', 'nitro-discord.com', 'discordsteam.com',
      'discord-nitro.xyz', 'discord-nitro.fun', 'discord-nitro.ru',
      'discord-nitro.club', 'discord-nitro.top', 'discord-nitro.ml',
      'free-nitro.com', 'nitro-free.com', 'discord-nitro-generator.com'
    ]);
    this.trustedDomains = new Set(['discord.com', 'discordapp.com', 'discord.gg']);
  }

  init() {
    if (!this.config.enabled) return;
    this.client.on('messageCreate', (message) => this.handleMessage(message));
    Logger.success('Système Anti-Phishing activé');
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
    
    // Vérifier les domaines suspects connus
    if (this.suspiciousDomains.has(domain.toLowerCase())) return true;
    
    // Vérifier les typosquatting (ex: disc0rd.com)
    const suspiciousPatterns = [
      /discord[^a-z]/i, /discordapp[^a-z]/i,
      /steam[^a-z]/i, /nitro[^a-z]/i
    ];
    
    return suspiciousPatterns.some(pattern => pattern.test(domain));
  }

  async handleMessage(message) {
    if (!message.guild || message.author.bot) return;

    const linkPattern = /(https?:\/\/[^\s]+)/g;
    const links = message.content.match(linkPattern);
    
    if (!links) return;

    for (const link of links) {
      const domain = this.extractDomain(link);
      
      if (this.isSuspiciousDomain(domain)) {
        await this.handlePhishing(message, link, domain);
        return;
      }
    }
  }

  async handlePhishing(message, link, domain) {
    Logger.security(`🚨 PHISHING DETECTED: ${message.author.tag} - ${domain}`, 'critical');

    try {
      await message.delete().catch(() => {});

      const logChannelId = this.config.logChannelId || this.client.config?.logChannelId;
      const logChannel = logChannelId ? this.client.channels.cache.get(logChannelId) : null;
      if (logChannel) {
        await logChannel.send({
          embeds: [{
            title: '🚨 Alerte Phishing',
            description: `**Utilisateur:** ${message.author.tag} (${message.author.id})\n` +
                        `**Lien suspect:** ${link}\n` +
                        `**Domaine:** ${domain}\n` +
                        `**Channel:** ${message.channel}`,
            color: 0xff0000,
            timestamp: new Date().toISOString()
          }]
        });
      }

      if (this.config.actionOnDetection === 'ban') {
        await message.member?.ban({ reason: 'Tentative de phishing' }).catch(() => {});
      } else if (this.config.actionOnDetection === 'timeout') {
        await message.member?.timeout(86400000, 'Tentative de phishing').catch(() => {});
      }

    } catch (error) {
      Logger.error(`Erreur Anti-Phishing: ${error.message}`);
    }
  }
}

export default AntiPhishingSystem;
