# 🎛️ Panel de Contrôle - Bot de Sécurité Discord

Interface web moderne pour gérer tous les systèmes de sécurité du bot.

## 🚀 Démarrage

### 1. Installer les dépendances

```bash
npm install
```

### 2. Démarrer le panel

```bash
npm run panel
```

Le panel sera accessible sur : **http://localhost:3000**

### 3. Démarrer le bot et le panel ensemble

Vous pouvez démarrer le bot et le panel en même temps en utilisant deux terminaux :

**Terminal 1 - Bot :**
```bash
npm start
```

**Terminal 2 - Panel :**
```bash
npm run panel
```

## 📋 Fonctionnalités

### Interface Moderne
- ✅ Design moderne et responsive
- ✅ Cartes interactives pour chaque système
- ✅ Statistiques en temps réel
- ✅ Recherche et filtres

### Gestion des Systèmes
- ✅ Activer/Désactiver chaque système
- ✅ Voir les fonctionnalités de chaque système
- ✅ Statistiques (actifs/inactifs)
- ✅ Catégorisation des systèmes

### Systèmes Disponibles

#### Protection Principale
- 🛡️ Anti-Raid
- 🚫 Anti-Spam
- 🔒 Anti-Phishing
- 💣 Anti-Nuke

#### Protection Avancée
- 🧠 Analyse Comportementale
- ⏱️ Rate Limiting
- 🔗 Anti-Webhook
- 😀 Anti-Emoji
- 🤖 Anti-Selfbot
- 🔌 Anti-Integration
- 📁 Anti-File
- 🧵 Anti-Thread
- 👍 Anti-Reaction Spam
- 📄 Anti-Embed Abuse

#### Modération
- 🤖 Auto-Modération
- 📋 Whitelist/Blacklist

#### Protection Critique
- 🔐 Anti-Token Grabber

## 🎨 Interface

L'interface comprend :
- **Header** : Titre et statistiques globales
- **Recherche** : Barre de recherche pour filtrer les systèmes
- **Filtres** : Boutons pour filtrer par catégorie
- **Grille de systèmes** : Cartes interactives pour chaque système

## 🔧 Configuration

Le panel lit et modifie directement le fichier `config.json`. Toutes les modifications sont sauvegardées automatiquement.

## 📱 Responsive

L'interface est entièrement responsive et fonctionne sur :
- 💻 Desktop
- 📱 Tablette
- 📱 Mobile

## 🔒 Sécurité

⚠️ **Note** : Le panel est actuellement accessible localement uniquement. Pour une utilisation en production, ajoutez une authentification.

## 🛠️ Personnalisation

Vous pouvez personnaliser :
- Les couleurs dans `styles.css` (variables CSS)
- Les systèmes dans `server.js` (route `/api/systems`)
- Le design dans `index.html` et `styles.css`
