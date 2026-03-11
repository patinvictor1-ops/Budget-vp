# Budget VP — PWA

## Déploiement sur GitHub Pages (gratuit, 5 minutes)

### 1. Créer un compte GitHub
→ https://github.com/signup (si pas encore fait)

### 2. Créer un nouveau repository
1. https://github.com/new
2. Nom : `budget-vp` (ou ce que tu veux)
3. Cocher **Public**
4. Cliquer **Create repository**

### 3. Uploader les fichiers
Dans le repository vide, clique **"uploading an existing file"** puis glisse-dépose :
- index.html
- app.js
- manifest.json
- sw.js
- icon-192.png
- icon-512.png

Puis clic **Commit changes**

### 4. Activer GitHub Pages
1. Settings → Pages
2. Source : **Deploy from a branch**
3. Branch : **main** / **(root)**
4. Save

→ Ton URL sera : `https://TON-PSEUDO.github.io/budget-vp/`

### 5. Installer sur iPhone
1. Ouvre l'URL dans **Safari**
2. Bouton Partager (carré ↑)
3. **"Sur l'écran d'accueil"**
4. ✅ L'app s'installe comme une vraie app native

### 5b. Installer sur Android
1. Ouvre l'URL dans **Chrome**
2. Menu ⋮ → **"Ajouter à l'écran d'accueil"**
3. Ou la bannière d'installation apparaît automatiquement

## Fonctionnalités
- ✅ Toutes les données sauvegardées localement (localStorage)
- ✅ Fonctionne hors-ligne (service worker)
- ✅ Plein écran, pas de barre de navigation du navigateur
- ✅ Icône sur l'écran d'accueil
- ✅ 5 onglets : Tableau de bord, Dépenses, Projection, Ameublement, Projets
