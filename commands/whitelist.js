import { EmbedBuilder } from 'discord.js';

export default {
  data: {
    name: 'whitelist',
    description: 'Gère la whitelist (add/remove/list)'
  },
  async execute(message, args) {
    if (!message.member.permissions.has('Administrator')) {
      return message.reply('❌ Vous devez être administrateur pour utiliser cette commande.');
    }

    const { securitySystems } = await import('../../index.js');
    const system = securitySystems.whitelistBlacklist;

    if (!system) {
      return message.reply('❌ Le système de whitelist/blacklist n\'est pas activé.');
    }

    const action = args[0]?.toLowerCase();
    const userId = args[1];

    if (!action) {
      return message.reply('❌ Usage: `!whitelist <add|remove|list> [user_id]`');
    }

    switch (action) {
      case 'add':
        if (!userId) {
          return message.reply('❌ Veuillez spécifier un ID d\'utilisateur.');
        }
        system.addToWhitelist(userId);
        await message.reply(`✅ ${userId} ajouté à la whitelist.`);
        break;

      case 'remove':
        if (!userId) {
          return message.reply('❌ Veuillez spécifier un ID d\'utilisateur.');
        }
        system.removeFromWhitelist(userId);
        await message.reply(`✅ ${userId} retiré de la whitelist.`);
        break;

      case 'list':
        const whitelist = Array.from(system.whitelist);
        const embed = new EmbedBuilder()
          .setTitle('📋 Whitelist')
          .setDescription(whitelist.length > 0 
            ? whitelist.map(id => `<@${id}>`).join('\n')
            : 'Aucun utilisateur sur la whitelist')
          .setColor(0x00ff00);
        await message.reply({ embeds: [embed] });
        break;

      default:
        await message.reply('❌ Action invalide. Utilisez: `add`, `remove`, ou `list`.');
    }
  }
};
