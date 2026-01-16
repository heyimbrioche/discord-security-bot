import { EmbedBuilder } from 'discord.js';

export default {
  data: {
    name: 'blacklist',
    description: 'Gère la blacklist (add/remove/list)'
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
      return message.reply('❌ Usage: `!blacklist <add|remove|list> [user_id]`');
    }

    switch (action) {
      case 'add':
        if (!userId) {
          return message.reply('❌ Veuillez spécifier un ID d\'utilisateur.');
        }
        system.addToBlacklist(userId);
        await message.reply(`✅ ${userId} ajouté à la blacklist.`);
        break;

      case 'remove':
        if (!userId) {
          return message.reply('❌ Veuillez spécifier un ID d\'utilisateur.');
        }
        system.removeFromBlacklist(userId);
        await message.reply(`✅ ${userId} retiré de la blacklist.`);
        break;

      case 'list':
        const blacklist = Array.from(system.blacklist);
        const embed = new EmbedBuilder()
          .setTitle('🚫 Blacklist')
          .setDescription(blacklist.length > 0 
            ? blacklist.map(id => `<@${id}>`).join('\n')
            : 'Aucun utilisateur sur la blacklist')
          .setColor(0xff0000);
        await message.reply({ embeds: [embed] });
        break;

      default:
        await message.reply('❌ Action invalide. Utilisez: `add`, `remove`, ou `list`.');
    }
  }
};
