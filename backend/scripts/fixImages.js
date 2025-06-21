/**
 * Script per risolvere i problemi con le immagini mancanti
 * Esegui con: node scripts/fixImages.js
 */

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Importa i modelli
const Project = require('../models/Project');

async function fixImages() {
  try {
    // Connessione al database
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connesso al database MongoDB');

    // 1. Verifica le directory di upload
    const uploadsDir = path.join(__dirname, '../uploads');
    
    // Assicurati che la directory esista
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
      console.log(`Creata directory per gli upload: ${uploadsDir}`);
    }

    // 2. Elenca tutti i file nella directory uploads
    console.log('\n=== FILE PRESENTI NELLA DIRECTORY UPLOADS ===');
    const files = fs.readdirSync(uploadsDir);
    const imageFiles = files.filter(file => 
      !file.startsWith('.') && 
      (file.endsWith('.jpg') || file.endsWith('.jpeg') || file.endsWith('.png') || file.endsWith('.gif'))
    );
    
    imageFiles.forEach(file => {
      const filePath = path.join(uploadsDir, file);
      const stats = fs.statSync(filePath);
      console.log(`- ${file} (${stats.size} bytes)`);
    });

    // 3. Ottieni tutti i progetti
    const projects = await Project.find();
    console.log(`\nTrovati ${projects.length} progetti nel database`);

    // 4. Verifica e correggi i percorsi delle immagini
    let totalImages = 0;
    let missingImages = 0;
    let fixedImages = 0;

    for (const project of projects) {
      console.log(`\nProgetto: ${project.title} (ID: ${project._id})`);
      
      if (!project.images || project.images.length === 0) {
        console.log('Nessuna immagine associata a questo progetto');
        continue;
      }
      
      console.log(`Immagini registrate: ${project.images.length}`);
      totalImages += project.images.length;
      
      // Verifica ogni immagine
      for (let i = 0; i < project.images.length; i++) {
        const image = project.images[i];
        console.log(`\nImmagine ${i+1}: ${image.filename}`);
        
        // Verifica se il percorso è corretto
        const isAbsolutePath = path.isAbsolute(image.path);
        console.log(`Percorso assoluto: ${isAbsolutePath ? 'SÌ' : 'NO'}`);
        
        // Verifica se il file esiste
        const fileExists = fs.existsSync(image.path);
        console.log(`File esiste nel percorso registrato: ${fileExists ? 'SÌ' : 'NO'}`);
        
        if (!fileExists) {
          missingImages++;
          
          // Cerca il file nella directory uploads
          const filename = path.basename(image.path);
          const correctPath = path.join(uploadsDir, filename);
          
          if (fs.existsSync(correctPath)) {
            console.log(`File trovato in: ${correctPath}`);
            
            // Aggiorna il percorso nel database
            project.images[i].path = correctPath;
            fixedImages++;
          } else {
            // Cerca file con nome simile
            const possibleMatch = imageFiles.find(file => {
              // Estrai la parte del timestamp dal nome del file
              const imageTimestamp = filename.split('-')[1];
              return file.includes(imageTimestamp);
            });
            
            if (possibleMatch) {
              const newPath = path.join(uploadsDir, possibleMatch);
              console.log(`Trovato file simile: ${possibleMatch}`);
              project.images[i].path = newPath;
              project.images[i].filename = possibleMatch;
              fixedImages++;
            } else {
              console.log('Nessun file corrispondente trovato');
            }
          }
        }
      }
      
      // Salva le modifiche al progetto
      await project.save();
    }

    console.log('\n=== RIEPILOGO ===');
    console.log(`Totale immagini nei progetti: ${totalImages}`);
    console.log(`Immagini mancanti: ${missingImages}`);
    console.log(`Immagini corrette: ${fixedImages}`);

    // 5. Crea un file .htaccess per garantire l'accesso alle immagini
    const htaccessPath = path.join(uploadsDir, '.htaccess');
    const htaccessContent = `
# Permetti l'accesso a tutti i file
<IfModule mod_authz_core.c>
    Require all granted
</IfModule>

# Permetti l'accesso a tutti i file (Apache 2.2)
<IfModule !mod_authz_core.c>
    Order allow,deny
    Allow from all
</IfModule>

# Abilita CORS
<IfModule mod_headers.c>
    Header set Access-Control-Allow-Origin "*"
</IfModule>
`;

    fs.writeFileSync(htaccessPath, htaccessContent);
    console.log('\nCreato file .htaccess per garantire l\'accesso alle immagini');

    console.log('\nOperazione completata con successo!');

  } catch (error) {
    console.error('Errore durante la correzione delle immagini:', error);
  } finally {
    // Chiudi la connessione al database
    await mongoose.connection.close();
    console.log('Connessione al database chiusa');
  }
}

// Esegui la funzione
fixImages();
