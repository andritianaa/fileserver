# 🚀 Guide de Démarrage Rapide

## Installation Express (5 minutes)

### 1️⃣ Installer Node.js
```bash
# Vérifier si Node.js est installé
node --version

# Si pas installé, télécharger depuis https://nodejs.org
# ou avec nvm:
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 20
```

### 2️⃣ Installer les dépendances
```bash
npm install
```

### 3️⃣ Configuration (optionnel)
```bash
cp .env.example .env
# Modifier .env si nécessaire
```

### 4️⃣ Démarrer le serveur
```bash
# Mode développement (avec auto-reload)
npm run dev

# Ou mode production
npm start
```

✅ Votre serveur est maintenant disponible sur http://localhost:3001

## 🧪 Test Rapide

### Option 1: Interface Web
Ouvrir `test.html` dans votre navigateur et glisser-déposer une image.

### Option 2: cURL
```bash
# Upload
curl -X POST http://localhost:3001/upload \
  -F "file=@/path/to/image.jpg"

# Récupérer l'image
curl http://localhost:3001/files/[filename]

# Récupérer avec redimensionnement
curl http://localhost:3001/files/[filename]?width=400
```

### Option 3: Intégration React
```javascript
import { useMediaUpload } from "@/hooks/useMediaUpload";

function MyComponent() {
  const { uploadFile, isUploading } = useMediaUpload();

  const handleUpload = async (file) => {
    const result = await uploadFile(file);
    if (result) {
      console.log("URL:", result.url);
      // Utiliser: <img src={`${result.url}?width=800`} />
    }
  };

  return (
    <input 
      type="file" 
      onChange={(e) => {
        const file = e.target.files?.[0];
        if (file) handleUpload(file);
      }} 
    />
  );
}
```

## 📋 Checklist de Déploiement

- [ ] Installer Node.js (v18+)
- [ ] Cloner/copier le projet
- [ ] Installer les dépendances (`npm install`)
- [ ] Configurer `.env` avec votre BASE_URL de production
- [ ] Tester localement (`npm start`)
- [ ] Configurer le reverse proxy (nginx, caddy, etc.)
- [ ] Configurer SSL/HTTPS
- [ ] Utiliser PM2 ou systemd pour la production

## 🐳 Déploiement Docker (Recommandé)

```bash
# Simple et rapide
docker-compose up -d

# Vérifier les logs
docker-compose logs -f

# Arrêter
docker-compose down
```

## 🔧 Configuration NGINX (Production)

```nginx
server {
    listen 80;
    server_name files.votredomaine.com;

    client_max_body_size 50M;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

## 🛠️ Déploiement avec PM2 (Process Manager)

```bash
# Installer PM2 globalement
npm install -g pm2

# Démarrer l'application
pm2 start server.js --name file-server

# Voir le statut
pm2 status

# Voir les logs
pm2 logs file-server

# Redémarrer
pm2 restart file-server

# Arrêter
pm2 stop file-server

# Configuration auto-start au démarrage du serveur
pm2 startup
pm2 save
```

## 💡 Conseils

1. **Pour le développement**: Utilisez `npm run dev` pour le hot reload avec nodemon
2. **Pour la production**: Utilisez Docker ou PM2
3. **Sécurité**: Configurez un reverse proxy avec HTTPS
4. **Performance**: Activez la compression gzip dans votre reverse proxy
5. **Backup**: Sauvegardez régulièrement le dossier `files/`

## ❓ Problèmes Courants

### Le serveur ne démarre pas
```bash
# Vérifier si le port est disponible
lsof -i :3001

# Essayer un autre port
PORT=3002 npm start
```

### Erreur lors de l'installation de Sharp
```bash
# Sur Linux, installer les dépendances système
sudo apt-get install build-essential libvips-dev

# Sur Mac
brew install vips

# Réinstaller sharp
npm rebuild sharp
```

### Les fichiers ne s'uploadent pas
- Vérifier la taille du fichier (< 50MB par défaut)
- Vérifier les permissions du dossier `files/`
- Vérifier les CORS si vous appelez depuis un autre domaine

### Les images ne se redimensionnent pas
- Vérifier que Sharp est bien installé (`npm list sharp`)
- Vérifier que le fichier est bien une image
- Vérifier le paramètre `width` dans l'URL

## 📞 Support

Si vous rencontrez des problèmes, vérifiez:
1. Les logs du serveur
2. La configuration dans `.env`
3. Les permissions du dossier `files/`
4. La documentation complète dans `README.md`

## 🚀 Déploiement sur différentes plateformes

### Heroku
```bash
# Ajouter un Procfile
echo "web: node server.js" > Procfile

# Deploy
git push heroku main
```

### Railway / Render
Configurez simplement:
- Build Command: `npm install`
- Start Command: `node server.js`
- Port: 3001

### VPS (DigitalOcean, Linode, etc.)
Utilisez PM2 ou systemd comme décrit ci-dessus.