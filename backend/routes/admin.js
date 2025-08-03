const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const projectController = require('../controllers/projectController');
const { authenticateToken, isAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');
const Client = require('../models/Client');
const Project = require('../models/Project');
const mongoose = require('mongoose'); // Aggiungere questa riga per utilizzare mongoose.Types.ObjectId
const Counter = require('../models/Counter');
const bcrypt = require('bcryptjs'); // Aggiungere questa riga per utilizzare bcrypt
const fs = require('fs'); // Aggiungere questa riga per utilizzare fs

// Middleware che verifica l'autenticazione e i privilegi di admin per tutte le rotte
router.use(authenticateToken, isAdmin);

/**
 * @route   GET /api/admin/clients
 * @desc    Ottiene tutti i clienti (DB locale + API) con conteggi di documenti e progetti
 * @access  Solo admin
 */
router.get('/clients', adminController.getClients);

/**
 * @route   POST /api/admin/clients
 * @desc    Crea un nuovo cliente
 */
router.post('/clients', async (req, res) => {
    try {
      const { name, email, password, external_id, notes } = req.body;
      
      // Controlla se esiste già
      const existingClient = await Client.findOne({ email: email.toLowerCase() });
      if (existingClient) {
        return res.status(400).json({
          success: false,
          message: 'Email già registrata'
        });
      }
      
      // Hash della password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      const newClient = new Client({
        name,
        email: email.toLowerCase(),
        password: hashedPassword, // Password hashata
        external_id,
        notes
      });
      
      await newClient.save();
      
      res.json({
        success: true,
        message: 'Cliente creato con successo',
        client: newClient
      });
    } catch (error) {
      console.error('Errore nella creazione:', error);
      res.status(500).json({
        success: false,
        message: 'Errore nella creazione del cliente'
      });
    }
  });
  
  /**
   * @route   PUT /api/admin/clients/:id
   * @desc    Aggiorna un cliente esistente
   */
  router.put('/clients/:id', async (req, res) => {
    try {
      const updateData = { ...req.body, updatedAt: Date.now() };
  
      if (updateData.password) {
        const salt = await bcrypt.genSalt(10);
        updateData.password = await bcrypt.hash(updateData.password, salt);
      } else {
        delete updateData.password;
      }
  
      const client = await Client.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
      );
  
      if (!client) {
        return res.status(404).json({
          success: false,
          message: 'Cliente non trovato'
        });
      }
  
      res.json({
        success: true,
        message: 'Cliente aggiornato con successo',
        client
      });
    } catch (error) {
      console.error('Errore nell\'aggiornamento:', error);
      res.status(500).json({
        success: false,
        message: 'Errore nell\'aggiornamento del cliente'
      });
    }
  });
  
  /**
   * @route   DELETE /api/admin/clients/:id
   * @desc    Elimina un cliente
   */
  router.delete('/clients/:id', async (req, res) => {
    try {
      const client = await Client.findByIdAndDelete(req.params.id);
      
      if (!client) {
        return res.status(404).json({
          success: false,
          message: 'Cliente non trovato'
        });
      }
      
      res.json({
        success: true,
        message: 'Cliente eliminato con successo'
      });
    } catch (error) {
      console.error('Errore nell\'eliminazione:', error);
      res.status(500).json({
        success: false,
        message: 'Errore nell\'eliminazione del cliente'
      });
    }
  });
  
  /**
   * @route   GET /api/admin/clients/stats
   * @desc    Ottiene statistiche sui clienti
   */
  router.get('/clients/stats', async (req, res) => {
    try {
      const total = await Client.countDocuments();
      const recentClients = await Client.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name email createdAt');
      
      res.json({
        success: true,
        stats: {
          total,
          active: total,
          inactive: 0,
          recentClients
        }
      });
    } catch (error) {
      console.error('Errore nel recupero statistiche:', error);
      res.status(500).json({
        success: false,
        message: 'Errore nel recupero statistiche'
      });
    }
  });



/**
 * @route   GET /api/admin/documents
 * @desc    Ottiene tutti i documenti (con filtri opzionali)
 * @access  Solo admin
 */
router.get('/documents', adminController.getDocuments);
router.post('/documents/upload', upload.single('document'), adminController.uploadDocument);


/**
 * @route   DELETE /api/admin/documents/:id
 * @desc    Elimina un documento
 * @access  Solo admin
 */
router.delete('/documents/:id', adminController.deleteDocument);

// --- PROJECTS ADMIN ROUTES (REALI) ---

/**
 * @route   GET /api/admin/projects
 * @desc    Ottiene tutti i progetti (con paginazione e filtri)
 * @access  Solo admin
 */
router.get('/projects', async (req, res) => {
    try {
      const { category, status, client, page = 1, limit = 10, sort } = req.query;
      
      const filter = {};
      if (category && category !== 'all') {
        filter.category = category;
      }
      if (status && status !== 'all') {
        filter.status = status;
      }
      if (client) {
        filter.client = client;
      }
      
      const skip = (page - 1) * limit;
      
      // Imposta l'ordinamento
      let sortOption = { createdAt: -1 }; // Default
      if (sort === 'updatedAt') {
        sortOption = { updatedAt: -1 };
      } else if (sort === 'projectId') {
        sortOption = { projectId: -1 };
      }
      
      // SOLUZIONE DEFINITIVA: query con selezione esplicita di TUTTI i campi
      const rawProjects = await Project.find(filter)
        .populate('client', 'name email')
        .populate('createdBy', 'name email')
        .sort(sortOption)
        .limit(parseInt(limit))
        .skip(skip);
      
      // Converti ogni progetto in JSON con esplicita preservazione di projectType e apartments
      const projects = rawProjects.map(project => {
        const plainObj = project.toObject();
        console.log(`ADMIN GET /projects: Progetto ${plainObj._id} - projectType=${plainObj.projectType || 'MANCANTE'}, apartments=${plainObj.apartments ? plainObj.apartments.length : 'MANCANTE'}`);
        
        return {
          ...plainObj,
          projectType: plainObj.projectType || 'Singola', // Preserva il valore originale o usa il default
          apartments: plainObj.apartments || [] // Preserva gli apartments o usa array vuoto
        };
      });
      
      const total = await Project.countDocuments(filter);
      
      res.json({
        success: true,
        projects,
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page)
      });
    } catch (error) {
      console.error('Errore nel recupero progetti:', error);
      res.status(500).json({
        success: false,
        message: 'Errore nel recupero dei progetti',
        error: error.message
      });
    }
  });
  
  /**
   * @route   POST /api/admin/projects
   * @desc    Crea un nuovo progetto
   * @access  Solo admin
   */
  router.post('/projects', projectController.createProject);
  
  /**
   * @route   PUT /api/admin/projects/:id
   * @desc    Aggiorna un progetto esistente
   * @access  Solo admin
   */
  router.put('/projects/:id', projectController.updateProject);
  
  /**
   * @route   DELETE /api/admin/projects/:id
   * @desc    Elimina un progetto
   * @access  Solo admin
   */
  // DISABILITIAMO questa route che causa problemi con ID MongoDB
  // router.delete('/projects/:id', async (req, res) => { ... });
  
  // Reindirizza alla route corretta in project.js
  router.delete('/projects/:id', (req, res, next) => {
    console.log('Redirect route: /api/admin/projects/' + req.params.id + ' --> /api/projects/admin/projects/' + req.params.id);
    // Questa route è stata spostata in project.js
    const url = `/api/projects/admin/projects/${req.params.id}`;
    
    // Invia una risposta che spiega dove è stata spostata la route
    res.redirect(307, url);
  });
  
  /**
   * @route   GET /api/admin/projects/stats
   * @desc    Ottiene statistiche sui progetti
   * @access  Solo admin
   */
  router.get('/projects/stats', async (req, res) => {
    try {
      // Conta totale progetti
      const total = await Project.countDocuments();
      
      // Conta progetti attivi
      const active = await Project.countDocuments({ status: 'In corso' });
      
      // Conta progetti completati
      const completed = await Project.countDocuments({ status: 'Completato' });
      
      // Progetti recenti
      const recentProjects = await Project.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('title client status createdAt')
        .populate('client', 'name');
      
      res.json({
        success: true,
        stats: {
          total,
          active,
          completed,
          recentProjects
        }
      });
    } catch (error) {
      console.error('Errore nel recupero statistiche progetti:', error);
      res.status(500).json({
        success: false,
        message: 'Errore nel recupero statistiche progetti'
      });
    }
  });

module.exports = router;
