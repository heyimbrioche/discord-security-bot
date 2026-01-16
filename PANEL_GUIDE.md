# 🎛️ Guide du Panel de Contrôle

## 📖 Vue d'ensemble

Le panel de contrôle est une interface web moderne qui vous permet de gérer tous les systèmes de sécurité du bot Discord de manière visuelle et intuitive.

## 🚀 Démarrage Rapide

### Étape 1 : Installer les dépendances

```bash
npm install
```

### Étape 2 : Démarrer le panel

```bash
npm run panel
```

### Étape 3 : Ouvrir dans le navigateur

Ouvrez votre navigateur et allez sur : **http://localhost:3000**

## 🎨 Utilisation de l'Interface

### Statistiques Globales

En haut de la page, vous verrez :
- **Total de systèmes** : Nombre total de systèmes disponibles
- **Systèmes actifs** : Nombre de systèmes actuellement activés
- **Systèmes inactifs** : Nombre de systèmes désactivés

### Recherche

Utilisez la barre de recherche pour trouver rapidement un système par :
- Nom du système
- Description
- Fonctionnalités

### Filtres

Cliquez sur les boutons de filtre pour afficher uniquement :
- **Tous** : Tous les systèmes
- **Protection Principale** : Systèmes de protection de base
- **Protection Avancée** : Systèmes de protection avancés
- **Modération** : Systèmes de modération
- **Protection Critique** : Systèmes de protection critiques

### Cartes Système

Chaque système est affiché dans une carte qui contient :
- **Icône** : Emoji représentant le système
- **Nom** : Nom du système
- **Catégorie** : Catégorie du système
- **Description** : Description détaillée
- **Fonctionnalités** : Liste des fonctionnalités
- **Toggle** : Interrupteur pour activer/désactiver

### Activer/Désactiver un Système

1. Trouvez le système que vous voulez modifier
2. Cliquez sur l'interrupteur (toggle) à droite de la carte
3. Le système sera immédiatement activé ou désactivé
4. La configuration est sauvegardée automatiquement

## 📋 Systèmes Disponibles

### Protection Principale

#### 🛡️ Anti-Raid
Protection contre les raids de serveur
- Détection de création excessive de channels
- Détection de création excessive de rôles
- Détection de bannissements/kicks massifs
- Protection contre les mentions massives

#### 🚫 Anti-Spam
Protection contre le spam de messages
- Détection de messages répétitifs
- Détection de caractères répétitifs
- Limitation de messages par période

#### 🔒 Anti-Phishing
Protection contre les liens de phishing
- Base de données de domaines suspects
- Détection de typosquatting
- Protection contre les scams Discord Nitro

#### 💣 Anti-Nuke
Protection contre les tentatives de nuke
- Détection de changements de permissions suspects
- Protection contre la suppression massive
- Bannissement immédiat

### Protection Avancée

#### 🧠 Analyse Comportementale
Analyse comportementale en temps réel
- Détection de nouveaux comptes suspects
- Analyse de patterns comportementaux
- Système de scoring de suspicion

#### ⏱️ Rate Limiting
Rate limiting global par utilisateur
- Tracking de toutes les actions
- Limitation par utilisateur
- Timeout automatique

#### 🔗 Anti-Webhook
Protection contre les webhooks malveillants
- Détection de création excessive
- Détection de spam via webhooks

#### 😀 Anti-Emoji
Protection contre le spam d'emojis
- Limitation de création d'emojis
- Détection de messages avec trop d'emojis

#### 🤖 Anti-Selfbot
Détection avancée des selfbots
- Analyse de patterns comportementaux
- Détection de timing trop régulier

#### 🔌 Anti-Integration
Protection contre les intégrations malveillantes
- Liste noire d'applications suspectes
- Détection de création excessive

#### 📁 Anti-File
Protection contre les fichiers dangereux
- Détection d'extensions malveillantes
- Limitation de taille de fichiers

#### 🧵 Anti-Thread
Protection contre le spam de threads
- Limitation de création de threads

#### 👍 Anti-Reaction Spam
Protection contre le spam de réactions
- Détection de réactions massives

#### 📄 Anti-Embed Abuse
Protection contre l'abus d'embeds
- Limitation du nombre d'embeds
- Détection d'embeds suspects

### Modération

#### 🤖 Auto-Modération
Modération automatique de contenu
- Filtrage de mots interdits
- Détection de messages en majuscules

#### 📋 Whitelist/Blacklist
Système de whitelist et blacklist
- Whitelist pour accès restreint
- Blacklist automatique

### Protection Critique

#### 🔐 Anti-Token Grabber
Protection contre les token grabbers
- Détection de tokens Discord exposés
- Détection de liens de token grabber
- Suppression immédiate

## 💡 Conseils

1. **Activez tous les systèmes de Protection Principale** pour une sécurité de base
2. **Activez les systèmes de Protection Avancée** selon vos besoins
3. **Surveillez les statistiques** pour voir l'état global
4. **Utilisez la recherche** pour trouver rapidement un système
5. **Testez les systèmes** un par un pour voir leur effet

## 🔄 Redémarrage du Bot

Après avoir modifié les systèmes via le panel, vous devrez redémarrer le bot pour que les changements prennent effet :

```bash
# Arrêter le bot (Ctrl+C)
# Puis redémarrer
npm start
```

## 🐛 Dépannage

### Le panel ne démarre pas
- Vérifiez que les dépendances sont installées : `npm install`
- Vérifiez que le port 3000 n'est pas utilisé

### Les modifications ne sont pas sauvegardées
- Vérifiez que le fichier `config.json` existe
- Vérifiez les permissions d'écriture

### Le bot ne prend pas en compte les changements
- Redémarrez le bot après avoir modifié les systèmes
- Vérifiez que le fichier `config.json` est bien lu par le bot

## 📞 Support

Pour toute question ou problème, consultez :
- `README.md` - Documentation principale
- `SETUP.md` - Guide d'installation
- `FEATURES.md` - Liste des fonctionnalités
