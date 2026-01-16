import { EmbedBuilder } from 'discord.js';

export default {
  data: {
    name: 'stats',
    description: 'Affiche les statistiques de sécurité'
  },
  async execute(message, args) {
    if (!message.member.permissions.has('Administrator')) {
      return message.reply('❌ Vous devez être administrateur pour utiliser cette commande.');
    }

    const { securitySystems } = await import('../../index.js');

    const antiRaidSuspicious = securitySystems.antiRaid?.suspiciousUsers?.size || 0;
    const behaviorSuspicious = Array.from(securitySystems.behaviorAnalysis?.userProfiles?.values() || [])
      .filter(p => p.suspicionLevel > 0).length;

    const embed = new EmbedBuilder()
      .setTitle('📊 Statistiques de Sécurité')
      .setColor(0x0099ff)
      .addFields(
        {
          name: '👥 Utilisateurs Suspects (Anti-Raid)',
          value: `${antiRaidSuspicious}`,
          inline: true
        },
        {
          name: '🧠 Profils Suspects (Analyse)',
          value: `${behaviorSuspicious}`,
          inline: true
        },
        {
          name: '🛡️ Protection Active',
          value: '24/7',
          inline: true
        }
      )
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
};
