import Logger from '../utils/Logger.js';

class AntiTokenGrabberSystem {
  constructor(client, config) {
    this.client = client;
    this.config = config || {};
    this.tokenPatterns = [
      /[MN][A-Za-z\d]{23}\.[A-Za-z\d-_]{6}\.[A-Za-z\d-_]{27}/, // Token Discord
      /mfa\.[A-Za-z\d-_]{84}/, // MFA Token
      /[A-Za-z\d]{24}\.[A-Za-z\d-_]{6}\.[A-Za-z\d-_]{27}/ // Alternative pattern
    ];
    this.suspiciousKeywords = [
      'token', 'stealer', 'grabber', 'logger', 'discord token',
      'get token', 'token generator', 'free nitro token'
    ];
  }

  init() {
    if (!this.config.enabled) return;

    this.client.on('messageCreate', (message) => this.handleMessage(message));
    this.client.on('messageUpdate', (oldMessage, newMessage) => 
      this.handleMessageUpdate(oldMessage, newMessage));
    
    Logger.success('Système Anti-Token Grabber activé');
  }

  async handleMessage(message) {
    if (!message.guild || message.author.bot) return;

    const content = message.content.toLowerCase();

    // Vérifier les patterns de token
    for (const pattern of this.tokenPatterns) {
      if (pattern.test(message.content)) {
        await this.handleTokenDetected(message, 'Token Discord détecté dans le message');
        return;
      }
    }

    // Vérifier les mots-clés suspects
    if (this.suspiciousKeywords.some(keyword => content.includes(keyword))) {
      // Vérifier si c'est accompagné d'un lien
      const linkPattern = /(https?:\/\/[^\s]+)/g;
      const links = message.content.match(linkPattern);
      
      if (links && links.length > 0) {
        await this.handleTokenGrabber(message, links[0]);
        return;
      }
    }

    // Vérifier les liens suspects de token grabber
    const linkPattern = /(https?:\/\/[^\s]+)/g;
    const links = message.content.match(linkPattern);
    
    if (links) {
      for (const link of links) {
        if (this.isTokenGrabberLink(link)) {
          await this.handleTokenGrabber(message, link);
          return;
        }
      }
    }
  }

  async handleMessageUpdate(oldMessage, newMessage) {
    // Vérifier si un lien a été ajouté
    const oldLinks = (oldMessage.content || '').match(/(https?:\/\/[^\s]+)/g) || [];
    const newLinks = (newMessage.content || '').match(/(https?:\/\/[^\s]+)/g) || [];
    
    const addedLinks = newLinks.filter(link => !oldLinks.includes(link));
    for (const link of addedLinks) {
      if (this.isTokenGrabberLink(link)) {
        await this.handleTokenGrabber(newMessage, link);
      }
    }
  }

  isTokenGrabberLink(url) {
    const suspiciousDomains = [
      'discord-token', 'token-grabber', 'stealer', 'logger',
      'grab-token', 'get-token', 'discord-stealer'
    ];

    try {
      const domain = new URL(url).hostname.toLowerCase();
      return suspiciousDomains.some(suspicious => domain.includes(suspicious));
    } catch {
      return false;
    }
  }

  async handleTokenDetected(message, reason) {
    Logger.security(`🚨 TOKEN DETECTED: ${message.author.tag} - ${reason}`, 'critical');

    try {
      await message.delete().catch(() => {});

      const logChannelId = this.config.logChannelId || this.client.config?.logChannelId;
      const logChannel = logChannelId ? this.client.channels.cache.get(logChannelId) : null;

      if (logChannel) {
        await logChannel.send({
          embeds: [{
            title: '🚨 Token Discord Détecté',
            description: `**Utilisateur:** ${message.author.tag} (${message.author.id})\n` +
                        `**Raison:** ${reason}\n` +
                        `**Channel:** ${message.channel}\n` +
                        `**⚠️ Le message a été supprimé immédiatement**`,
            color: 0xff0000,
            timestamp: new Date().toISOString()
          }]
        });
      }

      const member = message.member;
      if (!member) return;

      await member.ban({ reason: 'Token Discord partagé' }).catch(() => {});
    } catch (error) {
      Logger.error(`Erreur Anti-Token: ${error.message}`);
    }
  }

  async handleTokenGrabber(message, link) {
    Logger.security(`🚨 TOKEN GRABBER DETECTED: ${message.author.tag} - ${link}`, 'critical');

    try {
      await message.delete().catch(() => {});

      const logChannelId = this.config.logChannelId || this.client.config?.logChannelId;
      const logChannel = logChannelId ? this.client.channels.cache.get(logChannelId) : null;

      if (logChannel) {
        await logChannel.send({
          embeds: [{
            title: '🚨 Token Grabber Détecté',
            description: `**Utilisateur:** ${message.author.tag} (${message.author.id})\n` +
                        `**Lien suspect:** ${link}\n` +
                        `**Channel:** ${message.channel}\n` +
                        `**⚠️ Ce lien peut voler les tokens Discord**`,
            color: 0xff0000,
            timestamp: new Date().toISOString()
          }]
        });
      }

      const member = message.member;
      if (!member) return;

      await member.ban({ reason: 'Tentative de token grabber' }).catch(() => {});
    } catch (error) {
      Logger.error(`Erreur Anti-Token Grabber: ${error.message}`);
    }
  }
}

export default AntiTokenGrabberSystem;
