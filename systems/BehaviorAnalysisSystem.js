import Logger from '../utils/Logger.js';

class BehaviorAnalysisSystem {
  constructor(client, config) {
    this.client = client;
    this.config = config;
    this.userProfiles = new Map(); // userId -> { actions: [], accountAge: Date, joinDate: Date }
  }

  init() {
    if (!this.config.enabled) return;
    
    this.client.on('guildMemberAdd', (member) => this.analyzeNewMember(member));
    this.client.on('messageCreate', (message) => this.trackBehavior(message));
    this.client.on('guildMemberUpdate', (oldMember, newMember) => 
      this.trackMemberUpdate(oldMember, newMember));
    
    Logger.success('Système d\'Analyse Comportementale activé');
  }

  async analyzeNewMember(member) {
    const accountAge = Date.now() - member.user.createdTimestamp;
    const accountAgeDays = accountAge / (1000 * 60 * 60 * 24);

    // Vérifier l'âge du compte
    if (this.config.checkAccountAge && accountAgeDays < this.config.minAccountAgeDays) {
      Logger.security(`⚠️  Nouveau compte suspect: ${member.user.tag} (${accountAgeDays.toFixed(1)} jours)`, 'high');
      
      // Surveiller de près
      this.userProfiles.set(member.id, {
        accountAge: accountAgeDays,
        joinDate: Date.now(),
        actions: [],
        suspicionLevel: 1
      });

      const logChannelId = this.config.logChannelId || this.client.config?.logChannelId;
      const logChannel = logChannelId ? this.client.channels.cache.get(logChannelId) : null;
      if (logChannel) {
        await logChannel.send({
          embeds: [{
            title: '⚠️ Nouveau Membre Suspect',
            description: `**Utilisateur:** ${member.user.tag} (${member.id})\n` +
                        `**Âge du compte:** ${accountAgeDays.toFixed(1)} jours\n` +
                        `**Surveillance activée**`,
            color: 0xff9900
          }]
        });
      }
    }
  }

  trackBehavior(message) {
    if (!message.guild || message.author.bot) return;

    const userId = message.author.id;
    if (!this.userProfiles.has(userId)) {
      this.userProfiles.set(userId, {
        actions: [],
        suspicionLevel: 0
      });
    }

    const profile = this.userProfiles.get(userId);
    profile.actions.push({
      type: 'message',
      timestamp: Date.now(),
      content: message.content.substring(0, 50)
    });

    // Garder seulement les 100 dernières actions
    if (profile.actions.length > 100) {
      profile.actions.shift();
    }

    // Analyser les patterns suspects
    this.analyzePatterns(userId, profile);
  }

  analyzePatterns(userId, profile) {
    const recentActions = profile.actions.filter(
      a => Date.now() - a.timestamp < 300000 // 5 minutes
    );

    // Pattern 1: Actions très rapides
    if (recentActions.length > 20) {
      profile.suspicionLevel += 2;
    }

    // Pattern 2: Messages avec beaucoup de caractères spéciaux
    const specialCharMessages = recentActions.filter(a => 
      a.type === 'message' && /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{10,}/.test(a.content)
    );
    if (specialCharMessages.length > 3) {
      profile.suspicionLevel += 1;
    }

    // Si le niveau de suspicion dépasse le seuil
    if (profile.suspicionLevel >= this.config.suspiciousActivityThreshold) {
      this.handleSuspiciousActivity(userId, profile);
    }
  }

  async handleSuspiciousActivity(userId, profile) {
    const user = this.client.users.cache.get(userId);
    if (!user) return;

    Logger.security(`🚨 ACTIVITÉ SUSPECTE: ${user.tag} (Niveau: ${profile.suspicionLevel})`, 'high');

    const logChannel = this.client.channels.cache.get(this.config.logChannelId);
    if (logChannel) {
      await logChannel.send({
        embeds: [{
          title: '🚨 Activité Suspecte Détectée',
          description: `**Utilisateur:** ${user.tag} (${user.id})\n` +
                      `**Niveau de suspicion:** ${profile.suspicionLevel}\n` +
                      `**Actions récentes:** ${profile.actions.length}`,
          color: 0xff9900,
          timestamp: new Date().toISOString()
        }]
      });
    }
  }

  trackMemberUpdate(oldMember, newMember) {
    // Détecter les changements suspects de nom
    if (oldMember.nickname !== newMember.nickname) {
      const profile = this.userProfiles.get(newMember.id) || { suspicionLevel: 0 };
      profile.suspicionLevel += 0.5;
      this.userProfiles.set(newMember.id, profile);
    }
  }

  getSuspicionLevel(userId) {
    const profile = this.userProfiles.get(userId);
    return profile?.suspicionLevel || 0;
  }
}

export default BehaviorAnalysisSystem;
