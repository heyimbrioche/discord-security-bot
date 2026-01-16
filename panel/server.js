import express from 'express';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { config } from 'dotenv';
import cors from 'cors';

// Charger les variables d'environnement
config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(join(__dirname, 'public')));

// Route pour servir index.html
app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'index.html'));
});

// Charger la configuration
function loadConfig() {
  try {
    const configPath = join(__dirname, '..', 'config.json');
    if (existsSync(configPath)) {
      const config = JSON.parse(readFileSync(configPath, 'utf-8'));
      
      // Ajouter les valeurs depuis .env si disponibles
      if (process.env.LOG_CHANNEL_ID) {
        config.logChannelId = process.env.LOG_CHANNEL_ID;
      }
      if (process.env.BACKUP_CHANNEL_ID) {
        config.backupChannelId = process.env.BACKUP_CHANNEL_ID;
      }
      
      return config;
    }
    return null;
  } catch (error) {
    console.error('Erreur lors du chargement de la config:', error);
    return null;
  }
}

// Sauvegarder la configuration
function saveConfig(config) {
  try {
    const configPath = join(__dirname, '..', 'config.json');
    writeFileSync(configPath, JSON.stringify(config, null, 2));
    return true;
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de la config:', error);
    return false;
  }
}

// API Routes
app.get('/api/config', (req, res) => {
  const config = loadConfig();
  if (!config) {
    return res.status(404).json({ error: 'Configuration non trouvée' });
  }
  
  // Ne pas exposer les valeurs sensibles même si elles sont dans config.json
  const safeConfig = { ...config };
  delete safeConfig.token;
  
  // Utiliser les variables d'environnement pour les IDs si disponibles
  // mais ne pas les exposer dans la réponse
  res.json(safeConfig);
});

app.post('/api/config', (req, res) => {
  const config = loadConfig();
  if (!config) {
    return res.status(404).json({ error: 'Configuration non trouvée' });
  }

  // Mettre à jour la configuration
  const updates = req.body;
  
  // Mettre à jour récursivement
  function updateConfig(target, source) {
    for (const key in source) {
      if (typeof source[key] === 'object' && !Array.isArray(source[key]) && source[key] !== null) {
        if (!target[key]) target[key] = {};
        updateConfig(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    }
  }

  updateConfig(config, updates);

  if (saveConfig(config)) {
    res.json({ success: true, message: 'Configuration mise à jour' });
  } else {
    res.status(500).json({ error: 'Erreur lors de la sauvegarde' });
  }
});

app.post('/api/system/:systemName/toggle', (req, res) => {
  const config = loadConfig();
  if (!config) {
    return res.status(404).json({ error: 'Configuration non trouvée' });
  }

  const systemName = req.params.systemName;
  const systemPath = systemName.split('.');

  let current = config.security;
  for (let i = 0; i < systemPath.length - 1; i++) {
    if (!current[systemPath[i]]) {
      current[systemPath[i]] = {};
    }
    current = current[systemPath[i]];
  }

  const lastKey = systemPath[systemPath.length - 1];
  if (!current[lastKey]) {
    current[lastKey] = {};
  }

  current[lastKey].enabled = !(current[lastKey].enabled || false);

  if (saveConfig(config)) {
    res.json({ 
      success: true, 
      enabled: current[lastKey].enabled,
      message: `Système ${current[lastKey].enabled ? 'activé' : 'désactivé'}` 
    });
  } else {
    res.status(500).json({ error: 'Erreur lors de la sauvegarde' });
  }
});

app.get('/api/systems', (req, res) => {
  const systems = [
    {
      id: 'antiRaid',
      name: 'Anti-Raid',
      icon: '🛡️',
      description: 'Protection contre les raids de serveur (création excessive de channels, rôles, bans, etc.)',
      category: 'Protection Principale',
      features: [
        'Détection de création excessive de channels',
        'Détection de création excessive de rôles',
        'Détection de bannissements/kicks massifs',
        'Protection contre les mentions massives',
        'Rate limiting intelligent'
      ]
    },
    {
      id: 'antiSpam',
      name: 'Anti-Spam',
      icon: '🚫',
      description: 'Protection contre le spam de messages avec détection de similarité',
      category: 'Protection Principale',
      features: [
        'Détection de messages répétitifs (algorithme de Levenshtein)',
        'Détection de caractères répétitifs',
        'Limitation de messages par période',
        'Détection de liens multiples'
      ]
    },
    {
      id: 'antiPhishing',
      name: 'Anti-Phishing',
      icon: '🔒',
      description: 'Protection contre les liens de phishing et scams Discord Nitro',
      category: 'Protection Principale',
      features: [
        'Base de données de domaines suspects',
        'Détection de typosquatting',
        'Protection contre les scams Discord Nitro',
        'Détection de domaines Steam suspects'
      ]
    },
    {
      id: 'antiNuke',
      name: 'Anti-Nuke',
      icon: '💣',
      description: 'Protection contre les tentatives de nuke du serveur',
      category: 'Protection Principale',
      features: [
        'Détection de changements de permissions suspects',
        'Protection contre la suppression massive',
        'Détection de modifications critiques',
        'Bannissement immédiat en cas de détection'
      ]
    },
    {
      id: 'behaviorAnalysis',
      name: 'Analyse Comportementale',
      icon: '🧠',
      description: 'Analyse comportementale en temps réel avec système de scoring',
      category: 'Protection Avancée',
      features: [
        'Détection de nouveaux comptes suspects',
        'Analyse de patterns comportementaux',
        'Système de scoring de suspicion',
        'Tracking de toutes les actions utilisateur'
      ]
    },
    {
      id: 'rateLimiting',
      name: 'Rate Limiting',
      icon: '⏱️',
      description: 'Rate limiting global par utilisateur',
      category: 'Protection Avancée',
      features: [
        'Tracking de toutes les actions',
        'Limitation par utilisateur',
        'Timeout automatique en cas de dépassement'
      ]
    },
    {
      id: 'autoModeration',
      name: 'Auto-Modération',
      icon: '🤖',
      description: 'Modération automatique de contenu',
      category: 'Modération',
      features: [
        'Filtrage de mots interdits',
        'Détection de messages en majuscules',
        'Détection d\'éditions suspectes'
      ]
    },
    {
      id: 'whitelistBlacklist',
      name: 'Whitelist/Blacklist',
      icon: '📋',
      description: 'Système de whitelist et blacklist',
      category: 'Modération',
      features: [
        'Whitelist pour accès restreint',
        'Blacklist automatique',
        'Bannissement automatique des blacklistés'
      ]
    },
    {
      id: 'antiWebhook',
      name: 'Anti-Webhook',
      icon: '🔗',
      description: 'Protection contre les webhooks malveillants',
      category: 'Protection Avancée',
      features: [
        'Détection de création excessive de webhooks',
        'Détection de spam via webhooks',
        'Suppression automatique des webhooks suspects'
      ]
    },
    {
      id: 'antiEmoji',
      name: 'Anti-Emoji',
      icon: '😀',
      description: 'Protection contre le spam d\'emojis',
      category: 'Protection Avancée',
      features: [
        'Limitation de création d\'emojis',
        'Détection de messages avec trop d\'emojis',
        'Protection contre le spam d\'emojis'
      ]
    },
    {
      id: 'antiSelfbot',
      name: 'Anti-Selfbot',
      icon: '🤖',
      description: 'Détection avancée des selfbots',
      category: 'Protection Avancée',
      features: [
        'Analyse de patterns comportementaux',
        'Détection de timing trop régulier',
        'Détection de messages identiques',
        'Analyse de structure de messages'
      ]
    },
    {
      id: 'antiIntegration',
      name: 'Anti-Integration',
      icon: '🔌',
      description: 'Protection contre les intégrations malveillantes',
      category: 'Protection Avancée',
      features: [
        'Liste noire d\'applications suspectes',
        'Détection de création excessive',
        'Suppression automatique'
      ]
    },
    {
      id: 'antiFile',
      name: 'Anti-File',
      icon: '📁',
      description: 'Protection contre les fichiers dangereux',
      category: 'Protection Avancée',
      features: [
        'Détection d\'extensions malveillantes',
        'Limitation de taille de fichiers',
        'Protection contre le spam de fichiers'
      ]
    },
    {
      id: 'antiThread',
      name: 'Anti-Thread',
      icon: '🧵',
      description: 'Protection contre le spam de threads',
      category: 'Protection Avancée',
      features: [
        'Limitation de création de threads',
        'Détection de création excessive'
      ]
    },
    {
      id: 'antiReactionSpam',
      name: 'Anti-Reaction Spam',
      icon: '👍',
      description: 'Protection contre le spam de réactions',
      category: 'Protection Avancée',
      features: [
        'Détection de réactions massives',
        'Limitation de réactions par période'
      ]
    },
    {
      id: 'antiEmbedAbuse',
      name: 'Anti-Embed Abuse',
      icon: '📄',
      description: 'Protection contre l\'abus d\'embeds',
      category: 'Protection Avancée',
      features: [
        'Limitation du nombre d\'embeds',
        'Détection d\'embeds suspects (phishing)',
        'Protection contre le spam d\'embeds'
      ]
    },
    {
      id: 'antiTokenGrabber',
      name: 'Anti-Token Grabber',
      icon: '🔐',
      description: 'Protection contre les token grabbers',
      category: 'Protection Critique',
      features: [
        'Détection de tokens Discord exposés',
        'Détection de liens de token grabber',
        'Suppression immédiate des tokens',
        'Protection contre les stealers'
      ]
    }
  ];

  res.json(systems);
});

app.listen(PORT, () => {
  console.log(`🚀 Panel de contrôle démarré sur http://localhost:${PORT}`);
});
