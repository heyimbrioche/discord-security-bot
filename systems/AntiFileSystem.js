import Logger from '../utils/Logger.js';

class AntiFileSystem {
  constructor(client, config) {
    this.client = client;
    this.config = config || {};
    this.fileTracker = new Map(); // userId -> { files: [], timestamps: [] }
    this.dangerousExtensions = new Set([
      '.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js', '.jar',
      '.app', '.deb', '.pkg', '.dmg', '.msi', '.sh', '.ps1', '.py', '.php'
    ]);
  }

  init() {
    if (!this.config.enabled) return;

    this.client.on('messageCreate', (message) => this.handleFile(message));
    
    Logger.success('Système Anti-File activé');
  }

  async handleFile(message) {
    if (!message.guild || message.author.bot) return;
    if (message.attachments.size === 0) return;

    const userId = message.author.id;
    const now = Date.now();

    // Tracker les fichiers
    if (!this.fileTracker.has(userId)) {
      this.fileTracker.set(userId, { files: [], timestamps: [] });
    }

    const tracker = this.fileTracker.get(userId);
    tracker.timestamps = tracker.timestamps.filter(t => now - t < 60000);
    
    let hasDangerousFile = false;
    let totalSize = 0;

    for (const attachment of message.attachments.values()) {
      // Vérifier l'extension
      const extension = attachment.name?.split('.').pop()?.toLowerCase();
      if (extension && this.dangerousExtensions.has(`.${extension}`)) {
        hasDangerousFile = true;
        await this.handleDangerousFile(message, attachment, extension);
      }

      // Vérifier la taille
      totalSize += attachment.size || 0;
      
      tracker.files.push({
        name: attachment.name,
        size: attachment.size,
        extension: extension,
        timestamp: now
      });
      tracker.timestamps.push(now);
    }

    // Vérifier le spam de fichiers
    if (tracker.files.length > (this.config.maxFilesPerMinute || 5)) {
      await this.handleFileSpam(message, tracker.files.length);
      return;
    }

    // Vérifier la taille totale
    if (totalSize > (this.config.maxTotalSizePerMessage || 25 * 1024 * 1024)) { // 25MB
      await message.delete().catch(() => {});
      Logger.security(`Fichier trop volumineux: ${message.author.tag}`, 'high');
    }
  }

  async handleDangerousFile(message, attachment, extension) {
    Logger.security(`🚨 FICHIER DANGEREUX: ${message.author.tag} - ${extension}`, 'critical');

    try {
      await message.delete().catch(() => {});

      const logChannelId = this.config.logChannelId || this.client.config?.logChannelId;
      const logChannel = logChannelId ? this.client.channels.cache.get(logChannelId) : null;

      if (logChannel) {
        await logChannel.send({
          embeds: [{
            title: '🚨 Fichier Dangereux Détecté',
            description: `**Utilisateur:** ${message.author.tag} (${message.author.id})\n` +
                        `**Fichier:** ${attachment.name}\n` +
                        `**Extension:** ${extension}\n` +
                        `**Taille:** ${(attachment.size / 1024).toFixed(2)} KB\n` +
                        `**Channel:** ${message.channel}`,
            color: 0xff0000,
            timestamp: new Date().toISOString()
          }]
        });
      }

      const member = message.member;
      if (!member) return;

      if (this.config.actionOnDangerousFile === 'ban') {
        await member.ban({ reason: `Fichier dangereux: ${extension}` }).catch(() => {});
      } else {
        await member.timeout(86400000, `Fichier dangereux: ${extension}`).catch(() => {});
      }
    } catch (error) {
      Logger.error(`Erreur Anti-File: ${error.message}`);
    }
  }

  async handleFileSpam(message, count) {
    Logger.security(`🚨 SPAM DE FICHIERS: ${message.author.tag} - ${count} fichiers`, 'high');

    try {
      await message.delete().catch(() => {});

      const member = message.member;
      if (!member) return;

      await member.timeout(1800000, 'Spam de fichiers').catch(() => {});
    } catch (error) {
      Logger.error(`Erreur Anti-File Spam: ${error.message}`);
    }
  }
}

export default AntiFileSystem;
