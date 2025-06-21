/**
 * Script per pulire i documenti orfani dal database
 * Esegui con: node scripts/cleanOrphanedDocuments.js
 */

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Importa i modelli
const Document = require('../models/Document');
const Project = require('../models/Project');
const Client = require('../models/Client');

async function cleanOrphanedDocuments() {
  try {
    // Connessione al database
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connesso al database MongoDB');

    // 1. Ottieni tutti i documenti
    const allDocuments = await Document.find();
    console.log(`Trovati ${allDocuments.length} documenti totali nel database`);

    // 2. Ottieni tutti gli ID dei progetti esistenti
    const projects = await Project.find().select('_id client');
    const projectIds = projects.map(project => project._id.toString());
    
    // Crea una mappa di client-progetto per verificare se un client ha ancora progetti attivi
    const clientProjectMap = {};
    projects.forEach(project => {
      if (project.client) {
        const clientId = project.client.toString();
        if (!clientProjectMap[clientId]) {
          clientProjectMap[clientId] = [];
        }
        clientProjectMap[clientId].push(project._id.toString());
      }
    });
    
    console.log(`Trovati ${projectIds.length} progetti nel database`);

    // 3. Filtra i documenti orfani in base a diversi criteri
    const orphanedDocuments = [];
    
    for (const doc of allDocuments) {
      // Caso 1: Il documento ha un progetto associato ma quel progetto non esiste più
      if (doc.project && !projectIds.includes(doc.project.toString())) {
        orphanedDocuments.push({
          doc,
          reason: `Il progetto associato (${doc.project}) non esiste più`
        });
        continue;
      }
      
      // Caso 2: Il documento è associato a un client che non ha più progetti attivi
      // (solo se vuoi eliminare TUTTI i documenti di client che non hanno più progetti)
      /*
      if (doc.client) {
        const clientId = doc.client.toString();
        if (!clientProjectMap[clientId] || clientProjectMap[clientId].length === 0) {
          orphanedDocuments.push({
            doc,
            reason: `Il client (${clientId}) non ha più progetti attivi`
          });
          continue;
        }
      }
      */
      
      // Caso 3: Il documento non ha un progetto associato ma è stato creato prima di una certa data
      // Questo è utile per eliminare documenti vecchi che non sono stati migrati al nuovo schema
      // Decommentare e modificare la data se necessario
      /*
      if (!doc.project) {
        const creationDate = new Date(doc.uploaded_at || doc._id.getTimestamp());
        const cutoffDate = new Date('2025-06-01'); // Data prima della quale i documenti sono considerati vecchi
        
        if (creationDate < cutoffDate) {
          orphanedDocuments.push({
            doc,
            reason: `Documento vecchio creato il ${creationDate.toISOString()} senza progetto associato`
          });
        }
      }
      */
    }

    console.log(`Trovati ${orphanedDocuments.length} documenti orfani da eliminare`);

    // 4. Elimina i documenti orfani
    if (orphanedDocuments.length > 0) {
      console.log('Inizio eliminazione documenti orfani...');
      
      for (const { doc, reason } of orphanedDocuments) {
        console.log(`Eliminazione documento: ${doc._id} (${doc.title}) - Motivo: ${reason}`);
        
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
      
      console.log(`Eliminati con successo ${orphanedDocuments.length} documenti orfani`);
    } else {
      console.log('Nessun documento orfano da eliminare');
    }

    // 5. Opzionale: Aggiorna i documenti esistenti per associarli ai progetti corretti
    // Questo è utile se vuoi migrare i documenti esistenti al nuovo schema
    console.log('\nAggiornamento dei documenti esistenti per associarli ai progetti...');
    
    const remainingDocs = await Document.find({ project: { $exists: false } });
    console.log(`Trovati ${remainingDocs.length} documenti senza progetto associato`);
    
    let updatedCount = 0;
    
    for (const doc of remainingDocs) {
      if (!doc.client) continue;
      
      const clientId = doc.client.toString();
      const clientProjects = clientProjectMap[clientId] || [];
      
      if (clientProjects.length > 0) {
        // Associa il documento al progetto più recente del client
        const projectId = clientProjects[0]; // Assumiamo che il primo sia il più recente
        
        await Document.findByIdAndUpdate(doc._id, { project: projectId });
        console.log(`Documento ${doc._id} (${doc.title}) associato al progetto ${projectId}`);
        updatedCount++;
      }
    }
    
    console.log(`Aggiornati ${updatedCount} documenti con associazioni a progetti`);

  } catch (error) {
    console.error('Errore durante la pulizia dei documenti orfani:', error);
  } finally {
    // Chiudi la connessione al database
    await mongoose.connection.close();
    console.log('Connessione al database chiusa');
  }
}

// Esegui la funzione
cleanOrphanedDocuments();
