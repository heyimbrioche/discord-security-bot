import Logger from '../utils/Logger.js';

class AntiSelfbotSystem {
  constructor(client, config) {
    this.client = client;
    this.config = config || {};
    this.userActivity = new Map(); // userId -> { messages: [], patterns: [] }
  }

  init() {
    if (!this.config.enabled) return;

    this.client.on('messageCreate', (message) => this.analyzeMessage(message));
    
    Logger.success('Système Anti-Selfbot activé');
  }

  async analyzeMessage(message) {
    if (!message.guild || message.author.bot) return;

    const userId = message.author.id;
    const now = Date.now();

    if (!this.userActivity.has(userId)) {
      this.userActivity.set(userId, { messages: [], patterns: [] });
    }

    const activity = this.userActivity.get(userId);

    // Nettoyer les données anciennes (5 minutes)
    activity.messages = activity.messages.filter(m => now - m.timestamp < 300000);
    activity.patterns = activity.patterns.filter(p => now - p.timestamp < 300000);

    // Analyser le message
    const analysis = this.detectSelfbotPatterns(message, activity);

    if (analysis.isSelfbot) {
      await this.handleSelfbot(message, analysis.reason);
    }

    // Enregistrer le message
    activity.messages.push({
      content: message.content,
      timestamp: now,
      length: message.content.length,
      embeds: message.embeds.length,
      attachments: message.attachments.size
    });
  }

  detectSelfbotPatterns(message, activity) {
    const content = message.content;
    const recentMessages = activity.messages.slice(-10);

    // Pattern 1: Messages identiques avec timing parfait
    if (recentMessages.length >= 3) {
      const identical = recentMessages.filter(m => m.content === content);
      if (identical.length >= 2) {
        // Vérifier le timing (intervalles réguliers)
        const intervals = [];
        for (let i = 1; i < recentMessages.length; i++) {
          intervals.push(recentMessages[i].timestamp - recentMessages[i-1].timestamp);
        }
        const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        const variance = intervals.reduce((sum, val) => sum + Math.pow(val - avgInterval, 2), 0) / intervals.length;
        
        if (variance < 1000) { // Très régulier (< 1 seconde de variance)
          return { isSelfbot: true, reason: 'Timing trop régulier (pattern de bot)' };
        }
      }
    }

    // Pattern 2: Messages avec exactement la même longueur
    if (recentMessages.length >= 5) {
      const lengths = recentMessages.map(m => m.length);
      const allSameLength = lengths.every(len => len === lengths[0] && len > 0);
      if (allSameLength) {
        return { isSelfbot: true, reason: 'Messages de longueur identique (pattern suspect)' };
      }
    }

    // Pattern 3: Pas d'embeds/attachments mais structure similaire
    if (recentMessages.length >= 4) {
      const hasEmbeds = recentMessages.some(m => m.embeds > 0);
      const hasAttachments = recentMessages.some(m => m.attachments > 0);
      if (!hasEmbeds && !hasAttachments && content.length > 50) {
        const similarStructure = recentMessages.filter(m => 
          Math.abs(m.length - content.length) < 5
        ).length >= 3;
        if (similarStructure) {
          return { isSelfbot: true, reason: 'Structure de messages suspecte' };
        }
      }
    }

    // Pattern 4: Messages trop rapides (impossible pour un humain)
    if (recentMessages.length >= 2) {
      const lastMessage = recentMessages[recentMessages.length - 1];
      const timeDiff = Date.now() - lastMessage.timestamp;
      if (timeDiff < 100 && content.length > 20) { // < 100ms entre messages
        return { isSelfbot: true, reason: 'Messages trop rapides (impossible pour un humain)' };
      }
    }

    // Pattern 5: Pas de variation dans les caractères (trop parfait)
    if (content.length > 30) {
      const charVariation = new Set(content.split('')).size / content.length;
      if (charVariation < 0.3 && recentMessages.length >= 3) {
        return { isSelfbot: true, reason: 'Manque de variation dans les caractères' };
      }
    }

    return { isSelfbot: false, reason: null };
  }

  async handleSelfbot(message, reason) {
    Logger.security(`🚨 SELFBOT DETECTED: ${message.author.tag} - ${reason}`, 'critical');

    try {
      await message.delete().catch(() => {});

      const logChannelId = this.config.logChannelId || this.client.config?.logChannelId;
      const logChannel = logChannelId ? this.client.channels.cache.get(logChannelId) : null;

      if (logChannel) {
        await logChannel.send({
          embeds: [{
            title: '🚨 Selfbot Détecté',
            description: `**Utilisateur:** ${message.author.tag} (${message.author.id})\n` +
                        `**Raison:** ${reason}\n` +
                        `**Channel:** ${message.channel}`,
            color: 0xff0000,
            timestamp: new Date().toISOString()
          }]
        });
      }

      const member = message.member;
      if (!member) return;

      if (this.config.actionOnDetection === 'ban') {
        await member.ban({ reason: `Selfbot détecté: ${reason}` }).catch(() => {});
      } else {
        await member.timeout(86400000, `Selfbot détecté: ${reason}`).catch(() => {});
      }
    } catch (error) {
      Logger.error(`Erreur Anti-Selfbot: ${error.message}`);
    }
  }
}

export default AntiSelfbotSystem;
