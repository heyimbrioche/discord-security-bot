# 🚀 Guide d'Installation Rapide

## Étapes d'Installation

### 1. Installation des dépendances
```bash
npm install
```

### 2. Configuration

1. **Copiez le fichier de configuration :**
   ```bash
   cp config.example.json config.json
   ```

2. **Créez le fichier `.env` pour les informations sensibles :**
   ```bash
   cp .env.example .env
   ```

3. **Ouvrez `.env` et configurez les variables d'environnement :**
   - `DISCORD_TOKEN` : **OBLIGATOIRE** - Votre token de bot Discord (obtenu sur https://discord.com/developers/applications)
   - `OWNER_ID` : (Optionnel) Votre ID Discord (activez le mode développeur et cliquez droit sur votre profil)
   - `LOG_CHANNEL_ID` : (Optionnel) L'ID du channel où les alertes seront envoyées
   - `BACKUP_CHANNEL_ID` : (Optionnel) L'ID du channel pour les notifications de backup

4. **Ouvrez `config.json` et ajustez les paramètres de sécurité selon vos besoins**
   
   ⚠️ **IMPORTANT** : Ne mettez JAMAIS votre token ou autres informations sensibles dans `config.json`. Utilisez toujours le fichier `.env` pour cela.

### 3. Obtenir un Token Discord

1. Allez sur https://discord.com/developers/applications
2. Créez une nouvelle application
3. Allez dans l'onglet "Bot"
4. Créez un bot et copiez le token
5. Activez les "Privileged Gateway Intents" :
   - MESSAGE CONTENT INTENT
   - SERVER MEMBERS INTENT
   - PRESENCE INTENT

### 4. Inviter le Bot

1. Dans l'onglet "OAuth2" > "URL Generator"
2. Sélectionnez les scopes : `bot` et `applications.commands`
3. Sélectionnez les permissions :
   - Administrator (ou sélectionnez manuellement toutes les permissions nécessaires)
4. Copiez l'URL et ouvrez-la dans votre navigateur
5. Sélectionnez votre serveur et autorisez

### 5. Lancer le Bot

```bash
npm start
```

## ⚙️ Configuration Avancée

### Paramètres Anti-Raid
- `maxChannelsPerMinute` : Nombre maximum de channels créés par minute
- `maxBansPerMinute` : Nombre maximum de bans par minute
- `actionOnDetection` : Action à prendre (ban, kick, timeout, mute)

### Paramètres Anti-Spam
- `maxMessagesPer10Seconds` : Nombre maximum de messages en 10 secondes
- `maxSimilarMessages` : Nombre de messages similaires avant action

### Paramètres Anti-Phishing
- `checkLinks` : Vérifier les liens dans les messages
- `checkDomains` : Vérifier les domaines suspects

## 🔧 Dépannage

### Le bot ne se connecte pas
- Vérifiez que le token est correct
- Vérifiez que les intents sont activés dans le Developer Portal

### Les systèmes ne fonctionnent pas
- Vérifiez que `enabled: true` dans la configuration
- Vérifiez les permissions du bot sur le serveur
- Consultez les logs dans la console

### Erreurs de permissions
- Assurez-vous que le bot a les permissions nécessaires
- Vérifiez que le bot est au-dessus des rôles qu'il doit gérer

## 📝 Notes Importantes

- **Sécurité** : Ne partagez jamais votre token ou votre fichier `config.json`
- **Permissions** : Le bot nécessite des permissions élevées pour fonctionner correctement
- **Performance** : Le bot surveille tous les événements en temps réel, ce qui peut être intensif
- **Backups** : Les backups sont créés automatiquement toutes les heures dans le dossier `backups/`

## 🆘 Support

En cas de problème, vérifiez :
1. Les logs dans la console
2. Les permissions du bot
3. La configuration dans `config.json`
4. Que toutes les dépendances sont installées
