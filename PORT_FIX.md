# 🔧 Résoudre l'Erreur "Port 3000 Already in Use"

Si vous obtenez l'erreur `EADDRINUSE: address already in use :::3000`, voici comment la résoudre.

## 🔍 Solution 1 : Tuer le Processus sur le Port 3000

### Sur Windows (PowerShell) :

```powershell
# Trouver le processus utilisant le port 3000
netstat -ano | findstr :3000

# Notez le PID (dernier nombre), puis tuez-le :
Stop-Process -Id <PID> -Force

# Ou en une seule commande :
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process -Force
```

### Sur Linux/Mac :

```bash
# Trouver et tuer le processus
lsof -ti:3000 | xargs kill -9

# Ou
fuser -k 3000/tcp
```

## 🔄 Solution 2 : Utiliser un Autre Port

Le panel peut maintenant utiliser un port différent via les variables d'environnement.

### Option A : Modifier `.env`

Ajoutez dans votre fichier `.env` :

```env
PANEL_PORT=3001
```

Puis redémarrez le panel :

```bash
npm run panel
```

### Option B : Utiliser la Variable d'Environnement Temporaire

**Windows (PowerShell) :**
```powershell
$env:PANEL_PORT=3001; npm run panel
```

**Windows (CMD) :**
```cmd
set PANEL_PORT=3001 && npm run panel
```

**Linux/Mac :**
```bash
PANEL_PORT=3001 npm run panel
```

## 🚀 Solution 3 : Port Automatique (Recommandé)

Le serveur essaiera maintenant automatiquement d'utiliser un port différent si 3000 est occupé. Vous pouvez toujours forcer un port spécifique avec `PANEL_PORT`.

## 📋 Vérifier les Ports Utilisés

### Windows :
```powershell
netstat -ano | findstr LISTENING
```

### Linux/Mac :
```bash
lsof -i -P -n | grep LISTEN
```

## ⚠️ Note

Si vous utilisez un port différent, n'oubliez pas de mettre à jour l'URL dans votre navigateur :
- Port 3000 : http://localhost:3000
- Port 3001 : http://localhost:3001
- etc.
