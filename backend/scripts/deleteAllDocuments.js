/**
 * Script per eliminare tutti i documenti tranne quelli esplicitamente associati al progetto attuale
 * Esegui con: node scripts/deleteAllDocuments.js
 */

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Importa i modelli
const Document = require('../models/Document');
const Project = require('../models/Project');
const Counter = require('../models/Counter');

async function deleteAllDocuments() {
  try {
    // Connessione al database
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connesso al database MongoDB');

    // Ottieni l'unico progetto attivo
    const activeProject = await Project.findOne();
    
    if (!activeProject) {
      console.log('Nessun progetto trovato nel database. Eliminazione di tutti i documenti...');
      
      // Elimina tutti i documenti
      const allDocuments = await Document.find();
      
      for (const doc of allDocuments) {
        // Elimina il file fisico se esiste
        if (doc.file_path && fs.existsSync(doc.file_path)) {
          fs.unlinkSync(doc.file_path);
          console.log(`File fisico eliminato: ${doc.file_path}`);
        }
      }
      
      // Elimina tutti i documenti dal database
      await Document.deleteMany({});
      console.log(`Eliminati tutti i ${allDocuments.length} documenti dal database`);
    } else {
      console.log(`Progetto attivo trovato: ${activeProject._id} (${activeProject.title})`);
      
      // Trova i documenti che sono esplicitamente associati a questo progetto
      const associatedDocs = await Document.find({ project: activeProject._id });
      console.log(`Documenti associati al progetto: ${associatedDocs.length}`);
      
      // Trova i documenti da eliminare (tutti tranne quelli associati al progetto attivo)
      const docsToDelete = await Document.find({ 
        $or: [
          { project: { $ne: activeProject._id } },
          { project: { $exists: false } },
          { project: null }
        ]
      });
      
      console.log(`Documenti da eliminare: ${docsToDelete.length}`);
      
      // Elimina i documenti non associati
      for (const doc of docsToDelete) {
        console.log(`Eliminazione documento: ${doc._id} (${doc.title})`);
        
        // Elimina il file fisico se esiste
        if (doc.file_path && fs.existsSync(doc.file_path)) {
          fs.unlinkSync(doc.file_path);
          console.log(`  - File fisico eliminato: ${doc.file_path}`);
        } else {
          console.log(`  - File fisico non trovato: ${doc.file_path}`);
        }
      }
      
      // Elimina i documenti dal database
      await Document.deleteMany({ 
        $or: [
          { project: { $ne: activeProject._id } },
          { project: { $exists: false } },
          { project: null }
        ]
      });
      
      console.log(`Eliminati con successo ${docsToDelete.length} documenti`);
    }
    
    // Aggiorna il contatore dei documenti
    const documentCount = await Document.countDocuments();
    await Counter.findOneAndUpdate(
      { name: 'documents' },
      { count: documentCount },
      { upsert: true }
    );
    console.log(`Contatore documenti aggiornato: ${documentCount}`);
    
    console.log('\nPulizia completata con successo!');

  } catch (error) {
    console.error('Errore durante l\'eliminazione dei documenti:', error);
  } finally {
    // Chiudi la connessione al database
    await mongoose.connection.close();
    console.log('Connessione al database chiusa');
  }
}

// Esegui la funzione
deleteAllDocuments();
