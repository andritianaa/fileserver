const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const cors = require('cors');
const crypto = require('crypto');
require('dotenv').config()
const app = express();
const PORT = process.env.PORT || 3001;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;
const UPLOAD_DIR = './files';
const MAX_FILE_SIZE = (process.env.MAX_FILE_SIZE || 50) * 1024 * 1024; // En bytes
const NODE_ENV = process.env.NODE_ENV || 'development';

// Créer le dossier files s'il n'existe pas
fs.mkdir(UPLOAD_DIR, { recursive: true }).catch(console.error);

// Configuration CORS avec domaines autorisés
const allowedDomains = [
    'hevitro.com',
    'teratany.org'
];

const corsOptions = {
    origin: function (origin, callback) {
        // En mode développement, autoriser tous les domaines
        if (NODE_ENV === 'development') {
            return callback(null, true);
        }

        // Autoriser les requêtes sans origin (comme Postman, curl, etc.)
        if (!origin) {
            return callback(null, true);
        }

        try {
            const url = new URL(origin);
            const hostname = url.hostname;

            // Vérifier si le domaine correspond exactement ou est un sous-domaine
            const isAllowed = allowedDomains.some(domain => {
                return hostname === domain || hostname.endsWith(`.${domain}`);
            });

            if (isAllowed) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        } catch (error) {
            callback(new Error('Invalid origin'));
        }
    },
    credentials: true
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Configuration de multer pour l'upload
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        cb(null, UPLOAD_DIR);
    },
    filename: (req, file, cb) => {
        const timestamp = Date.now();
        const extension = path.extname(file.originalname);

        // Créer un hash du nom de fichier original
        const hash = crypto
            .createHash('md5')
            .update(file.originalname + timestamp)
            .digest('hex')
            .substring(0, 12);

        // Format: timestamp-hash.extension
        const filename = `${timestamp}-${hash}${extension}`;
        cb(null, filename);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: MAX_FILE_SIZE }
});

// Fonction pour détecter le type MIME
function getMimeType(filename) {
    const ext = path.extname(filename).toLowerCase().substring(1);
    const mimeTypes = {
        // Images
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        png: 'image/png',
        gif: 'image/gif',
        webp: 'image/webp',
        svg: 'image/svg+xml',
        // Vidéos
        mp4: 'video/mp4',
        webm: 'video/webm',
        ogg: 'video/ogg',
        // Documents
        pdf: 'application/pdf',
        doc: 'application/msword',
        docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        xls: 'application/vnd.ms-excel',
        xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        txt: 'text/plain'
    };

    return mimeTypes[ext] || 'application/octet-stream';
}

// Route d'accueil
app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>File Server</title>
        <style>
          body { font-family: system-ui; max-width: 800px; margin: 50px auto; padding: 20px; }
          .endpoint { background: #f5f5f5; padding: 15px; margin: 10px 0; border-radius: 5px; }
          code { background: #e0e0e0; padding: 2px 6px; border-radius: 3px; }
        </style>
      </head>
      <body>
        <h1>📁 File Server</h1>
        <p>Server running on port ${PORT}</p>
        
        <h2>Endpoints:</h2>
        
        <div class="endpoint">
          <h3>POST /upload</h3>
          <p>Upload un fichier</p>
          <p><strong>Form data:</strong> <code>file</code></p>
        </div>
        
        <div class="endpoint">
          <h3>GET /files/:filename</h3>
          <p>Récupère un fichier</p>
          <p><strong>Query params (images):</strong> <code>?width=800</code> (redimensionnement automatique)</p>
        </div>
      </body>
    </html>
  `);
});

// Route d'upload
app.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file provided' });
        }

        const mimetype = req.file.mimetype || getMimeType(req.file.filename);
        const isImage = mimetype.startsWith('image/') && !mimetype.includes('svg');

        let finalFilename = req.file.filename;
        let finalMimetype = mimetype;
        let finalSize = req.file.size;

        // Convertir les images en WebP (sauf SVG)
        if (isImage) {
            try {
                const originalPath = path.join(UPLOAD_DIR, req.file.filename);
                const webpFilename = req.file.filename.replace(/\.(jpg|jpeg|png|gif|webp)$/i, '.webp');
                const webpPath = path.join(UPLOAD_DIR, webpFilename);

                // Convertir en WebP avec une bonne qualité
                await sharp(originalPath)
                    .webp({ quality: 85 })
                    .toFile(webpPath);

                // Supprimer le fichier original
                await fs.unlink(originalPath);

                // Obtenir la taille du fichier WebP
                const stats = await fs.stat(webpPath);

                finalFilename = webpFilename;
                finalMimetype = 'image/webp';
                finalSize = stats.size;

                console.log(`✅ Image converted to WebP: ${req.file.filename} → ${webpFilename} (${req.file.size} → ${stats.size} bytes)`);
            } catch (error) {
                console.error('WebP conversion error:', error);
                // En cas d'erreur, garder le fichier original
                console.log('⚠️ Keeping original file due to conversion error');
            }
        }

        const response = {
            url: `${BASE_URL}/files/${finalFilename}`,
            filename: finalFilename,
            originalName: req.file.originalname,
            size: finalSize,
            mimetype: finalMimetype
        };

        res.json(response);
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Upload failed' });
    }
});

// Route pour récupérer les fichiers
app.get('/files/:filename', async (req, res) => {
    try {
        const filename = req.params.filename;
        const filepath = path.join(UPLOAD_DIR, filename);

        // Vérifier si le fichier existe
        try {
            await fs.access(filepath);
        } catch {
            return res.status(404).send('File not found');
        }

        const mimeType = getMimeType(filename);
        const isImage = mimeType.startsWith('image/');

        // Si c'est une image et qu'un width est spécifié, redimensionner
        if (isImage && req.query.width) {
            const width = parseInt(req.query.width);

            if (width > 0 && width <= 4000) {
                try {
                    const image = sharp(filepath);
                    const metadata = await image.metadata();

                    // Si l'image est déjà plus petite, retourner l'originale
                    if (metadata.width && metadata.width <= width) {
                        return res.type(mimeType).sendFile(path.resolve(filepath));
                    }

                    // Redimensionner
                    const resizedBuffer = await image
                        .resize(width, null, {
                            fit: 'inside',
                            withoutEnlargement: true
                        })
                        .toBuffer();

                    res.type(mimeType)
                        .set('Cache-Control', 'public, max-age=31536000, immutable')
                        .send(resizedBuffer);
                    return;
                } catch (error) {
                    console.error('Resize error:', error);
                    // En cas d'erreur, retourner l'originale
                }
            }
        }

        // Retourner le fichier original
        res.type(mimeType)
            .set('Cache-Control', 'public, max-age=31536000, immutable')
            .sendFile(path.resolve(filepath));

    } catch (error) {
        console.error('File retrieval error:', error);
        res.status(500).send('Error retrieving file');
    }
});

// Gestion des erreurs de multer
app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(413).json({
                error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`
            });
        }
        return res.status(400).json({ error: error.message });
    }
    next(error);
});

// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`🚀 File server running on http://localhost:${PORT}`);
    console.log(`📡 Mode: ${NODE_ENV}`);
    console.log(`🔒 CORS: ${NODE_ENV === 'development' ? 'Allow All (Development)' : 'Restricted (Production)'}`);
});