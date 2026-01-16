import { EmbedBuilder } from 'discord.js';

export default {
  data: {
    name: 'backup',
    description: 'Crée un backup du serveur'
  },
  async execute(message, args) {
    if (!message.member.permissions.has('Administrator')) {
      return message.reply('❌ Vous devez être administrateur pour utiliser cette commande.');
    }

    const { securitySystems } = await import('../../index.js');

    await message.reply('⏳ Création du backup en cours...');

    try {
      const backup = await securitySystems.backup.createBackup(message.guild);

      const embed = new EmbedBuilder()
        .setTitle('💾 Backup Créé')
        .setDescription(`Backup créé avec succès pour **${message.guild.name}**`)
        .addFields(
          {
            name: 'Rôles',
            value: `${backup.guild.roles.length}`,
            inline: true
          },
          {
            name: 'Channels',
            value: `${backup.guild.channels.length}`,
            inline: true
          },
          {
            name: 'Timestamp',
            value: `<t:${Math.floor(new Date(backup.timestamp).getTime() / 1000)}:F>`,
            inline: false
          }
        )
        .setColor(0x00ff00)
        .setTimestamp();

      await message.channel.send({ embeds: [embed] });
    } catch (error) {
      await message.reply(`❌ Erreur lors de la création du backup: ${error.message}`);
    }
  }
};
