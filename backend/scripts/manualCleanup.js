/**
 * Script per eliminare manualmente i documenti specificati
 * Esegui con: node scripts/manualCleanup.js
 */

const mongoose = require('mongoose');
const fs = require('fs');
require('dotenv').config();

// Importa i modelli
const Document = require('../models/Document');
const Counter = require('../models/Counter');

async function manualCleanup() {
  try {
    // Connessione al database
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connesso al database MongoDB');

    // IDs dei documenti da eliminare (quelli che appaiono nell'API ma non dovrebbero esistere)
    const documentsToDelete = [
      "6855a1efadb7730c35e44987",  // "Graziano - vlaho.jpg"
      "68559fc9ff0956f8fe4660b1"   // "Graziano - vlaho.jpg"
    ];

    console.log(`Eliminazione manuale di ${documentsToDelete.length} documenti...`);

    // Elimina ogni documento specificato
    for (const docId of documentsToDelete) {
      // Trova il documento
      const doc = await Document.findById(docId);
      
      if (doc) {
        console.log(`Trovato documento: ${docId} (${doc.title})`);
        
        // Elimina il file fisico se esiste
        if (doc.file_path && fs.existsSync(doc.file_path)) {
          fs.unlinkSync(doc.file_path);
          console.log(`  - File fisico eliminato: ${doc.file_path}`);
        } else {
          console.log(`  - File fisico non trovato: ${doc.file_path}`);
        }
        
        // Elimina il documento dal database
        await Document.findByIdAndDelete(docId);
        console.log(`  - Documento eliminato dal database`);
      } else {
        console.log(`Documento non trovato nel database: ${docId}`);
      }
    }

    // Aggiorna il contatore dei documenti
    const documentCount = await Document.countDocuments();
    await Counter.findOneAndUpdate(
      { name: 'documents' },
      { count: documentCount },
      { upsert: true }
    );
    console.log(`Contatore documenti aggiornato: ${documentCount}`);
    
    // Mostra i documenti rimanenti
    const remainingDocs = await Document.find();
    console.log(`\nDocumenti rimanenti (${remainingDocs.length}):`);
    remainingDocs.forEach(doc => {
      console.log(`- ${doc._id} (${doc.title})`);
    });

    console.log('\nPulizia manuale completata con successo!');

  } catch (error) {
    console.error('Errore durante la pulizia manuale:', error);
  } finally {
    // Chiudi la connessione al database
    await mongoose.connection.close();
    console.log('Connessione al database chiusa');
  }
}

// Esegui la funzione
manualCleanup();
