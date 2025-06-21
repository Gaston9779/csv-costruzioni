const bcrypt = require('bcrypt');
const Client = require('../models/Client');
const Document = require('../models/Document');
const Project = require('../models/Project');
const apiClienti = require('../services/apiClienti');
const emailService = require('../services/emailService');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');

/**
 * Funzione per generare una password per un nuovo cliente
 * Format: camelCase(nome) + '1'
 */
const generatePassword = (name) => {
  // Divide il nome in parole
  const words = name.split(' ');

  // Prima parola in minuscolo
  let password = words[0].toLowerCase();

  // Resto delle parole con prima lettera maiuscola
  for (let i = 1; i < words.length; i++) {
    if (words[i].length > 0) {
      password += words[i][0].toUpperCase() + words[i].slice(1).toLowerCase();
    }
  }

  // Aggiungi un numero alla fine
  password += '1';

  return password;
};

/**
 * Controller per le operazioni di amministrazione
 */
const adminController = {
  /**
   * Ottiene la lista dei clienti (dal DB locale e dall'API)
   */
  getClients: async (req, res) => {
    try {
      // Ottieni clienti dal database locale
      const localClients = await Client.find()
        .select('_id name email external_id role created_at updated_at notes')
        .sort({ name: 1 });
      
      console.log(`Trovati ${localClients.length} clienti nel database locale`);

      // Ottieni clienti dall'API esterna
      let apiClients = [];
      try {
        apiClients = await apiClienti.getAllClients();
      } catch (apiError) {
        console.error('Errore durante il recupero dei clienti dall\'API:', apiError);
        // Continuiamo con i clienti locali
      }

      // Mappatura clienti API per evitare duplicati con clienti locali
      const externalIdsInLocalDb = new Set(
        localClients
          .filter(client => client.external_id)
          .map(client => client.external_id)
      );

      const externalClientsNotInDb = apiClients.filter(
        client => !externalIdsInLocalDb.has(client.id.toString())
      );

      // Debug: Verifichiamo i client IDs prima di procedere
      console.log('Client IDs nel DB:', localClients.map(c => c._id.toString()));
      
      // METODO 1: Usa direttamente query di conteggio invece di aggregazione
      const enrichedLocalClients = await Promise.all(localClients.map(async client => {
        const clientId = client._id;
        const clientIdString = clientId.toString();
        
        // Conta documenti direttamente con countDocuments
        const documentCount = await Document.countDocuments({ client: clientId });
        
        // Conta progetti direttamente con countDocuments
        const projectCount = await Project.countDocuments({ client: clientId });
        
        console.log(`Cliente ${client.name} (${clientIdString}): ${documentCount} documenti, ${projectCount} progetti`);
        
        return {
          ...client.toObject(),
          documentCount,
          projectCount
        };
      }));

      res.json({
        success: true,
        localClients: enrichedLocalClients,
        externalClients: externalClientsNotInDb
      });

    } catch (error) {
      console.error('Errore durante il recupero dei clienti:', error);
      res.status(500).json({
        success: false,
        message: 'Errore durante il recupero dei clienti'
      });
    }
  },

  /**
   * Crea un nuovo cliente o restituisce uno esistente
   */
  createOrGetClient: async (req, res) => {
    try {
      const { externalId, name, email } = req.body;

      if (!externalId || !name || !email) {
        return res.status(400).json({
          success: false,
          message: 'ID esterno, nome e email sono richiesti'
        });
      }

      // Verifica se il cliente esiste già
      const existingClient = await Client.findOne({
        $or: [
          { external_id: externalId },
          { email: email.toLowerCase() }
        ]
      });

      // Cliente già esistente
      if (existingClient) {
        return res.json({
          success: true,
          client: {
            id: existingClient._id,
            name: existingClient.name,
            email: existingClient.email,
            external_id: existingClient.external_id,
            isNew: false
          }
        });
      }

      // Genera password per nuovo cliente
      const rawPassword = generatePassword(name);
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(rawPassword, salt);

      // Crea nuovo cliente nel database
      const newClient = new Client({
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        external_id: externalId,
        role: 'client'
      });

      await newClient.save();

      // Invia email al cliente con credenziali
      try {
        await emailService.sendWelcomeEmail(newClient, rawPassword);
      } catch (emailError) {
        console.error('Errore nell\'invio dell\'email di benvenuto:', emailError);
        // Continuiamo anche se l'invio dell'email fallisce
      }

      res.status(201).json({
        success: true,
        client: {
          id: newClient._id,
          name: newClient.name,
          email: newClient.email,
          external_id: newClient.external_id,
          isNew: true
        },
        message: 'Cliente creato con successo e email inviata'
      });

    } catch (error) {
      console.error('Errore durante la creazione del cliente:', error);
      res.status(500).json({
        success: false,
        message: 'Errore durante la creazione del cliente'
      });
    }
  },

  /**
   * Carica un documento per un cliente
   */
  uploadDocument: async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Nessun file caricato'
        });
      }

      const { clientId, title } = req.body;

      if (!clientId || !title) {
        // Rimuovi il file se mancano dati necessari
        fs.unlinkSync(req.file.path);

        return res.status(400).json({
          success: false,
          message: 'ID cliente e titolo sono richiesti'
        });
      }

      // Verifica che il cliente esista
      const client = await Client.findById(clientId);

      if (!client) {
        // Rimuovi il file se il cliente non esiste
        fs.unlinkSync(req.file.path);

        return res.status(404).json({
          success: false,
          message: 'Cliente non trovato'
        });
      }

      // Salva il documento nel database
      const document = new Document({
        title,
        file_path: req.file.path,
        file_name: req.file.filename,
        file_type: req.file.mimetype,
        file_size: req.file.size,
        client: clientId,
        uploaded_by: req.user.id
      });

      await document.save();

      // Invia notifica email al cliente
      try {
        await emailService.sendNewDocumentNotification(client, document);
      } catch (emailError) {
        console.error('Errore nell\'invio dell\'email di notifica:', emailError);
        // Continuiamo anche se l'invio dell'email fallisce
      }

      res.status(201).json({
        success: true,
        document: {
          id: document._id,
          title: document.title,
          fileName: document.file_name,
          fileType: document.file_type,
          fileSize: document.file_size,
          uploadedAt: document.uploaded_at,
          clientId: document.client
        },
        message: 'Documento caricato con successo'
      });

    } catch (error) {
      console.error('Errore durante il caricamento del documento:', error);

      // Rimuovi il file in caso di errore
      if (req.file && req.file.path) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (unlinkError) {
          console.error('Errore nella rimozione del file:', unlinkError);
        }
      }

      res.status(500).json({
        success: false,
        message: 'Errore durante il caricamento del documento'
      });
    }
  },

  /**
   * Ottiene tutti i documenti (con filtri opzionali)
   */
  getDocuments: async (req, res) => {
    try {
      const { clientId } = req.query;

      const query = clientId ? { client: clientId } : {};

      // Cerca documenti nel DB e popola le informazioni del cliente
      const documents = await Document.find(query)
        .populate('client', 'name email')
        .sort({ uploaded_at: -1 });

      res.json({
        success: true,
        documents: documents.map(doc => ({
          id: doc._id,
          title: doc.title,
          fileName: doc.file_name,
          fileType: doc.file_type,
          fileSize: doc.file_size,
          uploadedAt: doc.uploaded_at,
          clientId: doc.client._id,
          clientName: doc.client.name,
          clientEmail: doc.client.email
        }))
      });

    } catch (error) {
      console.error('Errore durante il recupero dei documenti:', error);
      res.status(500).json({
        success: false,
        message: 'Errore durante il recupero dei documenti'
      });
    }
  },

  /**
   * Elimina un documento
   */
  deleteDocument: async (req, res) => {
    try {
      const { id } = req.params;

      // Recupera il documento per ottenere il percorso del file
      const document = await Document.findById(id);

      if (!document) {
        return res.status(404).json({
          success: false,
          message: 'Documento non trovato'
        });
      }

      // Elimina il documento dal database
      await Document.findByIdAndDelete(id);

      // Elimina il file fisico
      try {
        fs.unlinkSync(document.file_path);

        // Verifica se la directory del cliente è vuota e rimuovila
        const clientDir = path.dirname(document.file_path);
        const files = fs.readdirSync(clientDir);
        if (files.length === 0) {
          fs.rmdirSync(clientDir);
        }
      } catch (fsError) {
        console.error('Errore durante la rimozione del file:', fsError);
        // Continuiamo anche se la rimozione del file fallisce
      }

      res.json({
        success: true,
        message: 'Documento eliminato con successo'
      });

    } catch (error) {
      console.error('Errore durante l\'eliminazione del documento:', error);
      res.status(500).json({
        success: false,
        message: 'Errore durante l\'eliminazione del documento'
      });
    }
  }
};

module.exports = adminController;
