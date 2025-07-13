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
module.exports.uploadProjectImages = multer({
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
}).any();

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
    
    // SOLUZIONE DEFINITIVA: Esegui la query NON usando .lean() o .select()
    const rawProjects = await Project.find(filter)
      .populate('client', 'name email')
      .populate('createdBy', 'name email')
      .sort(sortOption)
      .limit(parseInt(limit))
      .skip(skip);
      
    // Converti manualmente in oggetti JS con spread operator per preservare TUTTI i campi
    const projects = rawProjects.map(doc => {
      // Converti in oggetto JavaScript semplice
      const plainProject = JSON.parse(JSON.stringify(doc));
      
      // Mantieni il projectType originale o usa default solo se manca
      return {
        ...plainProject,
        projectType: plainProject.projectType || 'Singola', 
        apartments: plainProject.apartments || []
      };
    });
    
    console.log(`RISPOSTA FINALE: ${projects.length} progetti recuperati`);
    projects.forEach(p => console.log(`ID: ${p._id}, Titolo: ${p.title}, ProjectType: ${p.projectType}, Apartments: ${p.apartments ? p.apartments.length : 0}`));
    
    const total = await Project.countDocuments(filter);
    
    res.json({
      success: true,
      projects,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
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

// Crea nuovo progetto (solo admin)
module.exports.createProject = async (req, res) => {
  try {
    // Log completo di tutto il body e file
    console.log('BODY COMPLETO RICEVUTO:', req.body);
    console.log('FILES:', req.files ? req.files.map(f => f.fieldname) : 'nessuno');

    const { 
      title, 
      description, 
      client, 
      category,
      projectType,
      status, 
      startDate, 
      endDate, 
      budget, 
      visible, 
      featured,
      apartments
    } = req.body;

    console.log('VALORI ESTRATTI:');
    console.log('- projectType:', projectType);
    console.log('- apartments:', apartments);
    console.log('- client:', client, typeof client);

    // Validazioni base
    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Il titolo è obbligatorio'
      });
    }

    // Gestione immagini del progetto principale
    const images = [];
    if (req.files && req.files.length > 0) {
      const projectImages = req.files.filter(file => file.fieldname === 'images');
      projectImages.forEach(file => {
        images.push({
          filename: file.filename,
          path: file.path,
          size: file.size,
          mimetype: file.mimetype,
          url: `/uploads/projects/${file.filename}`
        });
      });
    }

    // Crea il progetto base
    const projectData = {
      title,
      description,
      // Assicurati che client sia un ObjectId valido o null, mai una stringa vuota
      client: client && client !== "" ? client : null,
      category,
      projectType: projectType || 'Singola',
      status,
      startDate,
      endDate,
      budget: parseFloat(budget) || 0,
      visible: visible === 'true',
      featured: featured === 'true',
      images,
      createdBy: req.user.id
    };

    // Gestione degli appartamenti per progetti multiproprietà
    if (apartments) {
      try {
        let parsedApartments;
        
        if (typeof apartments === 'string') {
          parsedApartments = JSON.parse(apartments);
          console.log('Apartments JSON parsed:', parsedApartments);
        } else {
          parsedApartments = apartments;
          console.log('Apartments already object:', parsedApartments);
        }
        
        if (!Array.isArray(parsedApartments)) {
          console.error('Apartments non è un array', parsedApartments);
          parsedApartments = [];
        }
        
        // Prepara array di appartamenti
        projectData.apartments = [];
        
        for (let i = 0; i < parsedApartments.length; i++) {
          const apt = parsedApartments[i];
          console.log(`Elaboro appartamento ${i}:`, apt);
          
          // Raccogli le immagini per questo appartamento
          const aptImages = [];
          if (req.files && req.files.length > 0) {
            const apartmentImageField = `apartment_${i}_image`;
            const apartmentImages = req.files.filter(file => file.fieldname === apartmentImageField);
            
            apartmentImages.forEach(file => {
              aptImages.push({
                filename: file.filename,
                path: file.path,
                size: file.size,
                mimetype: file.mimetype,
                url: `/uploads/apartments/${file.filename}`
              });
            });
          }
          
          // Aggiungi l'appartamento completo
          projectData.apartments.push({
            title: apt.title || `Appartamento ${i+1}`,
            description: apt.description || '',
            squareMeters: apt.squareMeters || 0,
            floor: apt.floor || 0,
            bedrooms: apt.bedrooms || 0,
            bathrooms: apt.bathrooms || 0,
            budget: apt.budget || 0,
            status: apt.status || 'Disponibile',
            images: aptImages
          });
        }
        
        // Aggiorna il numero totale di unità
        projectData.totalUnits = projectData.apartments.length;
      } catch (e) {
        console.error('Errore nel parsing degli appartamenti:', e);
      }
    }

    // Debug
    console.log('Project data FINALE prima del salvataggio:', JSON.stringify(projectData, null, 2));

    const project = new Project(projectData);
    const savedProject = await project.save();
    
    // Recupera il progetto completo dopo il salvataggio
    const populatedProject = await Project.findById(savedProject._id)
      .populate('client', 'name email')
      .populate('createdBy', 'name email')
      .lean();

    // Controlla che tutti i campi siano presenti
    console.log('PROGETTO SALVATO - CAMPI:', Object.keys(populatedProject));
    console.log('PROGETTO SALVATO - projectType:', populatedProject.projectType);
    console.log('PROGETTO SALVATO - apartments:', populatedProject.apartments ? populatedProject.apartments.length : 'nessuno');
    
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

// Aggiorna progetto esistente (solo admin)
module.exports.updateProject = async (req, res) => {
  try {
    console.log('Body ricevuto per update:', Object.keys(req.body));
    console.log('Files ricevuti per update:', req.files ? req.files.length : 'nessun file');
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        console.log('File ricevuto per update:', file.fieldname, file.originalname);
      });
    }

    const projectId = req.params.id;
    const { 
      title, 
      description, 
      client, 
      category,
      projectType,
      status, 
      startDate, 
      endDate, 
      budget, 
      visible, 
      featured,
      replaceImages,
      apartments,
      imagesToDelete
    } = req.body;

    // Recupera il progetto esistente
    const existingProject = await Project.findById(projectId);
    if (!existingProject) {
      return res.status(404).json({
        success: false,
        message: 'Progetto non trovato'
      });
    }

    const updateData = {
      title,
      description,
      client: client && client !== "" ? client : null,
      category,
      projectType: projectType || existingProject.projectType,
      status,
      startDate,
      endDate,
      budget: parseFloat(budget) || 0,
      visible: visible === 'true',
      featured: featured === 'true'
    };

    // Gestione delle immagini da eliminare
    if (imagesToDelete) {
      try {
        const imagesToDeleteArray = Array.isArray(imagesToDelete) ? 
          imagesToDelete : JSON.parse(imagesToDelete);
          
        if (Array.isArray(imagesToDeleteArray) && imagesToDeleteArray.length > 0) {
          // Filtra le immagini da mantenere
          const updatedImages = existingProject.images.filter(img => {
            const shouldDelete = imagesToDeleteArray.includes(img._id.toString());
            if (shouldDelete && fs.existsSync(img.path)) {
              fs.unlinkSync(img.path); // Elimina il file
            }
            return !shouldDelete;
          });
          
          existingProject.images = updatedImages;
          await existingProject.save();
        }
      } catch (error) {
        console.error('Errore nella gestione delle immagini da eliminare:', error);
      }
    }

    // Gestione immagini del progetto principale
    if (req.files && req.files.length > 0) {
      const projectImages = req.files.filter(file => file.fieldname === 'images');
      if (projectImages.length > 0) {
        const newImages = projectImages.map(file => ({
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
          updateData.images = [...(existingProject.images || []), ...newImages];
        }
      }
    }

    // Gestione degli appartamenti per progetti multiproprietà
    if (projectType === 'Multiproprietà' && apartments) {
      let parsedApartments;
      
      try {
        // Verifica se apartments è già un array o deve essere parsato da JSON
        if (typeof apartments === 'string') {
          parsedApartments = JSON.parse(apartments);
        } else if (Array.isArray(apartments)) {
          parsedApartments = apartments;
        } else {
          parsedApartments = existingProject.apartments || [];
        }
        console.log('Appartamenti parsed per update:', parsedApartments);
      } catch (e) {
        console.error('Errore nel parsing degli appartamenti per update:', e);
        parsedApartments = existingProject.apartments || [];
      }
      
      // Prepara array di appartamenti
      updateData.apartments = [];
      
      // Popoliamo ogni appartamento con i dati
      for (let i = 0; i < parsedApartments.length; i++) {
        const apt = parsedApartments[i];
        
        // Cerca l'appartamento esistente per ID se presente
        const existingApt = apt._id 
          ? existingProject.apartments.find(a => a._id.toString() === apt._id.toString())
          : null;
        
        // Raccogli le immagini per questo appartamento
        const aptImages = [];
        if (req.files && req.files.length > 0) {
          const apartmentImageField = `apartment_${i}_image`;
          const apartmentImages = req.files.filter(file => file.fieldname === apartmentImageField);
          
          apartmentImages.forEach(file => {
            aptImages.push({
              filename: file.filename,
              path: file.path,
              size: file.size,
              mimetype: file.mimetype,
              url: `/uploads/apartments/${file.filename}`
            });
          });
        }
        
        // Aggiungi l'appartamento completo con immagini al progetto
        updateData.apartments.push({
          _id: apt._id || new mongoose.Types.ObjectId(),
          title: apt.title || `Appartamento ${i+1}`,
          description: apt.description || '',
          squareMeters: apt.squareMeters || 0,
          floor: apt.floor || 0,
          bedrooms: apt.bedrooms || 0,
          bathrooms: apt.bathrooms || 0,
          budget: apt.budget || 0,
          status: apt.status || 'Disponibile',
          // Combina immagini esistenti con nuove immagini
          images: [...(existingApt ? existingApt.images : []), ...aptImages]
        });
      }
      
      // Aggiorna il numero totale di unità
      updateData.totalUnits = updateData.apartments.length;
    }
    
    // Debug
    console.log('Update data prima dell\'aggiornamento:', JSON.stringify(updateData, null, 2));

    const project = await Project.findByIdAndUpdate(
      projectId,
      updateData,
      { new: true }
    )
    .populate('client', 'name email')
    .populate('createdBy', 'name email')
    .lean(); // Usa lean per ottenere un oggetto JavaScript semplice

    console.log('Progetto aggiornato:', JSON.stringify({
      id: project._id,
      title: project.title,
      projectType: project.projectType,
      apartmentsCount: project.apartments ? project.apartments.length : 0,
      allFields: Object.keys(project)
    }, null, 2));

    res.json({
      success: true,
      message: 'Progetto aggiornato con successo',
      project: standardizeProjectResponse(project)
    });
  } catch (error) {
    console.error('Errore nell\'aggiornamento del progetto:', error);
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
    console.log('ID progetto ricevuto per eliminazione:', req.params.id);
    
    // Verifichiamo se è un ID MongoDB valido
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: `ID progetto non valido: ${req.params.id}`
      });
    }
    
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: `Progetto con ID ${req.params.id} non trovato`
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
    
    // Nuova analisi per tipo di progetto
    const projectsByType = await Project.aggregate([
      { $group: { _id: '$projectType', count: { $sum: 1 } } }
    ]);
    
    // Calcola il numero totale di unità abitative
    const totalUnits = await Project.aggregate([
      { $match: { projectType: 'Multiproprietà' } },
      { $project: { apartmentsCount: { $size: "$apartments" } } },
      { $group: { _id: null, totalUnits: { $sum: "$apartmentsCount" } } }
    ]);

    res.json({
      success: true,
      stats: {
        total: totalProjects,
        active: activeProjects,
        completed: completedProjects,
        featured: featuredProjects,
        byCategory: projectsByCategory,
        byStatus: projectsByStatus,
        byType: projectsByType,
        totalUnits: totalUnits.length > 0 ? totalUnits[0].totalUnits : 0
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

// Aggiunge un appartamento a un progetto multiproprietà
module.exports.addApartmentToProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    
    // Verifica che il progetto esista
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Progetto non trovato'
      });
    }

    // Verifica che sia un progetto multiproprietà
    if (project.projectType !== 'Multiproprietà') {
      return res.status(400).json({
        success: false,
        message: 'Solo i progetti multiproprietà possono avere appartamenti'
      });
    }

    // Crea il nuovo appartamento
    const newApartment = req.body;
    
    // Aggiungi l'appartamento al progetto
    project.apartments.push(newApartment);
    project.totalUnits = project.apartments.length;
    
    await project.save();
    
    res.status(201).json({
      success: true,
      message: 'Appartamento aggiunto con successo',
      apartment: project.apartments[project.apartments.length - 1],
      project: standardizeProjectResponse(project)
    });
  } catch (error) {
    console.error('Errore nell\'aggiunta dell\'appartamento:', error);
    res.status(500).json({
      success: false,
      message: 'Errore interno del server',
      error: error.message
    });
  }
};

// Aggiorna un appartamento esistente
module.exports.updateApartment = async (req, res) => {
  try {
    const { projectId, apartmentId } = req.params;
    const updateData = req.body;
    
    // Cerca il progetto
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Progetto non trovato'
      });
    }
    
    // Cerca l'appartamento nel progetto
    const apartmentIndex = project.apartments.findIndex(apt => apt._id.toString() === apartmentId);
    if (apartmentIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Appartamento non trovato'
      });
    }
    
    // Aggiorna i campi dell'appartamento
    Object.keys(updateData).forEach(key => {
      project.apartments[apartmentIndex][key] = updateData[key];
    });
    
    await project.save();
    
    res.json({
      success: true,
      message: 'Appartamento aggiornato con successo',
      apartment: project.apartments[apartmentIndex],
      project: standardizeProjectResponse(project)
    });
  } catch (error) {
    console.error('Errore nell\'aggiornamento dell\'appartamento:', error);
    res.status(500).json({
      success: false,
      message: 'Errore interno del server',
      error: error.message
    });
  }
};

// Elimina un appartamento
module.exports.deleteApartment = async (req, res) => {
  try {
    const { projectId, apartmentId } = req.params;
    
    // Trova il progetto
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Progetto non trovato'
      });
    }

    // Trova l'appartamento
    const apartmentIndex = project.apartments.findIndex(apt => apt._id.toString() === apartmentId);
    if (apartmentIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Appartamento non trovato'
      });
    }

    // Elimina le immagini associate all'appartamento
    if (project.apartments[apartmentIndex].images && project.apartments[apartmentIndex].images.length > 0) {
      project.apartments[apartmentIndex].images.forEach(image => {
        if (fs.existsSync(image.path)) {
          fs.unlinkSync(image.path);
        }
      });
    }

    // Rimuovi l'appartamento dall'array
    project.apartments.splice(apartmentIndex, 1);
    project.totalUnits = project.apartments.length;
    
    await project.save();
    
    res.json({
      success: true,
      message: 'Appartamento eliminato con successo',
      project: standardizeProjectResponse(project)
    });
  } catch (error) {
    console.error('Errore nell\'eliminazione dell\'appartamento:', error);
    res.status(500).json({
      success: false,
      message: 'Errore interno del server',
      error: error.message
    });
  }
};

// Middleware per upload immagini appartamento
module.exports.uploadApartmentImages = upload.array('images', 10);

// Aggiungi immagini a un appartamento
module.exports.addApartmentImages = async (req, res) => {
  try {
    const { projectId, apartmentId } = req.params;
    const files = req.files;
    
    // Verifica se ci sono file
    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Nessuna immagine caricata'
      });
    }
    
    // Trova il progetto
    const project = await Project.findById(projectId);
    if (!project) {
      // Elimina i file caricati se il progetto non esiste
      files.forEach(file => {
        fs.unlinkSync(file.path);
      });
      return res.status(404).json({
        success: false,
        message: 'Progetto non trovato'
      });
    }
    
    // Trova l'appartamento
    const apartmentIndex = project.apartments.findIndex(apt => apt._id.toString() === apartmentId);
    if (apartmentIndex === -1) {
      // Elimina i file caricati se l'appartamento non esiste
      files.forEach(file => {
        fs.unlinkSync(file.path);
      });
      return res.status(404).json({
        success: false,
        message: 'Appartamento non trovato'
      });
    }
    
    // Crea array di immagini se non esiste
    if (!project.apartments[apartmentIndex].images) {
      project.apartments[apartmentIndex].images = [];
    }
    
    // Aggiungi le immagini all'appartamento
    files.forEach(file => {
      project.apartments[apartmentIndex].images.push({
        filename: path.basename(file.path),
        path: file.path,
        originalName: file.originalname
      });
    });
    
    await project.save();
    
    res.status(201).json({
      success: true,
      message: 'Immagini aggiunte con successo',
      apartment: project.apartments[apartmentIndex],
      project: standardizeProjectResponse(project)
    });
  } catch (error) {
    console.error('Errore nell\'aggiunta delle immagini:', error);
    res.status(500).json({
      success: false,
      message: 'Errore interno del server',
      error: error.message
    });
  }
};

// Elimina un'immagine da un appartamento
module.exports.deleteApartmentImage = async (req, res) => {
  try {
    const { projectId, apartmentId, imageId } = req.params;
    
    // Trova il progetto
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Progetto non trovato'
      });
    }
    
    // Trova l'appartamento
    const apartmentIndex = project.apartments.findIndex(apt => apt._id.toString() === apartmentId);
    if (apartmentIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Appartamento non trovato'
      });
    }
    
    // Verifica che l'appartamento abbia immagini
    if (!project.apartments[apartmentIndex].images || project.apartments[apartmentIndex].images.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Nessuna immagine trovata per questo appartamento'
      });
    }
    
    // Trova l'immagine
    const imageIndex = project.apartments[apartmentIndex].images.findIndex(img => img._id.toString() === imageId);
    if (imageIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Immagine non trovata'
      });
    }
    
    const image = project.apartments[apartmentIndex].images[imageIndex];
    
    // Elimina il file fisico
    if (fs.existsSync(image.path)) {
      fs.unlinkSync(image.path);
    }
    
    // Rimuovi dall'array
    project.apartments[apartmentIndex].images.splice(imageIndex, 1);
    await project.save();
    
    res.json({
      success: true,
      message: 'Immagine eliminata con successo',
      apartment: project.apartments[apartmentIndex],
      project: standardizeProjectResponse(project)
    });
  } catch (error) {
    console.error('Errore nell\'eliminazione dell\'immagine:', error);
    res.status(500).json({
      success: false,
      message: 'Errore interno del server',
      error: error.message
    });
  }
};

// Funzione helper per standardizzare le risposte dei progetti
const standardizeProjectResponse = (project) => {
  // Se è già un oggetto JavaScript (non un documento Mongoose)
  if (!project.toObject && !project.toJSON) {
    return project;
  }
  
  // Converti in oggetto JavaScript se è un documento Mongoose
  const projectObj = project.toObject ? project.toObject() : project.toJSON();
  
  // Assicurati che projectType sia sempre definito
  if (!projectObj.projectType) {
    console.log(`ATTENZIONE: Progetto ${projectObj._id} (${projectObj.title}) senza projectType. Impostato a 'Singola'.`);
    projectObj.projectType = 'Singola';
  }
  
  return projectObj;
};
