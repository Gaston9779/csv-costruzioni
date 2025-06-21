const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken, isAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');
const Client = require('../models/Client');
const Project = require('../models/Project');
const mongoose = require('mongoose'); // Aggiungere questa riga per utilizzare mongoose.Types.ObjectId
const Counter = require('../models/Counter');
const bcrypt = require('bcryptjs'); // Aggiungere questa riga per utilizzare bcrypt

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
 * @desc    Ottiene tutti i progetti
 * @access  Solo admin
 */
router.get('/projects', async (req, res) => {
    try {
      console.log("GET /projects: Richiesta ricevuta");
      // Recupera tutti i progetti e popola il campo client per mostrare i dati del cliente
      const projects = await Project.find()
        .populate('client', 'name email') // Solo nome e email del cliente
        .sort({ projectId: -1 }); // Ordina per projectId numerico decrescente
      
      console.log(`GET /projects: Trovati ${projects.length} progetti`);
      
      res.json({
        success: true,
        projects: projects
      });
    } catch (error) {
      console.error('Errore nel recupero progetti:', error);
      res.status(500).json({
        success: false,
        message: 'Errore nel recupero dei progetti'
      });
    }
  });
  
  /**
   * @route   POST /api/admin/projects
   * @desc    Crea un nuovo progetto
   * @access  Solo admin
   */
  router.post('/projects',upload.array('images'), async (req, res) => {
    try {
      console.log("POST /projects: Richiesta ricevuta", req.body);
      
      // Estrai i campi dal body
      const { 
        title, 
        description, 
        category, 
        status, 
        client, 
        startDate, 
        endDate,
        location,
        budget,
        featured,
        visible
      } = req.body;
      
      // Gestione dei file caricati (immagini)
      let images = [];
      if (req.files && req.files.length > 0) {
        // Salva i percorsi relativi dei file nel database
        images = req.files.map(file => ({
          path: file.path.replace(/\\/g, '/'), // Normalizza i percorsi per Windows/Unix
          filename: file.filename,
          originalname: file.originalname,
          mimetype: file.mimetype,
          size: file.size
        }));
        
        console.log(`POST /projects: ${images.length} immagini caricate`);
        
        // Verifica che esista un client valido per creare i documenti
        if (client) {
          // Crea anche i documenti per il cliente
          const Document = require('../models/Document');
          
          // Per ogni file crea un documento associato al cliente
          for (const file of req.files) {
            const document = new Document({
              title: `${title} - ${file.originalname}`,
              file_path: file.path.replace(/\\/g, '/'),
              file_name: file.filename,
              file_type: file.mimetype,
              file_size: file.size,
              client: client,
              uploaded_by: req.user.id
            });
            
            await document.save();
            console.log(`POST /projects: Documento creato per il cliente ${client}: ${document._id}`);
          }
        } else {
          console.log('POST /projects: Cliente non specificato, documenti non creati');
        }
      }
      
      // Crea un nuovo progetto - non serve più impostare manualmente l'ID
      // perché il middleware pre-save lo farà automaticamente
      const newProject = new Project({
        title,
        description,
        category,
        status,
        client, // ID del cliente
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        location,
        budget: budget || 0,
        featured: featured || false,
        visible: visible !== undefined ? visible : true,
        createdBy: req.user.id, // L'ID dell'utente admin che sta creando il progetto
        images: images // Aggiunge le immagini al progetto
      });
      
      await newProject.save();
      
      console.log(`POST /projects: Progetto #${newProject.projectId} creato con successo`);
      
      res.json({
        success: true,
        message: 'Progetto creato con successo',
        project: newProject
      });
    } catch (error) {
      console.error('Errore nella creazione del progetto:', error);
      res.status(500).json({
        success: false,
        message: 'Errore nella creazione del progetto',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });
  
  /**
   * @route   PUT /api/admin/projects/:id
   * @desc    Aggiorna un progetto esistente
   * @access  Solo admin
   */
  router.put('/projects/:id',upload.array('images'), async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      
      // Verifica che l'ID sia un numero valido
      if (isNaN(projectId)) {
        console.error(`ID progetto non valido: ${req.params.id}`);
        return res.status(400).json({
          success: false,
          message: `ID progetto non valido: ${req.params.id} - deve essere un numero`
        });
      }
      
      console.log(`PUT /projects/${projectId}: Richiesta ricevuta`, req.body);
      
      // Estrai i campi dal body
      const updateData = { ...req.body };
      
      // Converte le date se presenti
      if (updateData.startDate) updateData.startDate = new Date(updateData.startDate);
      if (updateData.endDate) updateData.endDate = new Date(updateData.endDate);
      
      // Recupera il progetto esistente per gestire le immagini
      const existingProject = await Project.findOne({ projectId: projectId });
      if (!existingProject) {
        return res.status(404).json({
          success: false,
          message: `Progetto con ID ${projectId} non trovato`
        });
      }
      
      // Gestione delle immagini caricate
      if (req.files && req.files.length > 0) {
        // Crea array di nuove immagini
        const newImages = req.files.map(file => ({
          path: file.path.replace(/\\/g, '/'),
          filename: file.filename,
          originalname: file.originalname,
          mimetype: file.mimetype,
          size: file.size
        }));
        
        console.log(`PUT /projects/${projectId}: ${newImages.length} nuove immagini caricate`);
        
        // Se il progetto già ha immagini, aggiungile all'array esistente
        if (existingProject.images && Array.isArray(existingProject.images)) {
          updateData.images = [...existingProject.images, ...newImages];
        } else {
          // Altrimenti inizializza l'array con le nuove immagini
          updateData.images = newImages;
        }
        
        // Crea anche i documenti per il cliente se è specificato
        if (existingProject.client) {
          const Document = require('../models/Document');
          
          // Per ogni nuovo file crea un documento associato al cliente
          for (const file of req.files) {
            const document = new Document({
              title: `${existingProject.title} - ${file.originalname}`,
              file_path: file.path.replace(/\\/g, '/'),
              file_name: file.filename,
              file_type: file.mimetype,
              file_size: file.size,
              client: existingProject.client,
              uploaded_by: req.user.id
            });
            
            await document.save();
            console.log(`PUT /projects/${projectId}: Documento creato per il cliente ${existingProject.client}: ${document._id}`);
          }
        } else {
          console.log(`PUT /projects/${projectId}: Cliente non specificato, documenti non creati`);
        }
      }
      
      // Aggiorna il progetto usando projectId
      const project = await Project.findOneAndUpdate(
        { projectId: projectId }, // Cerca per projectId
        updateData,
        { new: true, runValidators: true }
      ).populate('client', 'name email');
      
      if (!project) {
        console.error(`PUT /projects/${projectId}: Progetto non trovato`);
        return res.status(404).json({
          success: false,
          message: `Progetto con ID ${projectId} non trovato`
        });
      }
      
      console.log(`PUT /projects/${projectId}: Progetto aggiornato con successo`);
      
      res.json({
        success: true,
        message: 'Progetto aggiornato con successo',
        project
      });
    } catch (error) {
      console.error('Errore nell\'aggiornamento del progetto:', error);
      res.status(500).json({
        success: false,
        message: 'Errore nell\'aggiornamento del progetto',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });
  
  /**
   * @route   DELETE /api/admin/projects/:id
   * @desc    Elimina un progetto
   * @access  Solo admin
   */
  router.delete('/projects/:id', async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      
      // Verifica che l'ID sia un numero valido
      if (isNaN(projectId)) {
        console.error(`ID progetto non valido: ${req.params.id}`);
        return res.status(400).json({
          success: false,
          message: `ID progetto non valido: ${req.params.id} - deve essere un numero`
        });
      }
      
      console.log(`DELETE /projects/${projectId}: Richiesta ricevuta`);
      
      // Elimina il progetto usando projectId
      const project = await Project.findOneAndDelete({ projectId: projectId });
      
      if (!project) {
        console.error(`DELETE /projects/${projectId}: Progetto non trovato`);
        return res.status(404).json({
          success: false,
          message: `Progetto con ID ${projectId} non trovato`
        });
      }
      
      console.log(`DELETE /projects/${projectId}: Progetto eliminato con successo`);
      
      res.json({
        success: true,
        message: 'Progetto eliminato con successo'
      });
    } catch (error) {
      console.error('Errore nell\'eliminazione del progetto:', error);
      res.status(500).json({
        success: false,
        message: 'Errore nell\'eliminazione del progetto'
      });
    }
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
