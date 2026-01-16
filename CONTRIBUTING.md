# 🤝 Guide de Contribution

Merci de votre intérêt pour contribuer au Bot de Sécurité Discord ! Ce document fournit des directives pour contribuer au projet.

## 📋 Table des Matières

- [Code de Conduite](#code-de-conduite)
- [Comment Contribuer](#comment-contribuer)
- [Processus de Développement](#processus-de-développement)
- [Standards de Code](#standards-de-code)
- [Créer une Pull Request](#créer-une-pull-request)

## 📜 Code de Conduite

En participant à ce projet, vous acceptez de respecter notre Code de Conduite :
- Soyez respectueux et inclusif
- Acceptez les critiques constructives
- Concentrez-vous sur ce qui est meilleur pour la communauté

## 🚀 Comment Contribuer

### Signaler un Bug

1. Vérifiez que le bug n'a pas déjà été signalé dans les [Issues](https://github.com/yourusername/discord-security-bot/issues)
2. Créez une nouvelle issue avec le template "Bug Report"
3. Incluez :
   - Description claire du bug
   - Steps pour reproduire
   - Comportement attendu vs comportement actuel
   - Version de Node.js et discord.js
   - Logs d'erreur (si applicable)

### Proposer une Fonctionnalité

1. Vérifiez que la fonctionnalité n'a pas déjà été proposée
2. Créez une nouvelle issue avec le template "Feature Request"
3. Décrivez :
   - Le problème que cela résout
   - Votre solution proposée
   - Alternatives considérées
   - Impact sur les utilisateurs existants

### Contribuer au Code

1. Fork le repository
2. Créez une branche pour votre fonctionnalité (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 💻 Processus de Développement

### Configuration de l'Environnement

1. Clonez votre fork :
   ```bash
   git clone https://github.com/yourusername/discord-security-bot.git
   cd discord-security-bot
   ```

2. Installez les dépendances :
   ```bash
   npm install
   ```

3. Configurez le projet :
   ```bash
   cp .env.example .env
   cp config.example.json config.json
   ```
   Remplissez `.env` avec vos informations (ne commitez pas ce fichier !)

4. Testez le bot :
   ```bash
   npm start
   ```

### Structure du Projet

```
discord-security-bot/
├── commands/          # Commandes Discord
├── handlers/          # Gestionnaires d'événements
├── systems/           # Systèmes de sécurité
├── utils/             # Utilitaires
├── panel/             # Panel de contrôle web
└── index.js          # Point d'entrée principal
```

## 📐 Standards de Code

### Style de Code

- Utilisez des noms de variables/fonctions descriptifs en anglais
- Suivez le style ES6+ (arrow functions, destructuring, etc.)
- Ajoutez des commentaires pour le code complexe
- Utilisez 2 espaces pour l'indentation

### Exemple de Code

```javascript
// ✅ Bon
async function handleMessage(message) {
  if (!message.guild || message.author.bot) return;
  
  const userId = message.author.id;
  // ... traitement
}

// ❌ Éviter
async function msg(m) {
  if(!m.guild||m.author.bot)return;
  // ...
}
```

### Naming Conventions

- **Classes** : PascalCase (`AntiRaidSystem`)
- **Fonctions/Variables** : camelCase (`handleMessage`, `userId`)
- **Constantes** : UPPER_SNAKE_CASE (`MAX_RETRIES`)
- **Fichiers** : PascalCase pour classes (`AntiRaidSystem.js`)

### Commentaires

- Expliquez le "pourquoi", pas le "quoi"
- Utilisez des commentaires JSDoc pour les fonctions publiques
- Gardez les commentaires à jour avec le code

## 🔍 Créer une Pull Request

### Checklist Avant de Soumettre

- [ ] Le code suit les standards du projet
- [ ] Les tests passent (si applicable)
- [ ] La documentation a été mise à jour
- [ ] Aucun fichier sensible (.env, config.json) n'est inclus
- [ ] Les messages de commit sont clairs et descriptifs

### Format de Commit

Utilisez des préfixes clairs :
- `feat:` Nouvelle fonctionnalité
- `fix:` Correction de bug
- `docs:` Documentation
- `style:` Formatage, point-virgule manquant, etc.
- `refactor:` Refactorisation du code
- `test:` Ajout/modification de tests
- `chore:` Tâches de maintenance

Exemples :
```
feat: Add anti-invite spam detection
fix: Resolve memory leak in AntiSpamSystem
docs: Update setup instructions
```

### Description de PR

Incluez :
- **Résumé** : Description courte de ce qui a changé
- **Type** : feat/fix/docs/etc.
- **Détails** : Explication détaillée des changements
- **Tests** : Comment tester les changements
- **Capture d'écran** : Si applicable (pour l'UI)

## 🧪 Tests

Avant de soumettre :
1. Testez votre code localement
2. Vérifiez que tous les systèmes fonctionnent
3. Testez les cas limites
4. Vérifiez qu'il n'y a pas de régressions

## 📚 Documentation

- Mettez à jour le README si nécessaire
- Ajoutez des commentaires JSDoc pour les nouvelles fonctions
- Mettez à jour les guides si vous changez le comportement

## ❓ Questions ?

N'hésitez pas à :
- Ouvrir une issue pour poser une question
- Contacter les mainteneurs
- Consulter la documentation existante

Merci de contribuer ! 🎉
