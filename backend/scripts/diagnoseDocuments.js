/**
 * Script di diagnostica per visualizzare lo stato attuale dei documenti e progetti
 * Esegui con: node scripts/diagnoseDocuments.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Importa i modelli
const Document = require('../models/Document');
const Project = require('../models/Project');

async function diagnoseDocuments() {
  try {
    // Connessione al database
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connesso al database MongoDB');

    // Ottieni tutti i progetti
    const projects = await Project.find();
    console.log('\n=== PROGETTI ESISTENTI ===');
    console.log(`Trovati ${projects.length} progetti:`);
    projects.forEach(project => {
      console.log(`- ID: ${project._id}, Titolo: ${project.title}, Client: ${project.client}`);
    });

    // Ottieni tutti i documenti
    const documents = await Document.find();
    console.log('\n=== DOCUMENTI ESISTENTI ===');
    console.log(`Trovati ${documents.length} documenti:`);
    
    for (const doc of documents) {
      console.log(`\nDocumento ID: ${doc._id}`);
      console.log(`Titolo: ${doc.title}`);
      console.log(`Client: ${doc.client}`);
      console.log(`Project: ${doc.project}`);
      
      // Verifica se il progetto esiste
      if (doc.project) {
        const projectExists = projects.some(p => p._id.toString() === doc.project.toString());
        console.log(`Progetto esiste: ${projectExists ? 'SÌ' : 'NO'}`);
      } else {
        console.log(`Progetto esiste: NO (nessun progetto associato)`);
      }
      
      // Verifica se il documento è un'immagine (per escluderla)
      const isImage = doc.title && (
        doc.title.endsWith('.jpg') || 
        doc.title.endsWith('.jpeg') || 
        doc.title.endsWith('.png') || 
        doc.title.endsWith('.gif')
      );
      console.log(`È un'immagine: ${isImage ? 'SÌ' : 'NO'}`);
    }

  } catch (error) {
    console.error('Errore durante la diagnosi:', error);
  } finally {
    // Chiudi la connessione al database
    await mongoose.connection.close();
    console.log('\nConnessione al database chiusa');
  }
}

// Esegui la funzione
diagnoseDocuments();
