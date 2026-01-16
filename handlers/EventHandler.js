import Logger from '../utils/Logger.js';

class EventHandler {
  constructor(client, securitySystems) {
    this.client = client;
    this.securitySystems = securitySystems;
    this.setupEvents();
  }

  setupEvents() {
    // Événement de connexion
    this.client.on('ready', () => {
      Logger.success('Tous les systèmes de sécurité sont opérationnels');
    });

    // Gestion des erreurs
    this.client.on('error', (error) => {
      Logger.error(`Erreur Discord: ${error.message}`);
    });

    // Détection de déconnexions suspectes
    this.client.on('guildMemberRemove', async (member) => {
      // Si beaucoup de membres partent en même temps, c'est suspect
      const recentLeaves = member.guild.members.cache.filter(m => 
        !m.joinedTimestamp || Date.now() - m.joinedTimestamp < 60000
      ).size;

      if (recentLeaves > 10) {
        Logger.security(`⚠️  Départ massif détecté sur ${member.guild.name}`, 'high');
      }
    });
  }
}

export default EventHandler;
