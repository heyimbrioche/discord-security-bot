# 🛡️ Bot de Sécurité Discord Révolutionnaire

![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)
![Discord.js](https://img.shields.io/badge/Discord.js-14.14.1-blue.svg)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

Un bot de sécurité Discord avancé avec des fonctionnalités de protection contre toutes les attaques connues à ce jour. Protégez votre serveur Discord contre 34+ types d'attaques avec 18 systèmes de sécurité avancés.

## 🌟 Caractéristiques

- ✅ **34+ types d'attaques protégées** - Protection complète contre toutes les attaques Discord connues
- ✅ **18 systèmes de sécurité** - Architecture modulaire et extensible
- ✅ **Panel de contrôle web** - Interface moderne pour gérer tous les systèmes
- ✅ **Détection en temps réel** - Surveillance 24/7 avec réaction instantanée
- ✅ **Analyse comportementale** - Machine learning-like pour détecter les menaces
- ✅ **100% modulaire** - Activez/désactivez les systèmes selon vos besoins

## ✨ Fonctionnalités Révolutionnaires

### 🛡️ Systèmes de Protection

1. **Anti-Raid System**
   - Détection et prévention des raids de serveur
   - Protection contre la création excessive de channels/rôles
   - Détection des bannissements/kicks massifs
   - Protection contre les mentions massives
   - Rate limiting intelligent

2. **Anti-Spam System**
   - Détection de spam intelligent avec analyse de similarité
   - Détection de messages répétitifs
   - Protection contre les caractères répétitifs
   - Détection de liens multiples

3. **Anti-Phishing System**
   - Détection de liens de phishing en temps réel
   - Base de données de domaines suspects
   - Détection de typosquatting
   - Protection contre les scams Discord Nitro

4. **Anti-Nuke System**
   - Protection contre les tentatives de nuke
   - Détection des changements de permissions suspects
   - Protection contre la suppression massive de channels/rôles
   - Détection des modifications critiques du serveur

5. **Behavior Analysis System**
   - Analyse comportementale en temps réel
   - Détection de patterns suspects
   - Surveillance des nouveaux comptes
   - Système de scoring de suspicion

6. **Rate Limiting System**
   - Rate limiting global par utilisateur
   - Tracking de toutes les actions
   - Protection contre les actions automatisées

7. **Backup System**
   - Backups automatiques réguliers
   - Sauvegarde de la configuration du serveur
   - Restauration rapide en cas d'attaque

8. **Auto-Moderation System**
   - Filtrage automatique de contenu
   - Détection de messages en majuscules
   - Protection contre les éditions suspectes

9. **Whitelist/Blacklist System**
   - Système de whitelist pour accès restreint
   - Blacklist automatique des utilisateurs bannis
   - Gestion via commandes Discord

10. **Anti-Webhook System**
    - Protection contre les webhooks malveillants
    - Détection du spam de webhooks
    - Suppression automatique des webhooks suspects

11. **Anti-Emoji System**
    - Protection contre le spam d'emojis
    - Limitation de création d'emojis
    - Détection de messages avec trop d'emojis

12. **Anti-Selfbot System**
    - Détection avancée des selfbots
    - Analyse de patterns comportementaux
    - Détection de timing trop régulier

13. **Anti-Integration System**
    - Protection contre les intégrations malveillantes
    - Liste noire d'applications suspectes
    - Surveillance des intégrations

14. **Anti-File System**
    - Protection contre les fichiers dangereux
    - Détection d'extensions malveillantes
    - Limitation de taille et quantité

15. **Anti-Thread System**
    - Protection contre le spam de threads
    - Limitation de création de threads

16. **Anti-Reaction Spam System**
    - Protection contre le spam de réactions
    - Détection de réactions massives

17. **Anti-Embed Abuse System**
    - Protection contre l'abus d'embeds
    - Détection d'embeds suspects (phishing)
    - Limitation du nombre d'embeds

18. **Anti-Token Grabber System**
    - Détection de tokens Discord dans les messages
    - Protection contre les liens de token grabber
    - Suppression immédiate des tokens exposés

## 🚀 Installation

1. **Cloner le projet**
```bash
git clone <votre-repo>
cd bot-secure
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configuration**
   - Copiez `config.example.json` vers `config.json`
   - Copiez `.env.example` vers `.env`
   - **IMPORTANT** : Remplissez votre token Discord dans `.env` (DISCORD_TOKEN)
   - Ajoutez les IDs optionnels dans `.env` (OWNER_ID, LOG_CHANNEL_ID, BACKUP_CHANNEL_ID)
   - Configurez les paramètres de sécurité dans `config.json` selon vos besoins
   
   ⚠️ **Sécurité** : Ne commitez JAMAIS le fichier `.env` dans Git. Les informations sensibles doivent rester dans `.env` et non dans `config.json`.

4. **Lancer le bot**
```bash
npm start
```

## ⚙️ Configuration

Modifiez `config.json` pour personnaliser les paramètres :

- **antiRaid**: Protection contre les raids
- **antiSpam**: Protection contre le spam
- **antiPhishing**: Protection contre le phishing
- **antiNuke**: Protection contre les nukes
- **behaviorAnalysis**: Analyse comportementale
- **rateLimiting**: Rate limiting

## 📋 Commandes

- `!security` - Affiche le statut des systèmes de sécurité
- `!backup` - Crée un backup du serveur
- `!stats` - Affiche les statistiques de sécurité
- `!whitelist <add|remove|list> [user_id]` - Gère la whitelist
- `!blacklist <add|remove|list> [user_id]` - Gère la blacklist

## 🔒 Permissions Requises

Le bot nécessite les permissions suivantes :
- Gérer les messages
- Bannir des membres
- Expulser des membres
- Gérer les rôles
- Gérer les channels
- Voir les logs d'audit
- Lire l'historique des messages

## 🛠️ Technologies

- **Node.js** - Runtime JavaScript
- **discord.js v14** - Bibliothèque Discord
- **Winston** - Système de logs
- **Chalk** - Coloration de la console

## 📝 Notes

- Tous les systèmes fonctionnent en temps réel
- Les logs sont enregistrés dans la console et dans un channel Discord (si configuré)
- Les backups sont créés automatiquement toutes les heures
- Le système est entièrement modulaire et extensible

## ⚠️ Avertissement & Sécurité

Ce bot est conçu pour protéger votre serveur Discord. Assurez-vous de :
- **Garder votre token secret** - Utilisez le fichier `.env` pour les informations sensibles
- **Ne JAMAIS commiter `.env` ou `config.json`** dans Git
- Configurer correctement les permissions
- Tester le bot sur un serveur de test avant de l'utiliser en production
- Surveiller régulièrement les logs

**🔒 Consultez `SECURITY.md` pour un guide complet de sécurité.**

## 🤝 Contribution

Les contributions sont les bienvenues ! Veuillez lire [CONTRIBUTING.md](CONTRIBUTING.md) pour les détails sur notre code de conduite et le processus de soumission de pull requests.

## ⭐ Support

Si vous trouvez ce projet utile, n'hésitez pas à :
- ⭐ Star le projet
- 🐛 Signaler des bugs via les [Issues](https://github.com/yourusername/discord-security-bot/issues)
- 💡 Proposer des fonctionnalités
- 🤝 Contribuer au code

## 📚 Documentation Complète

- [SETUP.md](SETUP.md) - Guide d'installation détaillé
- [SECURITY.md](SECURITY.md) - Guide de sécurité
- [PANEL_GUIDE.md](PANEL_GUIDE.md) - Guide du panel de contrôle
- [FEATURES.md](FEATURES.md) - Liste complète des fonctionnalités
- [ATTACKS_COVERED.md](ATTACKS_COVERED.md) - Liste des attaques protégées
- [GITHUB_SETUP.md](GITHUB_SETUP.md) - Guide pour GitHub

## 📄 Licence

Ce projet est sous licence MIT - voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 🙏 Remerciements

- [Discord.js](https://discord.js.org/) pour la bibliothèque excellente
- Tous les contributeurs qui aident à améliorer ce projet
- La communauté Discord pour les retours et suggestions
