# 🚀 Guide de Configuration GitHub

Ce guide vous explique comment mettre votre bot de sécurité Discord sur GitHub.

## 📋 Préparation

### 1. Vérifier les Fichiers

Avant de push sur GitHub, assurez-vous que :

- ✅ `.env` est dans `.gitignore` (ne sera pas commité)
- ✅ `config.json` est dans `.gitignore` (ne sera pas commité)
- ✅ `.env.example` existe (sera commité comme template)
- ✅ `config.example.json` existe (sera commité comme template)
- ✅ `LICENSE` existe
- ✅ `README.md` est à jour

### 2. Vérifier qu'Aucun Token n'est Exposé

Exécutez ces commandes pour vérifier :

```bash
# Chercher des tokens Discord dans le code
grep -r "DISCORD_TOKEN" --exclude-dir=node_modules --exclude="*.log" .

# Chercher des patterns de tokens
grep -r "mfa\.[A-Za-z0-9_-]" --exclude-dir=node_modules .
grep -r "[MN][A-Za-z0-9]{23}\." --exclude-dir=node_modules .
```

Si vous trouvez des résultats, **NE COMMITEZ PAS** ! Supprimez-les d'abord.

## 🚀 Créer le Repository GitHub

### Méthode 1 : Via l'Interface GitHub

1. Allez sur https://github.com/new
2. Créez un nouveau repository
3. **NE PAS** initialiser avec README, .gitignore ou license (on les a déjà)
4. Copiez l'URL du repository

### Méthode 2 : Via GitHub CLI

```bash
gh repo create discord-security-bot --public --description "Bot de sécurité Discord révolutionnaire"
```

## 📤 Premier Push

### Si vous n'avez pas encore initialisé Git :

```bash
# Initialiser Git
git init

# Ajouter tous les fichiers (sauf ceux dans .gitignore)
git add .

# Premier commit
git commit -m "Initial commit: Discord Security Bot"

# Ajouter le remote GitHub (remplacez YOUR_USERNAME par votre nom d'utilisateur)
git remote add origin https://github.com/YOUR_USERNAME/discord-security-bot.git

# Push vers GitHub
git branch -M main
git push -u origin main
```

### Si vous avez déjà un repository Git :

```bash
# Ajouter le remote GitHub (remplacez YOUR_USERNAME par votre nom d'utilisateur)
git remote add origin https://github.com/YOUR_USERNAME/discord-security-bot.git

# Push vers GitHub
git branch -M main
git push -u origin main
```

## 🎨 Personnaliser le Repository

### 1. Mettre à jour package.json

Remplacez `yourusername` dans `package.json` par votre nom d'utilisateur GitHub :

```json
"repository": {
  "type": "git",
  "url": "https://github.com/YOUR_USERNAME/discord-security-bot.git"
},
"bugs": {
  "url": "https://github.com/YOUR_USERNAME/discord-security-bot/issues"
},
"homepage": "https://github.com/YOUR_USERNAME/discord-security-bot#readme"
```

### 2. Ajouter une Description

Sur la page du repository GitHub :
1. Cliquez sur le bouton "⚙️ Settings"
2. Allez dans la section "General"
3. Ajoutez une description : "Bot de sécurité Discord avec protection contre 34+ types d'attaques"

### 3. Ajouter des Topics

Sur la page du repository :
1. Cliquez sur le bouton "⚙️" à côté d'"About"
2. Ajoutez des topics :
   - `discord`
   - `discord-bot`
   - `security`
   - `anti-raid`
   - `moderation`
   - `nodejs`

### 4. Choisir la Visibilité

- **Public** : Tout le monde peut voir et utiliser le code
- **Private** : Seulement vous et les collaborateurs peuvent y accéder

## 📝 Configuration GitHub

### 1. Activer GitHub Actions

Les workflows GitHub Actions sont déjà configurés dans `.github/workflows/`. Ils s'activeront automatiquement.

### 2. Configurer les Issues

Les templates d'issues sont déjà créés dans `.github/ISSUE_TEMPLATE/`. Ils apparaîtront automatiquement quand quelqu'un crée une issue.

### 3. Configurer les Pull Requests

Le template de PR est déjà créé dans `.github/PULL_REQUEST_TEMPLATE.md`.

### 4. Ajouter des Collaborateurs (Optionnel)

1. Allez dans "Settings" > "Collaborators"
2. Cliquez sur "Add people"
3. Entrez le nom d'utilisateur GitHub
4. Invitez-les

## 🏷️ Créer une Release

Pour créer une release :

1. Allez sur "Releases" > "Create a new release"
2. Créez un nouveau tag (ex: `v1.0.0`)
3. Ajoutez un titre : "Version 1.0.0"
4. Ajoutez une description :

```markdown
## 🎉 Première Release

### ✨ Nouveautés
- 18 systèmes de sécurité
- Panel de contrôle web
- Protection contre 34+ types d'attaques
- Configuration via .env

### 📋 Systèmes Inclus
- Anti-Raid
- Anti-Spam
- Anti-Phishing
- Anti-Nuke
- Et 14 autres systèmes...

### 📚 Documentation
Consultez README.md pour l'installation et SETUP.md pour la configuration.
```

5. Publish la release

## 🔐 Sécurité GitHub

### Secrets GitHub (pour CI/CD)

Si vous voulez utiliser GitHub Actions avec des secrets :

1. Allez dans "Settings" > "Secrets and variables" > "Actions"
2. Ajoutez les secrets nécessaires :
   - `DISCORD_TOKEN` : Token du bot de test
   - `LOG_CHANNEL_ID` : ID du channel de test

### GitHub Security Advisories

Pour signaler une vulnérabilité :

1. Allez dans "Security" > "Advisories"
2. Créez une nouvelle advisory
3. Décrivez la vulnérabilité

## 📊 Statistiques et Insights

Une fois votre repository sur GitHub, vous pouvez :

- Voir les statistiques dans "Insights"
- Voir le trafic dans "Insights" > "Traffic"
- Voir les contributions dans "Insights" > "Contributors"

## 🌟 Badges GitHub

Votre README contient déjà des badges. Ils s'afficheront automatiquement une fois le repository publié.

## ✅ Checklist Finale

Avant de publier, vérifiez :

- [ ] Aucun token dans le code
- [ ] `.env` est dans `.gitignore`
- [ ] `config.json` est dans `.gitignore`
- [ ] `package.json` a les bonnes URLs
- [ ] `README.md` est complet
- [ ] `LICENSE` existe
- [ ] `CONTRIBUTING.md` existe
- [ ] Tous les fichiers sont commités
- [ ] Le push fonctionne sans erreur

## 🎉 C'est Prêt !

Votre bot de sécurité Discord est maintenant sur GitHub ! 🚀

N'oubliez pas de :
- ⭐ Star le projet si vous le trouvez utile
- 📢 Partager le lien avec d'autres
- 🤝 Accepter les contributions
- 📝 Mettre à jour la documentation

## 🆘 Dépannage

### Erreur : "remote origin already exists"

```bash
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/discord-security-bot.git
```

### Erreur : "fatal: refusing to merge unrelated histories"

```bash
git pull origin main --allow-unrelated-histories
```

### Supprimer un fichier commité par erreur

```bash
# Retirer le fichier du tracking Git (mais le garder localement)
git rm --cached config.json
git rm --cached .env

# Commit les changements
git commit -m "Remove sensitive files from tracking"

# Push
git push
```
