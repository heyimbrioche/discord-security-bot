# 🔧 Résolution des Avertissements Node.js

## ⚠️ MaxListenersExceededWarning

### Problème
```
MaxListenersExceededWarning: Possible EventEmitter memory leak detected. 
11 messageCreate listeners added to [Client]. MaxListeners is 10.
```

### Cause
Plusieurs systèmes de sécurité écoutent l'événement `messageCreate` (Anti-Raid, Anti-Spam, Anti-Phishing, etc.), ce qui dépasse la limite par défaut de 10 listeners.

### Solution
La limite de listeners a été augmentée à 20 dans `index.js` :

```javascript
client.setMaxListeners(20);
```

C'est normal et attendu d'avoir plusieurs systèmes qui écoutent les mêmes événements pour la sécurité.

## ⚠️ DeprecationWarning - ready event

### Problème
```
DeprecationWarning: The ready event has been renamed to clientReady to distinguish 
it from the gateway READY event and will only emit under that name in v15.
```

### Cause
Discord.js v14 a renommé l'événement `ready` en `clientReady` pour éviter les conflits avec l'événement gateway READY.

### Solution
Tous les listeners `ready` ont été remplacés par `clientReady` :
- `index.js` : `client.once('clientReady', ...)`
- `handlers/EventHandler.js` : `client.on('clientReady', ...)`

## ✅ Corrections Appliquées

1. ✅ **MaxListeners augmenté** : De 10 à 20 listeners
2. ✅ **Événement ready remplacé** : `ready` → `clientReady`
3. ✅ **Compatibilité future** : Prêt pour Discord.js v15

## 📋 Systèmes Écoutant messageCreate

Voici tous les systèmes qui écoutent `messageCreate` (c'est normal) :

1. AntiRaidSystem
2. AntiSpamSystem
3. AntiPhishingSystem
4. AntiWebhookSystem
5. AntiEmojiSystem
6. AntiSelfbotSystem
7. AntiFileSystem
8. AntiEmbedAbuseSystem
9. AntiTokenGrabberSystem
10. AutoModerationSystem
11. WhitelistBlacklistSystem
12. BehaviorAnalysisSystem
13. RateLimitSystem

Total : 13 listeners (au-dessus de la limite par défaut, d'où l'augmentation)

## 🔍 Vérification

Après les corrections, ces warnings ne devraient plus apparaître au démarrage du bot.

Si vous voyez encore des warnings :
1. Redémarrez le bot complètement
2. Vérifiez que vous utilisez la dernière version du code
3. Assurez-vous que tous les fichiers sont bien sauvegardés
