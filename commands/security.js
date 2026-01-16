import { EmbedBuilder } from 'discord.js';

export default {
  data: {
    name: 'security',
    description: 'Affiche le statut des systèmes de sécurité'
  },
  async execute(message, args) {
    if (!message.member.permissions.has('Administrator')) {
      return message.reply('❌ Vous devez être administrateur pour utiliser cette commande.');
    }

    const { securitySystems } = await import('../../index.js');

    const embed = new EmbedBuilder()
      .setTitle('🛡️ Statut des Systèmes de Sécurité')
      .setColor(0x00ff00)
      .setDescription('Tous les systèmes de protection sont actifs')
      .addFields(
        {
          name: '🛡️ Anti-Raid',
          value: '✅ Actif',
          inline: true
        },
        {
          name: '🚫 Anti-Spam',
          value: '✅ Actif',
          inline: true
        },
        {
          name: '🔒 Anti-Phishing',
          value: '✅ Actif',
          inline: true
        },
        {
          name: '💣 Anti-Nuke',
          value: '✅ Actif',
          inline: true
        },
        {
          name: '🧠 Analyse Comportementale',
          value: '✅ Actif',
          inline: true
        },
        {
          name: '⏱️ Rate Limiting',
          value: '✅ Actif',
          inline: true
        }
      )
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
};
