import { Collection } from 'discord.js';
import Logger from '../utils/Logger.js';
import { readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class CommandHandler {
  constructor(client) {
    this.client = client;
    this.commands = new Collection();
    this.loadCommands();
    this.setupMessageHandler();
  }

  loadCommands() {
    const commandsPath = join(__dirname, '../commands');
    try {
      const commandFiles = readdirSync(commandsPath).filter(file => 
        file.endsWith('.js')
      );

      for (const file of commandFiles) {
        import(`../commands/${file}`).then(command => {
          if ('data' in command.default && 'execute' in command.default) {
            this.commands.set(command.default.data.name, command.default);
            Logger.info(`Commande chargée: ${command.default.data.name}`);
          }
        });
      }
    } catch (error) {
      Logger.warn(`Aucun dossier commands trouvé: ${error.message}`);
    }
  }

  setupMessageHandler() {
    this.client.on('messageCreate', async (message) => {
      if (!message.guild || message.author.bot) return;

      const prefix = '!';
      if (!message.content.startsWith(prefix)) return;

      const args = message.content.slice(prefix.length).trim().split(/ +/);
      const commandName = args.shift().toLowerCase();

      const command = this.commands.get(commandName);
      if (!command) return;

      try {
        await command.execute(message, args);
      } catch (error) {
        Logger.error(`Erreur lors de l'exécution de ${commandName}: ${error.message}`);
        await message.reply('Une erreur est survenue lors de l\'exécution de la commande.').catch(() => {});
      }
    });
  }
}

export default CommandHandler;
