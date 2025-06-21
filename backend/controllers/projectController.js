const Project = require('../models/Project');
const Client = require('../models/Client');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose'); // Aggiunto require mongoose

// Configurazione multer per upload immagini progetti
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../uploads/projects');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'project-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Solo immagini sono permesse (jpeg, jpg, png, gif, webp)'));
    }
  }
});

// Middleware per upload multiplo
module.exports.uploadProjectImages = upload.array('images', 10);

// Ottieni tutti i progetti (Direzionale - per il frontend)
module.exports.getPublicProjects = async (req, res) => {
  try {
    const { category, featured, limit = 10, page = 1 } = req.query;
    
    const filter = { visible: true };
    if (category && category !== 'all') {
      filter.category = category;
    }
    if (featured === 'true') {
      filter.featured = true;
    }

    const skip = (page - 1) * limit;
    
    const projects = await Project.find(filter)
      .populate('client', 'name')
      .sort({ featured: -1, createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Project.countDocuments(filter);

    res.json({
      success: true,
      projects,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Errore nel recupero progetti pubblici:', error);
    res.status(500).json({
      success: false,
      message: 'Errore interno del server'
    });
  }
};

// Ottieni singolo progetto (Direzionale)
module.exports.getPublicProject = async (req, res) => {
  try {
    const project = await Project.findOne({ 
      _id: req.params.id, 
      visible: true 
    }).populate('client', 'name');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Progetto non trovato'
      });
    }

    res.json({
      success: true,
      project
    });
  } catch (error) {
    console.error('Errore nel recupero progetto:', error);
    res.status(500).json({
      success: false,
      message: 'Errore interno del server'
    });
  }
};

// Ottieni tutti i progetti (admin)
module.exports.getAllProjects = async (req, res) => {
  try {
    const { category, status, client, page = 1, limit = 10 } = req.query;
    
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
    
    const projects = await Project.find(filter)
      .populate('client', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Project.countDocuments(filter);

    res.json({
      success: true,
      projects,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Errore nel recupero progetti admin:', error);
    res.status(500).json({
      success: false,
      message: 'Errore interno del server'
    });
  }
};

// Crea nuovo progetto (solo admin)
module.exports.createProject = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      client, 
      category, 
      status, 
      startDate, 
      endDate, 
      budget, 
      visible, 
      featured 
    } = req.body;

    // Gestione immagini
    const images = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        images.push({
          filename: file.filename,
          path: file.path,
          size: file.size,
          mimetype: file.mimetype,
          url: `/uploads/projects/${file.filename}`
        });
      });
    }

    const project = new Project({
      title,
      description,
      client,
      category,
      status,
      startDate,
      endDate,
      budget: parseFloat(budget),
      visible: visible === 'true',
      featured: featured === 'true',
      images,
      createdBy: req.user.id
    });

    await project.save();

    const populatedProject = await Project.findById(project._id)
      .populate('client', 'name email')
      .populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Progetto creato con successo',
      project: populatedProject
    });
  } catch (error) {
    console.error('Errore nella creazione progetto:', error);
    res.status(500).json({
      success: false,
      message: 'Errore interno del server',
      error: error.message
    });
  }
};

// Aggiorna progetto (solo admin)
module.exports.updateProject = async (req, res) => {
  try {
    const projectId = req.params.id;
    const { 
      title, 
      description, 
      client, 
      category, 
      status, 
      startDate, 
      endDate, 
      budget, 
      visible, 
      featured,
      replaceImages
    } = req.body;

    const updateData = {
      title,
      description,
      category,
      status,
      startDate,
      endDate,
      budget: parseFloat(budget),
      visible: visible === 'true',
      featured: featured === 'true',
      updatedAt: Date.now()
    };

    // Aggiungi client solo se è un ObjectId valido o un riferimento a un client esistente
    if (client) {
      // Se client è un ObjectId valido, usalo direttamente
      if (mongoose.Types.ObjectId.isValid(client)) {
        updateData.client = client;
      } else {
        // Altrimenti, cerca il client per nome
        const clientDoc = await Client.findOne({ name: client });
        if (clientDoc) {
          updateData.client = clientDoc._id;
        } else {
          return res.status(400).json({
            success: false,
            message: "Client non valido o non trovato"
          });
        }
      }
    }

    // Gestione immagini
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => ({
        filename: file.filename,
        path: file.path,
        size: file.size,
        mimetype: file.mimetype,
        url: `/uploads/projects/${file.filename}`
      }));

      // Aggiungi alle immagini esistenti o sostituisci
      if (replaceImages === 'true') {
        updateData.images = newImages;
      } else {
        const existingProject = await Project.findById(projectId);
        updateData.images = [...(existingProject.images || []), ...newImages];
      }
    }

    const project = await Project.findByIdAndUpdate(
      projectId,
      updateData,
      { new: true, runValidators: true }
    ).populate('client', 'name email').populate('createdBy', 'name email');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Progetto non trovato'
      });
    }

    res.json({
      success: true,
      message: 'Progetto aggiornato con successo',
      project
    });
  } catch (error) {
    console.error('Errore nell\'aggiornamento progetto:', error);
    res.status(500).json({
      success: false,
      message: 'Errore interno del server',
      error: error.message
    });
  }
};

// Elimina progetto (solo admin)
module.exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Progetto non trovato'
      });
    }

    // Elimina le immagini associate
    if (project.images && project.images.length > 0) {
      project.images.forEach(image => {
        if (fs.existsSync(image.path)) {
          fs.unlinkSync(image.path);
        }
      });
    }

    // Elimina i documenti associati al progetto
    const Document = require('../models/Document');
    await Document.deleteMany({ project: req.params.id });

    // Elimina il progetto
    await Project.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Progetto e documenti associati eliminati con successo'
    });
  } catch (error) {
    console.error('Errore nell\'eliminazione progetto:', error);
    res.status(500).json({
      success: false,
      message: 'Errore interno del server'
    });
  }
};

// Elimina singola immagine da progetto
module.exports.deleteProjectImage = async (req, res) => {
  try {
    const { projectId, imageId } = req.params;
    
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Progetto non trovato'
      });
    }

    const imageIndex = project.images.findIndex(img => img._id.toString() === imageId);
    if (imageIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Immagine non trovata'
      });
    }

    const image = project.images[imageIndex];
    
    // Elimina il file fisico
    if (fs.existsSync(image.path)) {
      fs.unlinkSync(image.path);
    }

    // Rimuovi dall'array
    project.images.splice(imageIndex, 1);
    await project.save();

    res.json({
      success: true,
      message: 'Immagine eliminata con successo'
    });
  } catch (error) {
    console.error('Errore nell\'eliminazione immagine:', error);
    res.status(500).json({
      success: false,
      message: 'Errore interno del server'
    });
  }
};

// Ottieni statistiche progetti (admin)
module.exports.getProjectStats = async (req, res) => {
  try {
    const totalProjects = await Project.countDocuments();
    const activeProjects = await Project.countDocuments({ status: 'In corso' });
    const completedProjects = await Project.countDocuments({ status: 'Completato' });
    const featuredProjects = await Project.countDocuments({ featured: true });

    const projectsByCategory = await Project.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    const projectsByStatus = await Project.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      stats: {
        total: totalProjects,
        active: activeProjects,
        completed: completedProjects,
        featured: featuredProjects,
        byCategory: projectsByCategory,
        byStatus: projectsByStatus
      }
    });
  } catch (error) {
    console.error('Errore nel recupero statistiche progetti:', error);
    res.status(500).json({
      success: false,
      message: 'Errore interno del server'
    });
  }
};
