# 🔧 Résoudre l'Erreur d'Email GitHub

Si vous obtenez l'erreur : `GH007: Your push would publish a private email address`

## ✅ Solution 1 : Utiliser l'Email GitHub No-Reply (Recommandé)

### Pour ce repository uniquement :

```bash
# Utiliser votre email GitHub no-reply (remplacez heyimbrioche par votre username)
git config user.email "heyimbrioche@users.noreply.github.com"

# Ou utiliser votre ID GitHub (trouvable sur https://github.com/settings/emails)
git config user.email "12345678+heyimbrioche@users.noreply.github.com"
```

### Pour tous vos repositories :

```bash
git config --global user.email "heyimbrioche@users.noreply.github.com"
```

## ✅ Solution 2 : Rendre Votre Email Public sur GitHub

1. Allez sur https://github.com/settings/emails
2. Cochez "Keep my email addresses private" pour le désactiver
3. OU cochez "Block command line pushes that expose my email" pour le désactiver

## ✅ Solution 3 : Réécrire l'Historique Git (Si vous avez déjà commité)

Si vous avez déjà fait des commits avec votre email privé, réécrivez l'historique :

```bash
# Réécrire tous les commits pour utiliser l'email no-reply
git filter-branch --env-filter '
OLD_EMAIL="cbynth59@gmail.com"
CORRECT_NAME="heyimbrioche"
CORRECT_EMAIL="heyimbrioche@users.noreply.github.com"

if [ "$GIT_COMMITTER_EMAIL" = "$OLD_EMAIL" ]
then
    export GIT_COMMITTER_NAME="$CORRECT_NAME"
    export GIT_COMMITTER_EMAIL="$CORRECT_EMAIL"
fi
if [ "$GIT_AUTHOR_EMAIL" = "$OLD_EMAIL" ]
then
    export GIT_AUTHOR_NAME="$CORRECT_NAME"
    export GIT_AUTHOR_EMAIL="$CORRECT_EMAIL"
fi
' --tag-name-filter cat -- --branches --tags
```

Puis forcez le push :

```bash
git push --force --tags origin 'refs/heads/*'
```

## 🚀 Solution Rapide (Pour Votre Cas)

Exécutez ces commandes :

```bash
# 1. Configurer l'email pour ce repository
git config user.email "heyimbrioche@users.noreply.github.com"

# 2. Réécrire le dernier commit avec le nouvel email
git commit --amend --reset-author --no-edit

# 3. Push vers GitHub
git push origin main
```

Si vous avez déjà push et que cela ne fonctionne pas, utilisez `--force` :

```bash
git push --force origin main
```

## 📋 Trouver Votre Email GitHub No-Reply

1. Allez sur https://github.com/settings/emails
2. Vous verrez votre email no-reply au format :
   - `username@users.noreply.github.com`
   - Ou `ID+username@users.noreply.github.com`

## ⚠️ Note Importante

Si vous utilisez `--force`, assurez-vous que personne d'autre n'a cloné le repository, car cela réécrit l'historique.
