const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;

const UPLOAD_DIR = './files';

async function convertExistingFiles() {
    try {
        console.log('🔍 Scanning files directory...');
        
        // Lire tous les fichiers du dossier
        const files = await fs.readdir(UPLOAD_DIR);
        
        // Filtrer uniquement les PNG et WebP
        const filesToConvert = files.filter(file => {
            const ext = path.extname(file).toLowerCase();
            return ext === '.png' || ext === '.webp';
        });

        console.log(`📋 Found ${filesToConvert.length} files to convert`);

        if (filesToConvert.length === 0) {
            console.log('✅ No files to convert');
            return;
        }

        let converted = 0;
        let failed = 0;

        for (const filename of filesToConvert) {
            try {
                const originalPath = path.join(UPLOAD_DIR, filename);
                const jpgFilename = filename.replace(/\.(png|webp)$/i, '.jpg');
                const jpgPath = path.join(UPLOAD_DIR, jpgFilename);

                // Vérifier si le fichier JPG existe déjà
                try {
                    await fs.access(jpgPath);
                    console.log(`⚠️  ${jpgFilename} already exists, skipping ${filename}`);
                    continue;
                } catch {
                    // Le fichier n'existe pas, on peut continuer
                }

                // Obtenir la taille originale
                const originalStats = await fs.stat(originalPath);
                const originalSize = originalStats.size;

                // Convertir en JPG
                await sharp(originalPath)
                    .jpeg({ quality: 85 })
                    .toFile(jpgPath);

                // Obtenir la taille du nouveau fichier
                const jpgStats = await fs.stat(jpgPath);
                const jpgSize = jpgStats.size;

                // Supprimer le fichier original
                await fs.unlink(originalPath);

                converted++;
                console.log(`✅ ${filename} → ${jpgFilename} (${originalSize} → ${jpgSize} bytes)`);

            } catch (error) {
                failed++;
                console.error(`❌ Failed to convert ${filename}:`, error.message);
            }
        }

        console.log('\n📊 Conversion Summary:');
        console.log(`   ✅ Converted: ${converted}`);
        console.log(`   ❌ Failed: ${failed}`);
        console.log(`   📁 Total processed: ${filesToConvert.length}`);

    } catch (error) {
        console.error('❌ Error scanning directory:', error);
    }
}

// Exécuter la conversion
convertExistingFiles();