import Logger from '../utils/Logger.js';

class WhitelistBlacklistSystem {
  constructor(client, config) {
    this.client = client;
    this.config = config || {};
    this.whitelist = new Set(config.whitelist || []);
    this.blacklist = new Set(config.blacklist || []);
  }

  init() {
    if (!this.config.enabled) return;

    this.client.on('guildMemberAdd', (member) => this.handleMemberJoin(member));
    this.client.on('messageCreate', (message) => this.handleMessage(message));
    
    Logger.success('Système Whitelist/Blacklist activé');
  }

  async handleMemberJoin(member) {
    // Vérifier la blacklist
    if (this.blacklist.has(member.user.id)) {
      Logger.security(`🚨 Utilisateur blacklisté rejoint: ${member.user.tag}`, 'high');
      
      try {
        await member.ban({ reason: 'Utilisateur sur la blacklist' });
        
        const logChannelId = this.config.logChannelId || this.client.config?.logChannelId;
        const logChannel = logChannelId ? this.client.channels.cache.get(logChannelId) : null;
        
        if (logChannel) {
          await logChannel.send({
            embeds: [{
              title: '🚨 Utilisateur Blacklisté Banni',
              description: `**Utilisateur:** ${member.user.tag} (${member.user.id})\n` +
                          `**Raison:** Présent sur la blacklist`,
              color: 0xff0000,
              timestamp: new Date().toISOString()
            }]
          });
        }
      } catch (error) {
        Logger.error(`Erreur lors du bannissement: ${error.message}`);
      }
      return;
    }

    // Si whitelist activée, vérifier
    if (this.config.whitelistOnly && !this.whitelist.has(member.user.id)) {
      Logger.security(`⚠️  Utilisateur non-whitelisté rejoint: ${member.user.tag}`, 'high');
      
      try {
        await member.kick('Non présent sur la whitelist');
      } catch (error) {
        Logger.error(`Erreur lors de l'expulsion: ${error.message}`);
      }
    }
  }

  async handleMessage(message) {
    if (!message.guild || message.author.bot) return;

    // Vérifier si l'utilisateur est blacklisté
    if (this.blacklist.has(message.author.id)) {
      await message.delete().catch(() => {});
      await message.member?.ban({ reason: 'Utilisateur blacklisté' }).catch(() => {});
    }
  }

  addToWhitelist(userId) {
    this.whitelist.add(userId);
    Logger.info(`Ajouté à la whitelist: ${userId}`);
  }

  removeFromWhitelist(userId) {
    this.whitelist.delete(userId);
    Logger.info(`Retiré de la whitelist: ${userId}`);
  }

  addToBlacklist(userId) {
    this.blacklist.add(userId);
    Logger.info(`Ajouté à la blacklist: ${userId}`);
  }

  removeFromBlacklist(userId) {
    this.blacklist.delete(userId);
    Logger.info(`Retiré de la blacklist: ${userId}`);
  }

  isWhitelisted(userId) {
    return this.whitelist.has(userId);
  }

  isBlacklisted(userId) {
    return this.blacklist.has(userId);
  }
}

export default WhitelistBlacklistSystem;
