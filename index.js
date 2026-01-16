import { Client, GatewayIntentBits, Partials, Collection } from 'discord.js';
import { config } from 'dotenv';
import { readFileSync } from 'fs';
import chalk from 'chalk';
import Logger from './utils/Logger.js';
import AntiRaidSystem from './systems/AntiRaidSystem.js';
import AntiSpamSystem from './systems/AntiSpamSystem.js';
import AntiPhishingSystem from './systems/AntiPhishingSystem.js';
import AntiNukeSystem from './systems/AntiNukeSystem.js';
import BehaviorAnalysisSystem from './systems/BehaviorAnalysisSystem.js';
import RateLimitSystem from './systems/RateLimitSystem.js';
import BackupSystem from './systems/BackupSystem.js';
import AutoModerationSystem from './systems/AutoModerationSystem.js';
import WhitelistBlacklistSystem from './systems/WhitelistBlacklistSystem.js';
import AntiWebhookSystem from './systems/AntiWebhookSystem.js';
import AntiEmojiSystem from './systems/AntiEmojiSystem.js';
import AntiSelfbotSystem from './systems/AntiSelfbotSystem.js';
import AntiIntegrationSystem from './systems/AntiIntegrationSystem.js';
import AntiFileSystem from './systems/AntiFileSystem.js';
import AntiThreadSystem from './systems/AntiThreadSystem.js';
import AntiReactionSpamSystem from './systems/AntiReactionSpamSystem.js';
import AntiEmbedAbuseSystem from './systems/AntiEmbedAbuseSystem.js';
import AntiTokenGrabberSystem from './systems/AntiTokenGrabberSystem.js';
import CommandHandler from './handlers/CommandHandler.js';
import EventHandler from './handlers/EventHandler.js';

// Charger les variables d'environnement
config();

// Vérifier les variables d'environnement requises
const requiredEnvVars = ['DISCORD_TOKEN'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  Logger.error(`Variables d'environnement manquantes: ${missingEnvVars.join(', ')}`);
  Logger.error('Veuillez créer un fichier .env avec ces variables (voir .env.example)');
  process.exit(1);
}

// Charger la configuration
let botConfig;
try {
  const configFile = readFileSync('./config.json', 'utf-8');
  botConfig = JSON.parse(configFile);
} catch (error) {
  Logger.error('Erreur lors du chargement de config.json. Utilisez config.example.json comme modèle.');
  process.exit(1);
}

// Remplacer les valeurs sensibles par les variables d'environnement
botConfig.token = process.env.DISCORD_TOKEN;
botConfig.ownerId = process.env.OWNER_ID || botConfig.ownerId;
botConfig.logChannelId = process.env.LOG_CHANNEL_ID || botConfig.logChannelId;
botConfig.backupChannelId = process.env.BACKUP_CHANNEL_ID || botConfig.backupChannelId;

// Créer le client Discord avec tous les intents nécessaires
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildPresences
  ],
  partials: [
    Partials.Message,
    Partials.Channel,
    Partials.Reaction,
    Partials.GuildMember,
    Partials.User
  ]
});

// Ajouter la config au client pour accès global
client.config = botConfig;

// Initialiser les systèmes de sécurité
const securitySystems = {
  antiRaid: new AntiRaidSystem(client, { ...botConfig.security.antiRaid, logChannelId: botConfig.logChannelId }),
  antiSpam: new AntiSpamSystem(client, { ...botConfig.security.antiSpam, logChannelId: botConfig.logChannelId }),
  antiPhishing: new AntiPhishingSystem(client, { ...botConfig.security.antiPhishing, logChannelId: botConfig.logChannelId }),
  antiNuke: new AntiNukeSystem(client, { ...botConfig.security.antiNuke, logChannelId: botConfig.logChannelId }),
  behaviorAnalysis: new BehaviorAnalysisSystem(client, { ...botConfig.security.behaviorAnalysis, logChannelId: botConfig.logChannelId }),
  rateLimit: new RateLimitSystem(client, botConfig.security.rateLimiting),
  autoMod: new AutoModerationSystem(client, { ...botConfig.security.autoModeration, logChannelId: botConfig.logChannelId }),
  whitelistBlacklist: new WhitelistBlacklistSystem(client, { ...botConfig.security.whitelistBlacklist, logChannelId: botConfig.logChannelId }),
  antiWebhook: new AntiWebhookSystem(client, { ...botConfig.security.antiWebhook, logChannelId: botConfig.logChannelId }),
  antiEmoji: new AntiEmojiSystem(client, { ...botConfig.security.antiEmoji, logChannelId: botConfig.logChannelId }),
  antiSelfbot: new AntiSelfbotSystem(client, { ...botConfig.security.antiSelfbot, logChannelId: botConfig.logChannelId }),
  antiIntegration: new AntiIntegrationSystem(client, { ...botConfig.security.antiIntegration, logChannelId: botConfig.logChannelId }),
  antiFile: new AntiFileSystem(client, { ...botConfig.security.antiFile, logChannelId: botConfig.logChannelId }),
  antiThread: new AntiThreadSystem(client, { ...botConfig.security.antiThread, logChannelId: botConfig.logChannelId }),
  antiReactionSpam: new AntiReactionSpamSystem(client, { ...botConfig.security.antiReactionSpam, logChannelId: botConfig.logChannelId }),
  antiEmbedAbuse: new AntiEmbedAbuseSystem(client, { ...botConfig.security.antiEmbedAbuse, logChannelId: botConfig.logChannelId }),
  antiTokenGrabber: new AntiTokenGrabberSystem(client, { ...botConfig.security.antiTokenGrabber, logChannelId: botConfig.logChannelId }),
  backup: new BackupSystem(client, botConfig)
};

// Collection pour les commandes
client.commands = new Collection();

// Initialiser les handlers
const commandHandler = new CommandHandler(client);
const eventHandler = new EventHandler(client, securitySystems);

// Événement de démarrage
client.once('ready', () => {
  Logger.success(`Bot connecté en tant que ${chalk.cyan(client.user.tag)}`);
  Logger.info(`Protection de ${chalk.yellow(client.guilds.cache.size)} serveur(s)`);
  
  // Initialiser les systèmes
  Object.values(securitySystems).forEach(system => {
    if (system.init) system.init();
  });
  
  // Démarrer les backups automatiques
  if (securitySystems.backup) {
    setInterval(() => {
      securitySystems.backup.createBackupForAllGuilds();
    }, 3600000); // Toutes les heures
  }
});

// Gestion des erreurs
client.on('error', error => {
  Logger.error(`Erreur Discord: ${error.message}`);
});

process.on('unhandledRejection', error => {
  Logger.error(`Erreur non gérée: ${error}`);
});

// Connexion au bot (le token doit être dans .env)
if (!botConfig.token) {
  Logger.error('Token Discord non trouvé. Vérifiez que DISCORD_TOKEN est défini dans .env');
  process.exit(1);
}
client.login(botConfig.token);

export { client, securitySystems, botConfig };
