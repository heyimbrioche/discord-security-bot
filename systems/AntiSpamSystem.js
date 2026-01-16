import Logger from '../utils/Logger.js';

class AntiSpamSystem {
  constructor(client, config) {
    this.client = client;
    this.config = config;
    this.messageHistory = new Map(); // userId -> { messages: [], timestamps: [] }
    this.similarMessageTracker = new Map(); // userId -> { lastMessages: [] }
  }

  init() {
    if (!this.config.enabled) return;

    this.client.on('messageCreate', (message) => this.handleMessage(message));
    Logger.success('Système Anti-Spam activé');
  }

  calculateSimilarity(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }

  levenshteinDistance(str1, str2) {
    const matrix = [];
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    return matrix[str2.length][str1.length];
  }

  async handleMessage(message) {
    if (!message.guild || message.author.bot || message.member?.permissions.has('Administrator')) return;

    const userId = message.author.id;
    const now = Date.now();
    const timeWindow = 10000; // 10 secondes

    // Initialiser le tracker si nécessaire
    if (!this.messageHistory.has(userId)) {
      this.messageHistory.set(userId, { messages: [], timestamps: [] });
    }

    const history = this.messageHistory.get(userId);

    // Nettoyer les messages anciens
    history.messages = history.messages.filter((_, index) => 
      now - history.timestamps[index] < timeWindow
    );
    history.timestamps = history.timestamps.filter(timestamp => 
      now - timestamp < timeWindow
    );

    // Ajouter le nouveau message
    history.messages.push(message.content);
    history.timestamps.push(now);

    // Vérifier le nombre de messages
    if (history.messages.length > this.config.maxMessagesPer10Seconds) {
      await this.handleSpam(message, 'Trop de messages en peu de temps', history.messages.length);
      return;
    }

    // Vérifier les messages similaires
    if (!this.similarMessageTracker.has(userId)) {
      this.similarMessageTracker.set(userId, { lastMessages: [] });
    }

    const similarTracker = this.similarMessageTracker.get(userId);
    similarTracker.lastMessages.push({
      content: message.content,
      timestamp: now
    });

    // Garder seulement les 5 derniers messages
    if (similarTracker.lastMessages.length > 5) {
      similarTracker.lastMessages.shift();
    }

    // Vérifier la similarité
    if (similarTracker.lastMessages.length >= this.config.maxSimilarMessages) {
      const recentMessages = similarTracker.lastMessages.slice(-this.config.maxSimilarMessages);
      let similarCount = 0;

      for (let i = 0; i < recentMessages.length - 1; i++) {
        for (let j = i + 1; j < recentMessages.length; j++) {
          const similarity = this.calculateSimilarity(
            recentMessages[i].content,
            recentMessages[j].content
          );
          if (similarity > 0.8) { // 80% de similarité
            similarCount++;
          }
        }
      }

      if (similarCount >= this.config.maxSimilarMessages - 1) {
        await this.handleSpam(message, 'Messages répétitifs détectés', similarCount);
        return;
      }
    }

    // Vérifier les caractères répétitifs (ex: "aaaaaaaa")
    if (message.content.length > 10) {
      const repeatedPattern = /(.)\1{9,}/.test(message.content);
      if (repeatedPattern) {
        await this.handleSpam(message, 'Caractères répétitifs détectés', 0);
        return;
      }
    }

    // Vérifier les liens multiples
    const linkPattern = /(https?:\/\/[^\s]+)/g;
    const links = message.content.match(linkPattern);
    if (links && links.length > 3) {
      await this.handleSpam(message, 'Trop de liens dans un message', links.length);
      return;
    }
  }

  async handleSpam(message, reason, count) {
    Logger.security(`⚠️  SPAM DETECTED: ${message.author.tag} - ${reason}`, 'high');

    try {
      // Supprimer le message
      await message.delete().catch(() => {});

      // Envoyer une alerte
      const logChannelId = this.config.logChannelId || this.client.config?.logChannelId;
      const logChannel = logChannelId ? this.client.channels.cache.get(logChannelId) : null;
      if (logChannel) {
        await logChannel.send({
          embeds: [{
            title: '🚨 Alerte Anti-Spam',
            description: `**Utilisateur:** ${message.author.tag} (${message.author.id})\n` +
                        `**Raison:** ${reason}\n` +
                        `**Channel:** ${message.channel}\n` +
                        `**Action:** ${this.config.actionOnDetection}`,
            color: 0xff9900,
            timestamp: new Date().toISOString()
          }]
        });
      }

      // Prendre l'action configurée
      const member = message.member;
      if (!member) return;

      switch (this.config.actionOnDetection) {
        case 'mute':
          await member.timeout(1800000, `Anti-Spam: ${reason}`).catch(() => {}); // 30 minutes
          break;
        case 'warn':
          // Envoyer un avertissement en DM
          try {
            await message.author.send({
              embeds: [{
                title: '⚠️ Avertissement Anti-Spam',
                description: `Vous avez été averti pour spam sur ${message.guild.name}.\n` +
                            `**Raison:** ${reason}\n\n` +
                            `Veuillez respecter les règles du serveur.`,
                color: 0xff9900
              }]
            });
          } catch {}
          break;
        case 'kick':
          await member.kick(`Anti-Spam: ${reason}`).catch(() => {});
          break;
      }

    } catch (error) {
      Logger.error(`Erreur lors de la gestion du spam: ${error.message}`);
    }
  }
}

export default AntiSpamSystem;
