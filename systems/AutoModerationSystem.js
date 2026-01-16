import Logger from '../utils/Logger.js';

class AutoModerationSystem {
  constructor(client, config) {
    this.client = client;
    this.config = config || {};
    this.badWords = new Set([
      // Mots interdits (peut être étendu)
      'spam', 'raid', 'nuke'
    ]);
  }

  init() {
    if (!this.config.enabled) return;
    
    this.client.on('messageCreate', (message) => this.handleMessage(message));
    this.client.on('messageUpdate', (oldMessage, newMessage) => 
      this.handleMessageUpdate(oldMessage, newMessage));
    
    Logger.success('Système d\'Auto-Modération activé');
  }

  async handleMessage(message) {
    if (!message.guild || message.author.bot) return;

    // Vérifier les mots interdits
    const content = message.content.toLowerCase();
    const foundBadWords = Array.from(this.badWords).filter(word => 
      content.includes(word.toLowerCase())
    );

    if (foundBadWords.length > 0 && this.config.deleteBadWords) {
      await message.delete().catch(() => {});
      Logger.security(`Message supprimé (mots interdits): ${message.author.tag}`);
    }

    // Vérifier les messages en majuscules (cris)
    if (message.content.length > 10) {
      const upperCaseRatio = (message.content.match(/[A-Z]/g) || []).length / message.content.length;
      if (upperCaseRatio > 0.7) {
        await message.delete().catch(() => {});
        await message.channel.send(`${message.author}, veuillez éviter d'écrire en majuscules.`).catch(() => {});
      }
    }
  }

  async handleMessageUpdate(oldMessage, newMessage) {
    // Détecter les éditions suspectes (ajout de liens, etc.)
    if (!newMessage.guild || newMessage.author.bot) return;

    const oldLinks = (oldMessage.content || '').match(/(https?:\/\/[^\s]+)/g) || [];
    const newLinks = (newMessage.content || '').match(/(https?:\/\/[^\s]+)/g) || [];

    if (newLinks.length > oldLinks.length) {
      // Un lien a été ajouté, vérifier s'il est suspect
      const addedLinks = newLinks.filter(link => !oldLinks.includes(link));
      for (const link of addedLinks) {
        const domain = new URL(link).hostname;
        if (this.isSuspiciousDomain(domain)) {
          await newMessage.delete().catch(() => {});
          Logger.security(`Lien suspect ajouté via édition: ${newMessage.author.tag}`);
        }
      }
    }
  }

  isSuspiciousDomain(domain) {
    const suspicious = [
      'discord-nitro.com', 'discord-gift.com', 'steamgift.com'
    ];
    return suspicious.some(s => domain.includes(s));
  }
}

export default AutoModerationSystem;
