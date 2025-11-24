const multer = require('multer');
const path = require('path');
const fs = require('fs');
const projectService = require('../services/projectService');
const apartmentService = require('../services/apartmentService');
const { multipartMiddleware } = require('../services/multipartParser');
const { standardizeProjectResponse } = require('../utils/projectHelpers');

/**
 * Configurazione multer per upload immagini
 */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath;
    if (file.fieldname === 'apartmentImages') {
      uploadPath = path.join(__dirname, '../uploads/apartments');
    } else {
      uploadPath = path.join(__dirname, '../uploads/projects');
    }
    
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    
    if (file.fieldname === 'apartmentImages') {
      cb(null, 'apartment-' + uniqueSuffix + extension);
    } else {
      cb(null, 'project-' + uniqueSuffix + extension);
    }
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif',
      'image/webp', 'image/heic', 'image/heif', 'image/bmp',
      'image/tiff', 'image/svg+xml'
    ];
    
    const allowedExtensions = /\.(jpg|jpeg|png|gif|webp|heic|heif|bmp|tiff|svg)$/i;
    const extname = allowedExtensions.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedMimeTypes.includes(file.mimetype.toLowerCase());

    if (mimetype || extname) {
      return cb(null, true);
    } else {
      cb(new Error('Solo immagini sono permesse'));
    }
  }
});

// ==================== PROGETTI ====================

/**
 * Crea un nuovo progetto
 */
module.exports.createProject = async (req, res) => {
  try {
    const project = await projectService.createProject(
      req.body,
      req.user,
      req.files || []
    );
    
    res.status(201).json({
      success: true,
      message: 'Progetto creato con successo',
      project
    });
  } catch (error) {
    console.error('Errore nella creazione del progetto:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Errore interno del server',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Aggiorna un progetto esistente
 */
module.exports.updateProject = async (req, res) => {
  try {
    const project = await projectService.updateProject(
      req.params.id,
      req.body,
      req.files || []
    );
    
    res.json({
      success: true,
      message: 'Progetto aggiornato con successo',
      project
    });
  } catch (error) {
    console.error('Errore nell\'aggiornamento del progetto:', error);
    
    if (error.message === 'Progetto non trovato') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: error.message || 'Errore interno del server',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Entry point per update che gestisce multipart e JSON
 */
module.exports.updateProjectEntry = async (req, res) => {
  try {
    const contentType = req.headers['content-type'] || '';
    
    if (contentType.includes('multipart/form-data')) {
      // Usa il middleware multipart
      return multipartMiddleware(true)(req, res, () => {
        module.exports.updateProject(req, res);
      });
    }
    
    // Default: JSON
    return module.exports.updateProject(req, res);
  } catch (err) {
    console.error('Errore in updateProjectEntry:', err);
    return res.status(500).json({
      success: false,
      message: 'Errore interno',
      error: err.message
    });
  }
};

/**
 * Recupera tutti i progetti (admin)
 */
module.exports.getAllProjects = async (req, res) => {
  try {
    const { projects, pagination } = await projectService.getProjects(req.query, false);
    
    res.json({
      success: true,
      projects,
      pagination
    });
  } catch (error) {
    console.error('Errore nel recupero dei progetti:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nel recupero dei progetti',
      error: error.message
    });
  }
};

/**
 * Recupera tutti i progetti pubblici
 */
module.exports.getPublicProjects = async (req, res) => {
  try {
    const startTime = Date.now();
    console.log('⏱️ getPublicProjects START');
    
    const { projects, pagination } = await projectService.getProjects(req.query, true);
    
    const duration = Date.now() - startTime;
    console.log(`✅ getPublicProjects completato in ${duration}ms - ${projects.length} progetti`);
    
    res.json({
      success: true,
      projects,
      pagination
    });
  } catch (error) {
    console.error('❌ Errore nel recupero progetti pubblici:', error);
    res.status(500).json({
      success: false,
      message: 'Errore interno del server',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Recupera un singolo progetto (admin)
 */
module.exports.getProject = async (req, res) => {
  try {
    const project = await projectService.getProjectById(req.params.id, false);
    
    res.json({
      success: true,
      project
    });
  } catch (error) {
    console.error('Errore nel recupero del progetto:', error);
    
    if (error.message === 'Progetto non trovato') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Errore nel recupero del progetto',
      error: error.message
    });
  }
};

/**
 * Recupera un singolo progetto pubblico
 */
module.exports.getPublicProject = async (req, res) => {
  try {
    const project = await projectService.getProjectById(req.params.id, true);
    
    res.json({
      success: true,
      project
    });
  } catch (error) {
    console.error('Errore nel recupero progetto:', error);
    
    if (error.message === 'Progetto non trovato') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Errore interno del server'
    });
  }
};

/**
 * Elimina un progetto
 */
module.exports.deleteProject = async (req, res) => {
  try {
    // Verifica ID valido
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: `ID progetto non valido: ${req.params.id}`
      });
    }
    
    await projectService.deleteProject(req.params.id);
    
    res.json({
      success: true,
      message: 'Progetto e documenti associati eliminati con successo'
    });
  } catch (error) {
    console.error('Errore nell\'eliminazione progetto:', error);
    
    if (error.message === 'Progetto non trovato') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Errore interno del server'
    });
  }
};

/**
 * Recupera le statistiche dei progetti
 */
module.exports.getProjectStats = async (req, res) => {
  try {
    const stats = await projectService.getProjectStats();
    
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Errore nel recupero statistiche progetti:', error);
    res.status(500).json({
      success: false,
      message: 'Errore interno del server'
    });
  }
};

// ==================== APPARTAMENTI ====================

/**
 * Aggiunge un appartamento a un progetto
 */
module.exports.addApartmentToProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    
    // Estrai i dati dell'appartamento
    let apartmentData;
    if (req.body.apartmentData) {
      apartmentData = JSON.parse(req.body.apartmentData);
    } else {
      apartmentData = req.body;
    }
    
    const { apartment, project } = await apartmentService.addApartment(
      projectId,
      apartmentData,
      req.files || []
    );
    
    res.status(201).json({
      success: true,
      message: 'Appartamento aggiunto con successo',
      apartment,
      project,
      projectType: project.projectType
    });
  } catch (error) {
    console.error('Errore nell\'aggiunta dell\'appartamento:', error);
    
    const statusCode = error.message.includes('non trovato') ? 404 : 
                       error.message.includes('Solo i progetti') ? 400 : 500;
    
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Errore interno del server',
      error: error.message
    });
  }
};

/**
 * Aggiorna un appartamento
 */
module.exports.updateApartment = async (req, res) => {
  try {
    const { projectId, apartmentId } = req.params;
    
    // Estrai i dati dell'appartamento
    const updateData = req.body.apartmentData ? 
      JSON.parse(req.body.apartmentData) : req.body;
    
    const { apartment, project } = await apartmentService.updateApartment(
      projectId,
      apartmentId,
      updateData,
      req.files || []
    );
    
    res.json({
      success: true,
      message: 'Appartamento aggiornato con successo',
      apartment,
      project,
      projectType: project.projectType
    });
  } catch (error) {
    console.error('Errore nell\'aggiornamento dell\'appartamento:', error);
    
    const statusCode = error.message.includes('non trovato') ? 404 : 500;
    
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Errore interno del server',
      error: error.message
    });
  }
};

/**
 * Elimina un appartamento
 */
module.exports.deleteApartment = async (req, res) => {
  try {
    const { projectId, apartmentId } = req.params;
    
    const project = await apartmentService.deleteApartment(projectId, apartmentId);
    
    res.json({
      success: true,
      message: 'Appartamento eliminato con successo',
      project
    });
  } catch (error) {
    console.error('Errore nell\'eliminazione dell\'appartamento:', error);
    
    const statusCode = error.message.includes('non trovato') ? 404 : 500;
    
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Errore interno del server',
      error: error.message
    });
  }
};

/**
 * Aggiunge immagini a un appartamento
 */
module.exports.addApartmentImages = async (req, res) => {
  try {
    const { projectId, apartmentId } = req.params;
    
    const { apartment, project } = await apartmentService.addApartmentImages(
      projectId,
      apartmentId,
      req.files || [],
      req.body
    );
    
    res.status(201).json({
      success: true,
      message: 'Immagini aggiunte con successo',
      apartment,
      project
    });
  } catch (error) {
    console.error('Errore nell\'aggiunta delle immagini:', error);
    
    const statusCode = error.message.includes('non trovato') ? 404 :
                       error.message.includes('Nessuna immagine') ? 400 : 500;
    
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Errore interno del server',
      error: error.message
    });
  }
};

/**
 * Elimina un'immagine da un appartamento
 */
module.exports.deleteApartmentImage = async (req, res) => {
  try {
    const { projectId, apartmentId, imageId } = req.params;
    
    const { apartment, project } = await apartmentService.deleteApartmentImage(
      projectId,
      apartmentId,
      imageId
    );
    
    res.json({
      success: true,
      message: 'Immagine eliminata con successo',
      apartment,
      project
    });
  } catch (error) {
    console.error('Errore nell\'eliminazione dell\'immagine:', error);
    
    const statusCode = error.message.includes('non trovato') ? 404 : 500;
    
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Errore interno del server',
      error: error.message
    });
  }
};

// ==================== IMMAGINI PROGETTI ====================

/**
 * Elimina un'immagine da un progetto
 */
module.exports.deleteProjectImage = async (req, res) => {
  try {
    const { projectId, imageId } = req.params;
    const { deleteFromCloudinary } = require('../utils/cloudinaryUpload');
    const Project = require('../models/Project');
    
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
    
    // Elimina da Cloudinary
    if (image.cloudinaryId || image.filename) {
      await deleteFromCloudinary(image.cloudinaryId || image.filename);
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

// ==================== MIDDLEWARE & UTILITIES ====================

/**
 * Middleware per gestire gli errori
 */
module.exports.errorHandler = (err, req, res, next) => {
  console.error('Errore nel controller progetto:', err);
  res.status(500).json({
    success: false,
    message: 'Errore interno del server',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
};

/**
 * Export multer upload middleware
 */
module.exports.upload = upload;

/**
 * Export multipart middleware
 */
module.exports.multipartMiddleware = multipartMiddleware;

/**
 * Export standardizeProjectResponse per compatibilità
 */
module.exports.standardizeProjectResponse = standardizeProjectResponse;
