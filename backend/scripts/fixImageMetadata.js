const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Connessione al database
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/csv-costruzioni', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const Project = require('../models/Project');

async function fixImageMetadata() {
  try {
    console.log('🔧 Inizio correzione metadati immagini...\n');
    
    const projects = await Project.find({});
    console.log(`📊 Trovati ${projects.length} progetti da analizzare\n`);
    
    let projectsFixed = 0;
    let imagesFixed = 0;
    
    for (const project of projects) {
      let projectModified = false;
      
      // Fix immagini del progetto principale
      if (project.images && project.images.length > 0) {
        for (let i = 0; i < project.images.length; i++) {
          const img = project.images[i];
          
          // Se l'immagine non ha URL ma ha filename
          if (img.filename && !img.url) {
            project.images[i].url = `/uploads/projects/${img.filename}`;
            console.log(`  ✅ Aggiunto URL a immagine progetto: ${img.filename}`);
            projectModified = true;
            imagesFixed++;
          }
          
          // Se l'immagine non ha mimetype, prova a dedurlo dall'estensione
          if (!img.mimetype && img.filename) {
            const ext = path.extname(img.filename).toLowerCase();
            const mimetypeMap = {
              '.jpg': 'image/jpeg',
              '.jpeg': 'image/jpeg',
              '.png': 'image/png',
              '.gif': 'image/gif',
              '.webp': 'image/webp',
              '.heic': 'image/heic',
              '.heif': 'image/heif',
              '.bmp': 'image/bmp',
              '.tiff': 'image/tiff',
              '.svg': 'image/svg+xml'
            };
            
            if (mimetypeMap[ext]) {
              project.images[i].mimetype = mimetypeMap[ext];
              console.log(`  ✅ Aggiunto mimetype a immagine progetto: ${img.filename} -> ${mimetypeMap[ext]}`);
              projectModified = true;
            }
          }
          
          // Se l'immagine non ha path ma ha filename
          if (!img.path && img.filename) {
            project.images[i].path = path.join(__dirname, '../uploads/projects', img.filename);
            projectModified = true;
          }
          
          // Se l'immagine non ha size, prova a leggerlo dal file
          if (!img.size && img.path && fs.existsSync(img.path)) {
            try {
              const stats = fs.statSync(img.path);
              project.images[i].size = stats.size;
              projectModified = true;
            } catch (err) {
              console.log(`  ⚠️  Impossibile leggere size per ${img.filename}`);
            }
          }
        }
      }
      
      // Fix immagini degli appartamenti
      if (project.apartments && project.apartments.length > 0) {
        for (let aptIdx = 0; aptIdx < project.apartments.length; aptIdx++) {
          const apartment = project.apartments[aptIdx];
          
          if (apartment.images && apartment.images.length > 0) {
            for (let imgIdx = 0; imgIdx < apartment.images.length; imgIdx++) {
              const img = apartment.images[imgIdx];
              
              // Se l'immagine è solo un ID stringa, salta (non possiamo recuperare i dati)
              if (typeof img === 'string') {
                console.log(`  ⚠️  Appartamento ${aptIdx}: Immagine è solo un ID (${img}), impossibile recuperare metadati`);
                continue;
              }
              
              // Se l'immagine ha solo _id senza altri dati
              if (img._id && !img.filename && !img.url) {
                console.log(`  ⚠️  Appartamento ${aptIdx}: Immagine ha solo ID (${img._id}), impossibile recuperare metadati`);
                continue;
              }
              
              // Se l'immagine non ha URL ma ha filename
              if (img.filename && !img.url) {
                project.apartments[aptIdx].images[imgIdx].url = `/uploads/apartments/${img.filename}`;
                console.log(`  ✅ Aggiunto URL a immagine appartamento ${aptIdx}: ${img.filename}`);
                projectModified = true;
                imagesFixed++;
              }
              
              // Se l'immagine non ha mimetype, prova a dedurlo dall'estensione
              if (!img.mimetype && img.filename) {
                const ext = path.extname(img.filename).toLowerCase();
                const mimetypeMap = {
                  '.jpg': 'image/jpeg',
                  '.jpeg': 'image/jpeg',
                  '.png': 'image/png',
                  '.gif': 'image/gif',
                  '.webp': 'image/webp',
                  '.heic': 'image/heic',
                  '.heif': 'image/heif',
                  '.bmp': 'image/bmp',
                  '.tiff': 'image/tiff',
                  '.svg': 'image/svg+xml'
                };
                
                if (mimetypeMap[ext]) {
                  project.apartments[aptIdx].images[imgIdx].mimetype = mimetypeMap[ext];
                  console.log(`  ✅ Aggiunto mimetype a immagine appartamento ${aptIdx}: ${img.filename} -> ${mimetypeMap[ext]}`);
                  projectModified = true;
                }
              }
              
              // Se l'immagine non ha path ma ha filename
              if (!img.path && img.filename) {
                project.apartments[aptIdx].images[imgIdx].path = path.join(__dirname, '../uploads/apartments', img.filename);
                projectModified = true;
              }
              
              // Se l'immagine non ha size, prova a leggerlo dal file
              if (!img.size && img.path && fs.existsSync(img.path)) {
                try {
                  const stats = fs.statSync(img.path);
                  project.apartments[aptIdx].images[imgIdx].size = stats.size;
                  projectModified = true;
                } catch (err) {
                  console.log(`  ⚠️  Impossibile leggere size per ${img.filename}`);
                }
              }
            }
          }
        }
      }
      
      // Salva il progetto se è stato modificato
      if (projectModified) {
        await project.save();
        projectsFixed++;
        console.log(`✅ Progetto "${project.title}" (ID: ${project._id}) aggiornato\n`);
      }
    }
    
    console.log('\n📊 RIEPILOGO:');
    console.log(`   - Progetti analizzati: ${projects.length}`);
    console.log(`   - Progetti corretti: ${projectsFixed}`);
    console.log(`   - Immagini corrette: ${imagesFixed}`);
    console.log('\n✅ Correzione completata!');
    
  } catch (error) {
    console.error('❌ Errore durante la correzione:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Connessione al database chiusa');
  }
}

// Esegui lo script
fixImageMetadata();
