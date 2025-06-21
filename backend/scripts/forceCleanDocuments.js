/**
 * Script per forzare la pulizia dei documenti e sincronizzare i contatori
 * Esegui con: node scripts/forceCleanDocuments.js
 */

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Importa i modelli
const Document = require('../models/Document');
const Project = require('../models/Project');
const Client = require('../models/Client');
const Counter = require('../models/Counter');

async function forceCleanDocuments() {
  try {
    // Connessione al database
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connesso al database MongoDB');

    // 1. Ottieni tutti i progetti attivi
    const activeProjects = await Project.find().select('_id client title');
    const activeProjectIds = activeProjects.map(p => p._id.toString());
    console.log(`Trovati ${activeProjects.length} progetti attivi nel database:`);
    activeProjects.forEach(p => console.log(`- ${p._id} (${p.title})`));

    // 2. Ottieni tutti i client attivi
    const activeClients = await Client.find().select('_id name');
    const activeClientIds = activeClients.map(c => c._id.toString());
    console.log(`Trovati ${activeClients.length} client attivi nel database`);

    // 3. Ottieni tutti i documenti
    const allDocuments = await Document.find();
    console.log(`Trovati ${allDocuments.length} documenti totali nel database`);
    allDocuments.forEach(doc => {
      console.log(`- ${doc._id} (${doc.title}) - Client: ${doc.client}, Project: ${doc.project || 'nessuno'}`);
    });

    // 4. Identifica i documenti da mantenere (SOLO quelli associati a progetti attivi)
    const documentsToKeep = [];
    const documentsToDelete = [];

    for (const doc of allDocuments) {
      let shouldKeep = false;

      // MODALITÀ AGGRESSIVA: Mantieni SOLO i documenti che sono esplicitamente associati a un progetto attivo
      if (doc.project && activeProjectIds.includes(doc.project.toString())) {
        // Verifica che il progetto esista effettivamente
        const project = activeProjects.find(p => p._id.toString() === doc.project.toString());
        if (project) {
          shouldKeep = true;
          console.log(`Documento ${doc._id} (${doc.title}) mantenuto perché associato al progetto ${project.title}`);
        }
      }

      // Se il documento non è associato a nessun progetto attivo, eliminalo
      if (shouldKeep) {
        documentsToKeep.push(doc);
      } else {
        documentsToDelete.push(doc);
      }
    }

    console.log(`Documenti da mantenere: ${documentsToKeep.length}`);
    console.log(`Documenti da eliminare: ${documentsToDelete.length}`);

    // 5. Elimina i documenti non necessari
    if (documentsToDelete.length > 0) {
      console.log('Inizio eliminazione documenti non necessari...');
      
      for (const doc of documentsToDelete) {
        console.log(`Eliminazione documento: ${doc._id} (${doc.title})`);
        
        // Elimina il file fisico se esiste
        if (doc.file_path && fs.existsSync(doc.file_path)) {
          fs.unlinkSync(doc.file_path);
          console.log(`  - File fisico eliminato: ${doc.file_path}`);
        } else {
          console.log(`  - File fisico non trovato: ${doc.file_path}`);
        }
        
        // Elimina il documento dal database
        await Document.findByIdAndDelete(doc._id);
        console.log(`  - Documento eliminato dal database`);
      }
      
      console.log(`Eliminati con successo ${documentsToDelete.length} documenti`);
    }

    // 6. Aggiorna i contatori nel database
    console.log('\nAggiornamento dei contatori nel database...');
    
    // Aggiorna il contatore dei progetti
    const projectCount = await Project.countDocuments();
    await Counter.findOneAndUpdate(
      { name: 'projects' },
      { count: projectCount },
      { upsert: true }
    );
    console.log(`Contatore progetti aggiornato: ${projectCount}`);
    
    // Aggiorna il contatore dei documenti
    const documentCount = await Document.countDocuments();
    await Counter.findOneAndUpdate(
      { name: 'documents' },
      { count: documentCount },
      { upsert: true }
    );
    console.log(`Contatore documenti aggiornato: ${documentCount}`);

    // 7. Aggiorna i contatori per ogni client
    for (const client of activeClients) {
      const clientId = client._id;
      const docCount = await Document.countDocuments({ client: clientId });
      const projCount = await Project.countDocuments({ client: clientId });
      
      console.log(`Client ${client.name} (${clientId}): ${docCount} documenti, ${projCount} progetti`);
    }

    console.log('\nPulizia e sincronizzazione completate con successo!');

  } catch (error) {
    console.error('Errore durante la pulizia dei documenti:', error);
  } finally {
    // Chiudi la connessione al database
    await mongoose.connection.close();
    console.log('Connessione al database chiusa');
  }
}

// Esegui la funzione
forceCleanDocuments();
