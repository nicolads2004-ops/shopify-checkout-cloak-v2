# Guide de Déploiement - Shopify Checkout Rotator

Ce guide vous accompagne dans le déploiement de l'application en production.

## 🎯 Options de Déploiement

### Option 1 : Vercel (Recommandé)

Vercel est la plateforme idéale pour Next.js avec déploiement automatique.

#### Étapes de déploiement

1. **Préparer le repository Git**

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/votre-username/shopify-checkout-rotator.git
git push -u origin main
```

2. **Créer un compte Vercel**
   - Allez sur [vercel.com](https://vercel.com)
   - Connectez-vous avec GitHub

3. **Importer le projet**
   - Cliquez sur "New Project"
   - Sélectionnez votre repository
   - Vercel détectera automatiquement Next.js

4. **Configurer les variables d'environnement**

Dans les paramètres du projet Vercel, ajoutez :

```env
DATABASE_URL=postgresql://user:password@host:5432/database
ADMIN_SECRET_KEY=votre-cle-secrete-production
NEXT_PUBLIC_BASE_URL=https://votre-domaine.vercel.app
```

5. **Configurer la base de données**

Option A - Vercel Postgres :
```bash
vercel postgres create
```

Option B - Base externe (Supabase, Railway, etc.) :
- Créez une base PostgreSQL
- Copiez l'URL de connexion dans `DATABASE_URL`

6. **Déployer**

```bash
vercel --prod
```

#### Post-déploiement

```bash
# Exécuter les migrations
vercel env pull .env.production
npx prisma migrate deploy
```

### Option 2 : Railway

1. **Créer un compte sur [railway.app](https://railway.app)**

2. **Créer un nouveau projet**
   - "New Project" > "Deploy from GitHub repo"
   - Sélectionnez votre repository

3. **Ajouter PostgreSQL**
   - "New" > "Database" > "Add PostgreSQL"
   - Railway génère automatiquement `DATABASE_URL`

4. **Configurer les variables**
   - Ajoutez les autres variables d'environnement
   - Railway détecte automatiquement Next.js

5. **Déployer**
   - Le déploiement se fait automatiquement à chaque push

### Option 3 : DigitalOcean App Platform

1. **Créer une app**
   - Connectez votre repository GitHub
   - Sélectionnez la branche à déployer

2. **Configurer le build**
   - Build Command: `npm run build`
   - Run Command: `npm start`

3. **Ajouter une base de données**
   - Créez un cluster PostgreSQL
   - Liez-le à votre app

4. **Variables d'environnement**
   - Ajoutez toutes les variables nécessaires

### Option 4 : VPS (Ubuntu/Debian)

#### Prérequis
- Serveur avec Ubuntu 20.04+
- Nom de domaine configuré
- Accès SSH root

#### Installation

```bash
# Mettre à jour le système
sudo apt update && sudo apt upgrade -y

# Installer Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Installer PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Installer PM2
sudo npm install -g pm2

# Cloner le projet
git clone https://github.com/votre-username/shopify-checkout-rotator.git
cd shopify-checkout-rotator

# Installer les dépendances
npm install

# Configurer PostgreSQL
sudo -u postgres psql
CREATE DATABASE shopify_rotator;
CREATE USER shopify_user WITH PASSWORD 'mot-de-passe-securise';
GRANT ALL PRIVILEGES ON DATABASE shopify_rotator TO shopify_user;
\q

# Créer le fichier .env
nano .env
# Coller vos variables d'environnement

# Générer Prisma et migrer
npx prisma generate
npx prisma migrate deploy

# Build l'application
npm run build

# Démarrer avec PM2
pm2 start npm --name "shopify-rotator" -- start
pm2 save
pm2 startup
```

#### Configurer Nginx

```bash
sudo apt install -y nginx

# Créer la configuration
sudo nano /etc/nginx/sites-available/shopify-rotator
```

Contenu du fichier :

```nginx
server {
    listen 80;
    server_name votre-domaine.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Activer le site
sudo ln -s /etc/nginx/sites-available/shopify-rotator /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Installer SSL avec Let's Encrypt
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d votre-domaine.com
```

## 🔐 Sécurité en Production

### 1. Variables d'environnement

Ne commitez JAMAIS les fichiers `.env`. Utilisez :

```bash
# .gitignore
.env
.env.local
.env.production
```

### 2. Clés secrètes

Générez des clés fortes :

```bash
# Générer une clé aléatoire
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. CORS et Headers

Dans `next.config.js` :

```javascript
module.exports = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
        ],
      },
    ]
  },
}
```

### 4. Rate Limiting

Installez `express-rate-limit` pour protéger les API :

```bash
npm install express-rate-limit
```

## 📊 Monitoring

### Logs avec PM2

```bash
pm2 logs shopify-rotator
pm2 monit
```

### Prisma Studio en production

```bash
# Tunnel SSH
ssh -L 5555:localhost:5555 user@votre-serveur

# Sur le serveur
npx prisma studio

# Accédez à http://localhost:5555 localement
```

### Sentry (Optionnel)

1. Créez un compte sur [sentry.io](https://sentry.io)
2. Installez le SDK :

```bash
npm install @sentry/nextjs
```

3. Configurez dans `sentry.client.config.js` et `sentry.server.config.js`

## 🔄 Mises à jour

### Déploiement continu (Vercel/Railway)

Les mises à jour sont automatiques à chaque push sur la branche principale.

### Mise à jour manuelle (VPS)

```bash
cd shopify-checkout-rotator
git pull origin main
npm install
npx prisma migrate deploy
npm run build
pm2 restart shopify-rotator
```

## 🗄️ Backup de la base de données

### Backup automatique

```bash
# Créer un script de backup
nano /home/user/backup-db.sh
```

Contenu :

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump shopify_rotator > /home/user/backups/db_$DATE.sql
find /home/user/backups -name "db_*.sql" -mtime +7 -delete
```

```bash
chmod +x /home/user/backup-db.sh

# Ajouter au crontab (tous les jours à 2h)
crontab -e
0 2 * * * /home/user/backup-db.sh
```

### Restauration

```bash
psql shopify_rotator < backup.sql
```

## 🚨 Troubleshooting Production

### L'application ne démarre pas

```bash
# Vérifier les logs
pm2 logs shopify-rotator --lines 100

# Vérifier les variables d'environnement
pm2 env 0
```

### Erreurs de base de données

```bash
# Vérifier la connexion
psql $DATABASE_URL

# Réinitialiser Prisma
npx prisma generate
npx prisma migrate deploy
```

### Problèmes de performance

```bash
# Analyser avec PM2
pm2 monit

# Augmenter les ressources
pm2 scale shopify-rotator 2  # 2 instances
```

## 📈 Optimisations

### 1. Cache

Activez le cache Next.js :

```javascript
// next.config.js
module.exports = {
  swcMinify: true,
  compress: true,
}
```

### 2. Images

Utilisez Next.js Image Optimization :

```jsx
import Image from 'next/image'

<Image src={url} width={500} height={500} alt="Product" />
```

### 3. Database Connection Pooling

Utilisez PgBouncer ou configurez Prisma :

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  relationMode = "prisma"
}
```

## ✅ Checklist de déploiement

- [ ] Variables d'environnement configurées
- [ ] Base de données créée et migrée
- [ ] SSL/HTTPS activé
- [ ] Webhooks Shopify configurés
- [ ] Backups automatiques configurés
- [ ] Monitoring en place
- [ ] Tests de rotation effectués
- [ ] Documentation à jour

---

Votre application est maintenant prête pour la production ! 🚀
