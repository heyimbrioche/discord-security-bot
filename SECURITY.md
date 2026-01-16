# 🔒 Guide de Sécurité

Ce guide explique comment sécuriser correctement votre bot Discord.

## ⚠️ Informations Sensibles

### Fichiers à NE JAMAIS commiter dans Git

- ✅ `.env` - Contient votre token et IDs secrets
- ✅ `config.json` - Peut contenir des configurations sensibles
- ✅ Tous les fichiers contenant des tokens, mots de passe, ou clés API

### Fichiers Sécurisés (peuvent être committés)

- ✅ `.env.example` - Exemple sans valeurs réelles
- ✅ `config.example.json` - Exemple sans valeurs sensibles
- ✅ Tous les fichiers de code source

## 📝 Configuration Sécurisée

### Structure Recommandée

```
bot-secure/
├── .env                    # ⚠️ NE JAMAIS COMMITER
├── .env.example            # ✅ Peut être committé
├── config.json             # ⚠️ NE JAMAIS COMMITER (si contient des infos sensibles)
├── config.example.json     # ✅ Peut être committé
└── ...
```

### Fichier .env

Le fichier `.env` doit contenir TOUTES les informations sensibles :

```env
DISCORD_TOKEN=votre_token_secret_ici
OWNER_ID=votre_id_ici
LOG_CHANNEL_ID=id_du_channel_ici
BACKUP_CHANNEL_ID=id_du_channel_ici
```

### Fichier config.json

Le fichier `config.json` ne doit contenir QUE les paramètres de configuration non sensibles :

```json
{
  "prefix": "!",
  "security": {
    "antiRaid": {
      "enabled": true,
      ...
    }
  }
}
```

## 🔐 Bonnes Pratiques

### 1. Variables d'Environnement

- ✅ Utilisez toujours `.env` pour les tokens et IDs
- ✅ Ne mettez JAMAIS de token dans le code source
- ✅ Ne mettez JAMAIS de token dans `config.json`

### 2. Git

- ✅ Vérifiez que `.env` est dans `.gitignore`
- ✅ Vérifiez que `config.json` est dans `.gitignore` (ou ne contient pas d'infos sensibles)
- ✅ Ne commitez JAMAIS de tokens

### 3. Partage du Code

- ✅ Partagez seulement `.env.example` (sans valeurs réelles)
- ✅ Partagez seulement `config.example.json`
- ✅ Expliquez aux autres de créer leur propre `.env`

## 🚨 En Cas de Token Exposé

Si vous avez accidentellement exposé votre token :

1. **Immédiatement** :
   - Rendez-vous sur https://discord.com/developers/applications
   - Sélectionnez votre application
   - Allez dans l'onglet "Bot"
   - Cliquez sur "Reset Token" pour générer un nouveau token

2. **Mettez à jour votre `.env`** :
   - Remplacez l'ancien token par le nouveau

3. **Vérifiez Git** :
   - Si le token est dans l'historique Git, considérez-le comme compromis
   - Regénérez le token même si vous avez supprimé le commit

## 📋 Checklist de Sécurité

Avant de partager ou commiter votre code :

- [ ] `.env` est dans `.gitignore`
- [ ] Aucun token dans le code source
- [ ] Aucun token dans `config.json`
- [ ] `.env.example` existe (sans valeurs réelles)
- [ ] `config.example.json` existe (sans valeurs sensibles)
- [ ] Tous les fichiers sensibles sont ignorés

## 🔍 Vérification

Pour vérifier qu'aucun token n'est exposé :

```bash
# Chercher des tokens Discord dans le code
grep -r "DISCORD_TOKEN" --exclude-dir=node_modules --exclude="*.log" .

# Chercher des patterns de tokens
grep -r "mfa\.[A-Za-z0-9_-]" --exclude-dir=node_modules .
grep -r "[MN][A-Za-z0-9]{23}\." --exclude-dir=node_modules .
```

Si vous trouvez des résultats, supprimez-les immédiatement et regénérez le token.

## 💡 Conseils

- Utilisez un gestionnaire de secrets pour la production (AWS Secrets Manager, etc.)
- Ne partagez jamais votre `.env` même en privé
- Régénérez vos tokens régulièrement
- Utilisez des permissions minimales pour votre bot
