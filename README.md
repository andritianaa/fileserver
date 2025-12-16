# 📁 Express File Server

Serveur de fichiers performant avec Express.js, supportant l'upload, le stockage et le redimensionnement automatique d'images.

## ✨ Fonctionnalités

- ⚡ Upload de fichiers rapide avec Multer
- 🖼️ Redimensionnement d'images à la volée avec Sharp
- 📦 Stockage dans un dossier public
- 🔄 Support CORS pour les requêtes cross-origin
- 🎯 Compatible avec le hook `useMediaUpload`
- 💾 Cache automatique des fichiers
- 🔒 Validation de la taille des fichiers

## 🚀 Installation

```bash
# Installer les dépendances
npm install

# Ou avec yarn
yarn install
```

## ⚙️ Configuration

Copier `.env.example` vers `.env` et ajuster les valeurs :

```bash
cp .env.example .env
```

Variables disponibles :
- `PORT` : Port du serveur (défaut: 3001)
- `BASE_URL` : URL de base pour les liens (défaut: http://localhost:3001)
- `UPLOAD_DIR` : Dossier de stockage (défaut: ./files)
- `MAX_FILE_SIZE` : Taille maximale en MB (défaut: 50)

## 🏃 Utilisation

### Démarrage du serveur

```bash
# Mode développement (avec hot reload)
npm run dev

# Mode production
npm start
```

Le serveur démarrera sur `http://localhost:3001`

### 🐳 Avec Docker

```bash
# Build et démarrage avec docker-compose
docker-compose up -d

# Voir les logs
docker-compose logs -f

# Arrêter le serveur
docker-compose down
```

Ou avec Docker seul :

```bash
# Build l'image
docker build -t express-file-server .

# Démarrer le conteneur
docker run -d -p 3001:3001 -v $(pwd)/files:/app/files express-file-server
```

## 📡 API Endpoints

### POST /upload

Upload un fichier sur le serveur.

**Request:**
```bash
curl -X POST http://localhost:3001/upload \
  -F "file=@/path/to/your/file.jpg"
```

**Response:**
```json
{
  "url": "http://localhost:3001/files/image-1234567890-abc123.jpg",
  "filename": "image-1234567890-abc123.jpg",
  "originalName": "image.jpg",
  "size": 245678,
  "mimetype": "image/jpeg"
}
```

### GET /files/:filename

Récupère un fichier uploadé.

**Exemples:**

```bash
# Récupérer l'image originale
curl http://localhost:3001/files/image-1234567890-abc123.jpg

# Récupérer l'image redimensionnée (largeur 800px)
curl http://localhost:3001/files/image-1234567890-abc123.jpg?width=800

# Récupérer l'image redimensionnée (largeur 400px)
curl http://localhost:3001/files/image-1234567890-abc123.jpg?width=400
```

**Paramètres query pour les images:**
- `width` : Largeur souhaitée (1-4000px). Le height s'adapte automatiquement pour garder le ratio.

## 🔧 Intégration avec React

Le serveur est compatible avec le hook `useMediaUpload` fourni :

```javascript
import { useMediaUpload } from "@/hooks/useMediaUpload";

function MyComponent() {
  const { uploadFile, isUploading, uploadProgress } = useMediaUpload();

  const handleUpload = async (file) => {
    const result = await uploadFile(file);
    if (result) {
      console.log("Fichier uploadé:", result.url);
      // Utiliser l'image avec redimensionnement
      // <img src={`${result.url}?width=800`} />
    }
  };

  return (
    <div>
      <input type="file" onChange={(e) => {
        const file = e.target.files?.[0];
        if (file) handleUpload(file);
      }} />
      {isUploading && <p>Upload: {uploadProgress}%</p>}
    </div>
  );
}
```

### Exemple d'utilisation des images redimensionnées

```jsx
// Image responsive avec srcset
<img
  src={`${imageUrl}?width=800`}
  srcSet={`
    ${imageUrl}?width=400 400w,
    ${imageUrl}?width=800 800w,
    ${imageUrl}?width=1200 1200w
  `}
  sizes="(max-width: 768px) 400px, (max-width: 1200px) 800px, 1200px"
  alt="Image"
/>

// Image pour mobile
<img src={`${imageUrl}?width=400`} alt="Mobile" />

// Image pour desktop
<img src={`${imageUrl}?width=1200`} alt="Desktop" />

// Thumbnail
<img src={`${imageUrl}?width=150`} alt="Thumbnail" />
```

## 📦 Types MIME supportés

### Images
- JPEG (.jpg, .jpeg)
- PNG (.png)
- GIF (.gif)
- WebP (.webp)
- SVG (.svg)

### Vidéos
- MP4 (.mp4)
- WebM (.webm)
- OGG (.ogg)

### Documents
- PDF (.pdf)
- Word (.doc, .docx)
- Excel (.xls, .xlsx)
- Texte (.txt)

## 🏗️ Structure du projet

```
.
├── server.js          # Serveur Express principal
├── package.json       # Dépendances
├── .env              # Configuration (à créer)
├── .env.example      # Exemple de configuration
└── files/            # Dossier de stockage (créé automatiquement)
```

## 🔒 Sécurité

- Validation de la taille des fichiers
- Noms de fichiers sécurisés (sanitization)
- Support CORS configurable
- Cache headers pour optimiser les performances

## 🎯 Performance

- Utilisation d'Express.js stable et éprouvé
- Redimensionnement d'images à la volée avec Sharp
- Cache HTTP pour éviter les requêtes inutiles
- Pas de redimensionnement si l'image est déjà plus petite

## 🚧 Améliorations futures

- [ ] Authentication/Authorization
- [ ] Compression automatique des images
- [ ] Support de WebP automatique
- [ ] Thumbnails pré-générés
- [ ] CDN integration
- [ ] Rate limiting
- [ ] Gestion de quotas par utilisateur

## 📝 License

MIT

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une PR.