/**
 * Script per diagnosticare e correggere i problemi con le immagini
 * Esegui con: node scripts/fixImagePaths.js
 */

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Importa i modelli
const Project = require('../models/Project');
const Document = require('../models/Document');

async function fixImagePaths() {
  try {
    // Connessione al database
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connesso al database MongoDB');

    // 1. Verifica le directory di upload
    const baseUploadDir = path.join(__dirname, '../uploads');
    const projectUploadDir = path.join(__dirname, '../uploads/projects');
    
    // Assicurati che le directory esistano
    if (!fs.existsSync(baseUploadDir)) {
      fs.mkdirSync(baseUploadDir, { recursive: true });
      console.log(`Creata directory di base per gli upload: ${baseUploadDir}`);
    }
    
    if (!fs.existsSync(projectUploadDir)) {
      fs.mkdirSync(projectUploadDir, { recursive: true });
      console.log(`Creata directory per gli upload dei progetti: ${projectUploadDir}`);
    }

    // 2. Elenca tutti i file nella directory uploads
    console.log('\n=== FILE PRESENTI NELLA DIRECTORY UPLOADS ===');
    const baseFiles = fs.readdirSync(baseUploadDir);
    baseFiles.forEach(file => {
      if (file !== 'projects' && !file.startsWith('.')) { // Ignora la directory projects e i file nascosti
        const filePath = path.join(baseUploadDir, file);
        const stats = fs.statSync(filePath);
        console.log(`- ${file} (${stats.size} bytes)`);
      }
    });

    // Elenca i file nella directory projects
    if (fs.existsSync(projectUploadDir)) {
      console.log('\n=== FILE PRESENTI NELLA DIRECTORY PROJECTS ===');
      const projectFiles = fs.readdirSync(projectUploadDir);
      projectFiles.forEach(file => {
        if (!file.startsWith('.')) { // Ignora i file nascosti
          const filePath = path.join(projectUploadDir, file);
          const stats = fs.statSync(filePath);
          console.log(`- ${file} (${stats.size} bytes)`);
        }
      });
    }

    // 3. Ottieni tutti i progetti
    const projects = await Project.find();
    console.log(`\nTrovati ${projects.length} progetti nel database`);

    // 4. Verifica le immagini di ogni progetto
    let missingImages = 0;
    let fixedImages = 0;

    for (const project of projects) {
      console.log(`\nProgetto: ${project.title} (ID: ${project._id})`);
      console.log(`Immagini registrate: ${project.images.length}`);
      
      // Verifica ogni immagine
      for (let i = 0; i < project.images.length; i++) {
        const image = project.images[i];
        console.log(`\nImmagine ${i+1}: ${image.filename}`);
        console.log(`Path registrato: ${image.path}`);
        
        // Verifica se il file esiste
        const fileExists = fs.existsSync(image.path);
        console.log(`File esiste: ${fileExists ? 'SÌ' : 'NO'}`);
        
        if (!fileExists) {
          missingImages++;
          
          // Cerca il file nella directory uploads
          const baseFilename = path.basename(image.path);
          const possiblePaths = [
            path.join(baseUploadDir, baseFilename),
            path.join(projectUploadDir, baseFilename)
          ];
          
          let found = false;
          for (const possiblePath of possiblePaths) {
            if (fs.existsSync(possiblePath)) {
              console.log(`File trovato in percorso alternativo: ${possiblePath}`);
              
              // Aggiorna il percorso nel database
              project.images[i].path = possiblePath;
              found = true;
              fixedImages++;
              break;
            }
          }
          
          if (!found) {
            console.log('File non trovato in nessun percorso alternativo');
            
            // Cerca file con nome simile
            const similarFiles = [];
            
            // Cerca nella directory base
            baseFiles.forEach(file => {
              if (file.includes(image.filename.split('-')[0])) {
                similarFiles.push(path.join(baseUploadDir, file));
              }
            });
            
            // Cerca nella directory projects
            if (fs.existsSync(projectUploadDir)) {
              const projectFiles = fs.readdirSync(projectUploadDir);
              projectFiles.forEach(file => {
                if (file.includes(image.filename.split('-')[0])) {
                  similarFiles.push(path.join(projectUploadDir, file));
                }
              });
            }
            
            if (similarFiles.length > 0) {
              console.log(`Trovati ${similarFiles.length} file con nome simile:`);
              similarFiles.forEach(file => console.log(`- ${file}`));
              
              // Usa il primo file simile trovato
              project.images[i].path = similarFiles[0];
              project.images[i].filename = path.basename(similarFiles[0]);
              console.log(`Aggiornato percorso a: ${similarFiles[0]}`);
              fixedImages++;
            }
          }
        }
      }
      
      // Salva le modifiche al progetto
      await project.save();
    }

    console.log('\n=== RIEPILOGO ===');
    console.log(`Immagini mancanti: ${missingImages}`);
    console.log(`Immagini corrette: ${fixedImages}`);

    // 5. Crea un file .htaccess per garantire l'accesso alle immagini
    const htaccessPath = path.join(baseUploadDir, '.htaccess');
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

    // 6. Crea un file index.js per servire le immagini direttamente
    const indexPath = path.join(baseUploadDir, 'index.js');
    const indexContent = `
// Questo file serve solo a garantire che la directory uploads sia accessibile
`;
    fs.writeFileSync(indexPath, indexContent);
    console.log('Creato file index.js nella directory uploads');

    console.log('\nOperazione completata con successo!');

  } catch (error) {
    console.error('Errore durante la correzione dei percorsi delle immagini:', error);
  } finally {
    // Chiudi la connessione al database
    await mongoose.connection.close();
    console.log('Connessione al database chiusa');
  }
}

// Esegui la funzione
fixImagePaths();
