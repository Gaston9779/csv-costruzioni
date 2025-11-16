const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const busboy = require('busboy');
const path = require('path');
const fs = require('fs');
const Project = require('../models/Project');
const Client = require('../models/Client');
const { formatCloudinaryImages, deleteCloudinaryImage, deleteMultipleCloudinaryImages } = require('../utils/cloudinaryHelper');

// Configurazione multer per upload immagini progetti e appartamenti
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Scegli la cartella di destinazione in base al tipo di file
    let uploadPath;
    if (file.fieldname === 'apartmentImages') {
      uploadPath = path.join(__dirname, '../uploads/apartments');
    } else {
      // Default per immagini progetti e altri tipi
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
    // Supporta tutti i formati immagine comuni, inclusi quelli mobile
    const allowedMimeTypes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/gif',
      'image/webp',
      'image/heic',  // iPhone/iOS
      'image/heif',  // iPhone/iOS
      'image/bmp',
      'image/tiff',
      'image/svg+xml'
    ];
    
    const allowedExtensions = /\.(jpg|jpeg|png|gif|webp|heic|heif|bmp|tiff|svg)$/i;
    const extname = allowedExtensions.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedMimeTypes.includes(file.mimetype.toLowerCase());

    if (mimetype || extname) {
      return cb(null, true);
    } else {
      cb(new Error('Solo immagini sono permesse (jpeg, jpg, png, gif, webp, heic, heif)'));
    }
  }
});

// MIDDLEWARE MULTER UPLOADPROJECTIMAGES RIMOSSO - ora tutto gestito manualmente con busboy
// Non più necessario perché tutte le route usano parsing manuale

// Gestione multipart manuale per evitare errori multer
const handleMultipartProjectCreation = async (req, res) => {
  try {
    const bb = busboy({ headers: req.headers });
    const fields = {};
    const files = [];
    
    bb.on('field', (fieldname, val) => {
      fields[fieldname] = val;
    });
    
    bb.on('file', (fieldname, file, info) => {
      const { filename, encoding, mimeType } = info;
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const extension = path.extname(filename);
      
      let uploadDir, newFilename;
      if (fieldname === 'apartmentImages') {
        uploadDir = path.join(__dirname, '../uploads/apartments');
        newFilename = 'apartment-' + uniqueSuffix + extension;
      } else {
        uploadDir = path.join(__dirname, '../uploads/projects');
        newFilename = 'project-' + uniqueSuffix + extension;
      }
      
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      const filePath = path.join(uploadDir, newFilename);
      const writeStream = fs.createWriteStream(filePath);
      
      file.pipe(writeStream);
      
      files.push({
        fieldname,
        originalname: filename,
        filename: newFilename,
        path: filePath,
        mimetype: mimeType,
        size: 0 // Sarà aggiornato quando il file è completamente scritto
      });
    });
    
    bb.on('finish', async () => {
      // Simula req.body e req.files per compatibilità
      req.body = fields;
      req.files = files;
      
      // Chiama la logica originale di createProject
      return createProjectLogic(req, res);
    });
    
    req.pipe(bb);
  } catch (error) {
    console.error('Errore nel parsing multipart:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nel parsing della richiesta',
      error: error.message
    });
  }
};

// Gestione multipart manuale per aggiornamento progetto
const handleMultipartProjectUpdate = async (req, res) => {
  try {
    const bb = busboy({ headers: req.headers });
    const fields = {};
    const files = [];
    
    bb.on('field', (fieldname, val) => {
      fields[fieldname] = val;
    });
    
    bb.on('file', (fieldname, file, info) => {
      const { filename, encoding, mimeType } = info;
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const extension = path.extname(filename);
      
      let uploadDir, newFilename;
      if (fieldname === 'apartmentImages') {
        uploadDir = path.join(__dirname, '../uploads/apartments');
        newFilename = 'apartment-' + uniqueSuffix + extension;
      } else {
        uploadDir = path.join(__dirname, '../uploads/projects');
        newFilename = 'project-' + uniqueSuffix + extension;
      }
      
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      const filePath = path.join(uploadDir, newFilename);
      const writeStream = fs.createWriteStream(filePath);
      
      file.pipe(writeStream);
      
      files.push({
        fieldname,
        originalname: filename,
        filename: newFilename,
        path: filePath,
        mimetype: mimeType,
        size: 0
      });
    });
    
    bb.on('finish', async () => {
      // Simula req.body e req.files per compatibilità
      req.body = fields;
      req.files = files;
      
      // Chiama la logica di update esistente senza multipart
      req.headers['content-type'] = 'application/json'; // Evita loop infinito
      return module.exports.updateProject(req, res);
    });
    
    req.pipe(bb);
  } catch (error) {
    console.error('Errore nel parsing multipart per update:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nel parsing della richiesta di aggiornamento',
      error: error.message
    });
  }
};

// Logica principale di creazione progetto (estratta per riutilizzo)
const createProjectLogic = async (req, res) => {
  try {
    console.log('Inizio createProjectLogic');
    console.log('Files ricevuti:', req.files ? req.files.length : 'nessun file');
    console.log('Body:', Object.keys(req.body));
    
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

    // Gestione immagini del progetto principale con Cloudinary
    const images = [];
    if (req.files && req.files.length > 0) {
      const projectImages = req.files.filter(file => file.fieldname === 'images');
      const formattedImages = formatCloudinaryImages(projectImages);
      images.push(...formattedImages);
    }

    // Crea il progetto base
    const projectData = {
      title,
      description,
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
    const apartmentData = req.body.apartmentData;
    const finalApartments = apartments || apartmentData;
    
    if (finalApartments) {
      try {
        let parsedApartments;
        
        if (typeof finalApartments === 'string') {
          parsedApartments = JSON.parse(finalApartments);
        } else {
          parsedApartments = finalApartments;
        }
        
        if (!Array.isArray(parsedApartments)) {
          parsedApartments = [];
        }
        
        projectData.apartments = [];
        
        // Gestione immagini degli appartamenti
        const apartmentImages = req.files ? req.files.filter(file => file.fieldname === 'apartmentImages') : [];
        
        // Mappa per metadati
        const metadataMap = {};
        for (let i = 0; i < apartmentImages.length; i++) {
          const metadataKey = `apartmentImageMetadata_${i}`;
          if (req.body[metadataKey]) {
            try {
              metadataMap[i] = JSON.parse(req.body[metadataKey]);
            } catch (e) {
              console.error(`Errore parsing metadati immagine ${i}:`, e);
            }
          }
        }
        
        // Processa appartamenti
        for (let i = 0; i < parsedApartments.length; i++) {
          const apt = parsedApartments[i];
          
          const apartment = {
            title: apt.title || `Appartamento ${i+1}`,
            description: apt.description || '',
            squareMeters: apt.squareMeters || 0,
            floor: apt.floor || 0,
            bedrooms: apt.bedrooms || 0,
            bathrooms: apt.bathrooms || 0,
            budget: apt.budget || 0,
            status: apt.status || 'In corso',
            images: []
          };
          
          // Aggiungi immagini associate a questo appartamento (Cloudinary)
          apartmentImages.forEach((file, fileIndex) => {
            const metadata = metadataMap[fileIndex];
            if (metadata && metadata.apartmentIndex === i) {
              apartment.images.push({
                filename: file.filename,
                url: file.path,
                originalName: file.originalname,
                path: file.path,
                size: file.size,
                mimetype: file.mimetype,
                cloudinaryId: file.filename,
                description: metadata.description || ''
              });
            }
          });
          
          projectData.apartments.push(apartment);
        }
        
        projectData.totalUnits = projectData.apartments.length;
      } catch (error) {
        console.error('Errore nel processing degli appartamenti:', error);
      }
    }

    console.log('Creazione progetto con dati:', {
      ...projectData,
      images: projectData.images?.length || 0,
      apartments: projectData.apartments?.length || 0
    });

    const project = new Project(projectData);
    await project.save();

    const populatedProject = await Project.findById(project._id)
      .populate('client', 'name email')
      .populate('createdBy', 'name email');

    const standardizedProject = standardizeProjectResponse(populatedProject.toObject());

    res.status(201).json({
      success: true,
      message: 'Progetto creato con successo',
      project: standardizedProject
    });
  } catch (error) {
    console.error('Errore nella creazione del progetto:', error);
    res.status(500).json({
      success: false,
      message: 'Errore interno del server',
      error: error.message
    });
  }
};

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
    
    const rawProjects = await Project.find(filter)
      .populate('client', 'name')
      .sort({ featured: -1, createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);
      
    // Converti e standardizza i progetti
    const projects = rawProjects.map(doc => {
      const plainProject = JSON.parse(JSON.stringify(doc));
      return standardizeProjectResponse(plainProject);
    });
    
    console.log(`API getPublicProjects: ${projects.length} progetti normalizzati con URL immagini completi`);

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
    const rawProject = await Project.findOne({ 
      _id: req.params.id, 
      visible: true 
    }).populate('client', 'name');

    if (!rawProject) {
      return res.status(404).json({
        success: false,
        message: 'Progetto non trovato'
      });
    }
    
    // Converti in oggetto JavaScript e normalizza con standardizeProjectResponse
    const plainProject = JSON.parse(JSON.stringify(rawProject));
    const project = standardizeProjectResponse(plainProject);
    
    // Log di debug
    console.log(`API getPublicProject: Progetto ${project._id} (${project.title}) normalizzato`);
    if (project.apartments && project.apartments.length > 0) {
      console.log(`Il progetto ha ${project.apartments.length} appartamenti`);
      project.apartments.forEach((apt, i) => {
        if (apt.images && apt.images.length > 0) {
          console.log(`Appartamento ${i} ha ${apt.images.length} immagini con URLs:`, 
            apt.images.map(img => img.url || 'MANCA URL!'));
        }
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
    
    // Esegui la query NON usando .lean() o .select()
    const rawProjects = await Project.find(filter)
      .populate('client', 'name email')
      .populate('createdBy', 'name email')
      .sort(sortOption)
      .limit(parseInt(limit))
      .skip(skip);
      
    // Converti i progetti e applica standardizeProjectResponse per assicurare URL corretti
    const projects = rawProjects.map(doc => {
      // Converti in oggetto JavaScript semplice
      const plainProject = JSON.parse(JSON.stringify(doc));
      
      // Applica standardizeProjectResponse per garantire che tutte le immagini degli appartamenti
      // abbiano URL completi e non solo ID
      return standardizeProjectResponse(plainProject);
    });
    
    console.log(`RISPOSTA FINALE: ${projects.length} progetti recuperati`);
    projects.forEach(p => {
      console.log(`ID: ${p._id}, Titolo: ${p.title}, ProjectType: ${p.projectType}, Apartments: ${p.apartments ? p.apartments.length : 0}`);
      
      // Debug per verificare che gli URL delle immagini siano corretti
      if (p.apartments && p.apartments.length > 0) {
        p.apartments.forEach((apt, i) => {
          if (apt.images && apt.images.length > 0) {
            console.log(`Appartamento ${i} immagini:`, apt.images.map(img => 
              img.url ? `URL OK: ${img.url}` : `NO URL: solo ID ${img._id}`
            ));
          }
        });
      }
    });
    
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

// Ottieni il dettaglio di un progetto singolo
module.exports.getProject = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Recupera il progetto con tutte le sue relazioni
    const project = await Project.findById(id)
      .populate('client', 'name email')
      .populate('createdBy', 'name email');
      
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Progetto non trovato'
      });
    }
    
    // Converti in oggetto JavaScript e normalizza
    const projectObj = JSON.parse(JSON.stringify(project));
    
    // Applica standardizeProjectResponse per garantire che tutte le immagini abbiano URL completi
    const standardizedProject = standardizeProjectResponse(projectObj);
    
    // Log di debug
    console.log(`API getProject: Progetto ${standardizedProject._id} (${standardizedProject.title}) normalizzato.`);
    if (standardizedProject.apartments && standardizedProject.apartments.length > 0) {
      standardizedProject.apartments.forEach((apt, i) => {
        if (apt.images && apt.images.length > 0) {
          console.log(`Appartamento ${i} ha ${apt.images.length} immagini con URLs:`, 
            apt.images.map(img => img.url || 'MANCA URL!'));
        }
      });
    }
    
    res.json({
      success: true,
      project: standardizedProject
    });
  } catch (error) {
    console.error('Errore nel recupero del progetto:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nel recupero del progetto',
      error: error.message
    });
  }
};

// Middleware per gestire gli errori
module.exports.errorHandler = (err, req, res, next) => {
  console.error('Errore nel controller progetto:', err);
  res.status(500).json({
    success: false,
    message: 'Errore interno del server',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
};

// Crea nuovo progetto (solo admin)
module.exports.createProject = async (req, res, next) => {
  try {
    console.log('Inizio createProject');
    
    // Il middleware Cloudinary ha già processato i file in req.files
    // NON usare busboy che bypassa Cloudinary
    
    console.log('Files ricevuti:', req.files ? req.files.length : 'nessun file');
    console.log('Body keys:', Object.keys(req.body));
    console.log('Body values:', req.body);
    console.log('Title from body:', req.body.title, 'Type:', typeof req.body.title);

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

    // Gestione immagini del progetto principale (Cloudinary)
    const projectImages = req.files ? req.files.filter(file => file.fieldname === 'images') : [];
    const images = formatCloudinaryImages(projectImages);
    
    console.log('Immagini progetto formattate:', images.length);

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
        
        // Gestione immagini degli appartamenti (Cloudinary)
        const apartmentImages = req.files ? req.files.filter(file => file.fieldname === 'apartmentImages') : [];
        console.log('Immagini appartamenti trovate:', apartmentImages.length);
        console.log(`Trovate ${apartmentImages.length} immagini di appartamenti da Cloudinary`);
        
        // Mappa per tenere traccia dei metadati delle immagini
        const metadataMap = {};
        
        // Estrai metadati delle immagini degli appartamenti
        for (let i = 0; i < apartmentImages.length; i++) {
          const metadataKey = `apartmentImageMetadata_${i}`;
          if (req.body[metadataKey]) {
            try {
              const metadata = JSON.parse(req.body[metadataKey]);
              metadataMap[i] = metadata;
              console.log(`Metadati immagine ${i}:`, metadata);
            } catch (e) {
              console.error(`Errore parsing metadati immagine ${i}:`, e);
            }
          }
        }
        
        // Processiamo gli appartamenti dal JSON
        for (let i = 0; i < parsedApartments.length; i++) {
          const apt = parsedApartments[i];
          
          // Creiamo la struttura base dell'appartamento
          const apartment = {
            title: apt.title || `Appartamento ${i+1}`,
            description: apt.description || '',
            squareMeters: apt.squareMeters || 0,
            floor: apt.floor || 0,
            bedrooms: apt.bedrooms || 0,
            bathrooms: apt.bathrooms || 0,
            budget: apt.budget || 0,
            status: apt.status || 'In corso',
            images: [] // Inizializziamo l'array delle immagini
          };
          
          // Aggiungi le immagini Cloudinary associate a questo appartamento
          apartmentImages.forEach((file, fileIndex) => {
            const metadata = metadataMap[fileIndex];
            if (metadata && metadata.apartmentIndex === i) {
              console.log(`Associando immagine Cloudinary ${file.filename} all'appartamento ${i}`);
              
              const imageUrl = file.secure_url || file.url || file.path;
              apartment.images.push({
                filename: file.filename,
                url: imageUrl,
                path: imageUrl,
                originalName: file.originalname,
                size: file.size,
                mimetype: file.mimetype,
                cloudinaryId: file.filename,
                description: metadata.description || ''
              });
            }
          });
          
          // NON processare immagini base64 - solo Cloudinary
          if (false && apt.images && Array.isArray(apt.images)) {
            for (let j = 0; j < apt.images.length; j++) {
              const imgData = apt.images[j];
              // Se abbiamo un'immagine base64
              if (imgData.data && imgData.data.startsWith('data:')) {
                // Estraiamo il mime type e il contenuto base64
                const matches = imgData.data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
                
                if (matches && matches.length === 3) {
                  const mimeType = matches[1];
                  const base64Data = matches[2];
                  const extension = mimeType.split('/')[1];
                  
                  // Generiamo un filename unico
                  const filename = `apartment_${i}_${Date.now()}_${Math.floor(Math.random() * 1000)}.${extension}`;
                  
                  // Assicurati che la directory esista
                  const uploadDir = path.join(__dirname, '../uploads/apartments');
                  if (!fs.existsSync(uploadDir)) {
                    fs.mkdirSync(uploadDir, { recursive: true });
                  }
                  
                  const filepath = path.join(uploadDir, filename);
                  
                  // Salviamo il file sul disco
                  try {
                    const buffer = Buffer.from(base64Data, 'base64');
                    fs.writeFileSync(filepath, buffer);
                    
                    // Aggiungiamo l'immagine all'appartamento con TUTTI i campi necessari
                    apartment.images.push({
                      filename: filename,
                      path: filepath,
                      size: buffer.length,
                      mimetype: mimeType,
                      url: `/uploads/apartments/${filename}`,
                      description: imgData.description || ''
                    });
                    
                    console.log(`Immagine salvata per l'appartamento ${i}: ${filename}`);
                  } catch (err) {
                    console.error(`Errore nel salvare l'immagine dell'appartamento ${i}:`, err);
                  }
                }
              } else if (imgData._id) {
                // Se abbiamo un'immagine esistente con solo ID, cerchiamo di recuperare i dati completi
                if (existingApt && existingApt.images) {
                  const existingImg = existingApt.images.find(img => 
                    img._id && img._id.toString() === imgData._id.toString());
                  
                  if (existingImg) {
                    // Aggiungiamo l'immagine con tutti i dati
                    apartment.images.push({
                      _id: existingImg._id,
                      filename: existingImg.filename,
                      path: existingImg.path,
                      size: existingImg.size,
                      mimetype: existingImg.mimetype,
                      url: existingImg.url || `/uploads/apartments/${existingImg.filename}`,
                      description: existingImg.description || imgData.description || ''
                    });
                  } else {
                    console.warn(`Immagine con ID ${imgData._id} non trovata nell'appartamento ${i}`);
                  }
                }
              } else if (imgData.filename) {
                // Se è un'immagine già esistente con filename
                apartment.images.push({
                  ...imgData,
                  url: imgData.url || `/uploads/apartments/${imgData.filename}`
                });
              }
            }
          }
          
          // Aggiungiamo l'appartamento al progetto
          projectData.apartments.push(apartment);
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
    console.log('Inizio updateProject');
    
    // Il middleware Cloudinary ha già processato i file in req.files
    // NON usare busboy che bypassa Cloudinary
    
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
            if (!img || !img._id) return true; // Mantieni se img non è valido
            const shouldDelete = imagesToDeleteArray.includes(img._id.toString());
            if (shouldDelete && img.path && fs.existsSync(img.path)) {
              try {
                fs.unlinkSync(img.path); // Elimina il file
              } catch (e) {
                console.error('Errore eliminazione file:', e);
              }
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
        const newImages = formatCloudinaryImages(projectImages);

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
      
      // Gestione immagini degli appartamenti ricevute come file binari
      const apartmentImages = req.files ? req.files.filter(file => file.fieldname === 'apartmentImages') : [];
      console.log(`UPDATE PROJECT - Trovate ${apartmentImages.length} immagini di appartamenti`);
      
      // Mappa per tenere traccia dei metadati delle immagini
      const metadataMap = {};
      
      // Estrai metadati delle immagini degli appartamenti
      for (let i = 0; i < apartmentImages.length; i++) {
        const metadataKey = `apartmentImageMetadata_${i}`;
        if (req.body[metadataKey]) {
          try {
            const metadata = JSON.parse(req.body[metadataKey]);
            metadataMap[i] = metadata;
            console.log(`UPDATE PROJECT - Metadati immagine ${i}:`, metadata);
          } catch (e) {
            console.error(`Errore parsing metadati immagine ${i}:`, e);
          }
        }
      }
      
      // Popoliamo ogni appartamento con i dati
      for (let i = 0; i < parsedApartments.length; i++) {
        const apt = parsedApartments[i];
        
        // Gestisci eliminazione immagini appartamento da Cloudinary
        let existingImages = apt.images || [];
        if (apt.imagesToDelete && Array.isArray(apt.imagesToDelete) && apt.imagesToDelete.length > 0) {
          // Raccogli public IDs da eliminare
          const imagesToDeleteFromCloud = [];
          
          // Filtra le immagini da mantenere
          existingImages = existingImages.filter(img => {
            if (!img || !img._id) return true;
            const shouldDelete = apt.imagesToDelete.includes(img._id.toString()) || apt.imagesToDelete.includes(img._id);
            if (shouldDelete && (img.cloudinaryId || img.filename)) {
              imagesToDeleteFromCloud.push(img.cloudinaryId || img.filename);
            }
            return !shouldDelete;
          });
          
          // Elimina da Cloudinary
          if (imagesToDeleteFromCloud.length > 0) {
            await deleteMultipleCloudinaryImages(imagesToDeleteFromCloud);
            console.log(`Eliminate ${imagesToDeleteFromCloud.length} immagini appartamento da Cloudinary`);
          }
        }
        
        // Creiamo la struttura base dell'appartamento
        const apartment = {
          _id: apt._id, // Mantieni l'ID se esiste (per update)
          title: apt.title || `Appartamento ${i+1}`,
          description: apt.description || '',
          squareMeters: apt.squareMeters || 0,
          floor: apt.floor || 0,
          bedrooms: apt.bedrooms || 0,
          bathrooms: apt.bathrooms || 0,
          budget: apt.budget || 0,
          status: apt.status || 'In corso',
          images: existingImages // Usa le immagini filtrate
        };
        
        // Aggiungi le nuove immagini Cloudinary associate a questo appartamento
        apartmentImages.forEach((file, fileIndex) => {
          const metadata = metadataMap[fileIndex];
          if (metadata && metadata.apartmentIndex === i) {
            console.log(`UPDATE PROJECT - Associando immagine Cloudinary ${file.filename} all'appartamento ${i}`);
            apartment.images.push({
              _id: new mongoose.Types.ObjectId(),
              filename: file.filename,
              path: file.path,
              originalName: file.originalname,
              mimetype: file.mimetype,
              size: file.size,
              url: file.path,
              cloudinaryId: file.filename,
              description: metadata.description || ''
            });
          }
        });
        
        // Se l'appartamento ha immagini, le processiamo
        if (apt.images && Array.isArray(apt.images)) {
          for (let j = 0; j < apt.images.length; j++) {
            const imgData = apt.images[j];
            // Se abbiamo un'immagine base64
            if (imgData.data && imgData.data.startsWith('data:')) {
              // Estraiamo il mime type e il contenuto base64
              const matches = imgData.data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
              
              if (matches && matches.length === 3) {
                const mimeType = matches[1];
                const base64Data = matches[2];
                const extension = mimeType.split('/')[1];
                
                // Generiamo un filename unico
                const filename = `apartment_${i}_${Date.now()}_${Math.floor(Math.random() * 1000)}.${extension}`;
                
                // Assicurati che la directory esista
                const uploadDir = path.join(__dirname, '../uploads/apartments');
                if (!fs.existsSync(uploadDir)) {
                  fs.mkdirSync(uploadDir, { recursive: true });
                }
                
                const filepath = path.join(uploadDir, filename);
                
                // Salviamo il file sul disco
                try {
                  const buffer = Buffer.from(base64Data, 'base64');
                  fs.writeFileSync(filepath, buffer);
                  
                  // Aggiungiamo l'immagine all'appartamento con TUTTI i campi necessari
                  apartment.images.push({
                    filename: filename,
                    path: filepath,
                    size: buffer.length,
                    mimetype: mimeType,
                    url: `/uploads/apartments/${filename}`,
                    description: imgData.description || ''
                  });
                  
                  console.log(`Immagine salvata per l'appartamento ${i}: ${filename}`);
                } catch (err) {
                  console.error(`Errore nel salvare l'immagine dell'appartamento ${i}:`, err);
                }
              }
            } else if (typeof imgData === 'object' && imgData._id) {
                // Se abbiamo un'immagine esistente con solo ID, cerchiamo di recuperare i dati completi
                let existingImg = null;
                
                // Prima cerchiamo in tutti gli appartamenti esistenti
                if (existingProject && existingProject.apartments) {
                  for (let k = 0; k < existingProject.apartments.length; k++) {
                    const apt = existingProject.apartments[k];
                    if (apt && apt.images && Array.isArray(apt.images)) {
                      for (let m = 0; m < apt.images.length; m++) {
                        const img = apt.images[m];
                        if (img && img._id && img._id.toString() === imgData._id.toString()) {
                          existingImg = img;
                          break;
                        }
                      }
                      if (existingImg) break;
                    }
                  }
                }
                
                if (existingImg) {
                  // Aggiungiamo l'immagine con tutti i dati
                  apartment.images.push({
                    _id: existingImg._id,
                    filename: existingImg.filename,
                    path: existingImg.path,
                    size: existingImg.size,
                    mimetype: existingImg.mimetype,
                    url: existingImg.url || `/uploads/apartments/${existingImg.filename}`,
                    description: existingImg.description || imgData.description || ''
                  });
                } else {
                  console.warn(`Immagine con ID ${imgData._id} non trovata in nessun appartamento`);
                  
                  // Se non troviamo l'immagine in nessun appartamento, proviamo a cercarlo nelle immagini principali del progetto
                  if (existingProject && existingProject.images && Array.isArray(existingProject.images)) {
                    const projectImg = existingProject.images.find(img => 
                      img._id && img._id.toString() === imgData._id.toString());
                    
                    if (projectImg) {
                      apartment.images.push({
                        _id: projectImg._id,
                        filename: projectImg.filename,
                        path: projectImg.path,
                        size: projectImg.size,
                        mimetype: projectImg.mimetype,
                        url: projectImg.url || `/uploads/projects/${projectImg.filename}`,
                        description: projectImg.description || imgData.description || ''
                      });
                    }
                  }
                }
              } else if (imgData.filename) {
                // Se è un'immagine già esistente con filename
                apartment.images.push({
                  ...imgData,
                  url: imgData.url || `/uploads/apartments/${imgData.filename}`
                });
              }
            }
          }
        
          // Aggiungiamo l'appartamento al progetto
          updateData.apartments.push(apartment);
        };
      
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
      .lean(); // Manteniamo lean per ottenere un oggetto JavaScript semplice

    // Assicuriamoci che le immagini degli appartamenti abbiano URL completi
    if (project && project.apartments && Array.isArray(project.apartments)) {
      for (let i = 0; i < project.apartments.length; i++) {
        const apt = project.apartments[i];
        if (apt.images && apt.images.length > 0) {
          for (let j = 0; j < apt.images.length; j++) {
            const img = apt.images[j];
            // Se l'immagine ha solo ID e filename ma non URL, aggiungi URL
            if (img && img.filename && !img.url) {
              img.url = `/uploads/apartments/${img.filename}`;
            }
            // Se l'immagine ha solo ID ma non ha né URL né filename, logghiamo un avviso
            else if (img && img._id && !img.url && !img.filename) {
              console.warn(`Immagine con solo ID trovata: ${img._id}, impossibile generare URL valido`);
              // Impostiamo almeno un URL temporaneo per evitare errori nel frontend
              img.url = `/uploads/placeholder.jpg`;
            }
          }
        }
      }
    }

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
    
    // Elimina da Cloudinary
    if (image.cloudinaryId || image.filename) {
      await deleteCloudinaryImage(image.cloudinaryId || image.filename);
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
    console.log(`🔄 ADD APARTMENT - Endpoint chiamato con projectId: ${projectId}`);
    console.log(`🔄 ADD APARTMENT - Body ricevuto:`, req.body);
    console.log(`🔄 ADD APARTMENT - Files ricevuti:`, req.files ? req.files.length : 0);
    
    // Trova il progetto
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
    
    // ----- GESTIONE NUOVO FORMATO DATI -----
    // Estrai i dati dell'appartamento dal campo apartmentData
    let apartmentData;
    
    if (req.body.apartmentData) {
      try {
        // Nuovo formato: dati JSON in un campo apartmentData
        apartmentData = JSON.parse(req.body.apartmentData);
        console.log('🔄 ADD APARTMENT - Dati JSON ricevuti dal campo apartmentData:', apartmentData);
      } catch (error) {
        console.error('Errore parsing JSON apartmentData:', error);
        return res.status(400).json({
          success: false,
          message: 'Formato dati non valido: apartmentData deve essere un JSON valido'
        });
      }
    } else {
      // Fallback al vecchio formato: dati direttamente nel body
      console.log('⚠️ Usando il vecchio formato dati (direttamente da req.body)');
      apartmentData = [req.body]; // Considera req.body come un appartamento singolo
    }
    
    // Verifica se abbiamo un array (nuovo formato) o un oggetto singolo (vecchio formato)
    if (!Array.isArray(apartmentData)) {
      apartmentData = [apartmentData]; // Converti in array per uniformità
    }
    
    // Ottieni il primo (e unico) appartamento da creare
    const newApartment = { ...apartmentData[0] };
    console.log(`🔄 ADD APARTMENT - Dati dell'appartamento da creare:`, newApartment);
    
    // Inizializza l'array delle immagini se non esiste
    if (!newApartment.images) {
      newApartment.images = [];
    }
    
    // Processa le immagini binarie caricate
    if (req.files && req.files.length > 0) {
      console.log(`🔄 ADD APARTMENT - Processando ${req.files.length} immagini binarie di appartamenti`);
      
      // Mappa per tenere traccia dei metadati delle immagini
      const metadataMap = {};
      
      // Estrai metadati delle immagini
      for (let i = 0; i < req.files.length; i++) {
        const metadataKey = `apartmentImageMetadata_${i}`;
        if (req.body[metadataKey]) {
          try {
            const metadata = JSON.parse(req.body[metadataKey]);
            metadataMap[i] = metadata;
          } catch (e) {
            console.error(`Errore parsing metadati immagine ${i}:`, e);
          }
        }
      }
      
      // Aggiungi ogni file caricato all'array delle immagini
      req.files.forEach((file, index) => {
        const filename = path.basename(file.path);
        const url = `/uploads/apartments/${filename}`;
        
        // Recupera i metadati associati, se esistono
        const metadata = metadataMap[index] || {};
        const description = metadata.description || '';
        
        console.log(`🔄 Aggiunta immagine binaria all'appartamento: ${filename}, descrizione: ${description}`);
        
        // Crea l'oggetto immagine completo
        newApartment.images.push({
          _id: new mongoose.Types.ObjectId(),
          filename: filename,
          path: file.path,
          originalName: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          url: url, // URL completo
          description: description
        });
      });
    }
    
    // Processa le immagini già presenti per assicurare che tutte abbiano gli attributi corretti
    if (newApartment.images && Array.isArray(newApartment.images)) {
      console.log(`🔄 Processando ${newApartment.images.length} immagini dell'appartamento...`);
      
      newApartment.images = newApartment.images.map(image => {
        // CASO 1: Se è solo un ID o un oggetto con solo ID
        if (typeof image === 'string') {
          return {
            _id: image,
            filename: `apartment_image_${image}.jpg`,
            mimetype: 'image/jpeg',
            url: `/uploads/apartments/apartment_image_${image}.jpg`,
            description: ''
          };
        }
        
        // CASO 3: Se l'immagine non ha URL ma ha filename
        if (image && image.filename && !image.url) {
          return {
            ...image,
            url: `/uploads/apartments/${image.filename}`
          };
        }
        
        // CASO 4: Se l'immagine non ha URL ma ha _id
        if (image && image._id && !image.url) {
          const imageId = typeof image._id === 'string' ? image._id : image._id.toString();
          return {
            ...image,
            filename: image.filename || `apartment_image_${imageId}.jpg`,
            url: `/uploads/apartments/${image.filename || `apartment_image_${imageId}.jpg`}`,
            mimetype: image.mimetype || 'image/jpeg',
            description: image.description || ''
          };
        }
        
        // CASO 5: Per qualsiasi altro oggetto immagine, assicuriamo che abbia un URL
        if (image && typeof image === 'object' && !image.url) {
          const idStr = image._id ? (typeof image._id === 'string' ? image._id : image._id.toString()) : 'unknown';
          console.log(`⚠️ IMMAGINE SENZA URL: ${idStr} - Generando URL`);
          
          return {
            ...image,
            filename: image.filename || `apartment_image_${idStr}.jpg`,
            url: `/uploads/apartments/${image.filename || `apartment_image_${idStr}.jpg`}`,
            mimetype: image.mimetype || 'image/jpeg',
            description: image.description || ''
          };
        }
        
        return image;
      }).filter(Boolean); // Rimuovi eventuali null che potrebbero essere stati creati
    }
    
    // Aggiungi l'appartamento al progetto
    project.apartments.push(newApartment);
    project.totalUnits = project.apartments.length;
    
    await project.save();
    
    // Usa standardizeProjectResponse per garantire che tutte le immagini abbiano URL completi
    const standardizedProject = standardizeProjectResponse(project.toObject());
    
    res.status(201).json({
      success: true,
      message: 'Appartamento aggiunto con successo',
      apartment: standardizedProject.apartments[standardizedProject.apartments.length - 1],
      project: standardizedProject,
      projectType: project.projectType // Aggiungiamo esplicitamente projectType
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
    
    console.log(`🔄 UPDATE APARTMENT - Endpoint chiamato con projectId: ${projectId}, apartmentId: ${apartmentId}`);
    console.log(`🔄 UPDATE APARTMENT - Files ricevuti:`, req.files ? req.files.length : 0);
    
    // Estrai i dati dell'appartamento dal form
    const updateData = req.body.apartmentData ? JSON.parse(req.body.apartmentData) : {};
    
    console.log(`🔄 UPDATE APARTMENT - Dati JSON ricevuti:`, updateData);
    
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
    
    // Se ci sono file caricati (immagini), aggiungile all'appartamento
    if (req.files && req.files.length > 0) {
      console.log(`🔄 UPDATE APARTMENT - Processando ${req.files.length} immagini binarie di appartamenti...`);
      
      // Inizializza l'array delle immagini se non esiste
      if (!updateData.images) {
        updateData.images = [...(project.apartments[apartmentIndex].images || [])];
      }
      
      // Mappa per tenere traccia dei metadati delle immagini
      const metadataMap = {};
      
      // Estrai metadati delle immagini
      for (let i = 0; i < req.files.length; i++) {
        const metadataKey = `apartmentImageMetadata_${i}`;
        if (req.body[metadataKey]) {
          try {
            const metadata = JSON.parse(req.body[metadataKey]);
            metadataMap[i] = metadata;
          } catch (e) {
            console.error(`Errore parsing metadati immagine ${i}:`, e);
          }
        }
      }
      
      // Aggiungi ogni file caricato all'array delle immagini
      req.files.forEach((file, index) => {
        const filename = path.basename(file.path);
        const url = `/uploads/apartments/${filename}`;
        
        // Recupera i metadati associati, se esistono
        const metadata = metadataMap[index] || {};
        const description = metadata.description || '';
        
        console.log(`🔄 UPDATE APARTMENT - Aggiunta immagine binaria: ${filename}, descrizione: ${description}`);
        
        // Aggiungi l'immagine con tutti i metadati necessari
        updateData.images.push({
          _id: new mongoose.Types.ObjectId(),
          filename: filename,
          path: file.path,
          originalName: file.originalname,
          description: description,
          mimetype: file.mimetype,
          size: file.size,
          url: url // URL completo
        });
      });
    }
    
    // Processa eventuali immagini già presenti nell'oggetto
    if (updateData.images && Array.isArray(updateData.images)) {
      updateData.images = updateData.images.map(image => {
        // CASO 1: Se è solo un ID o un oggetto con solo ID
        if (typeof image === 'string') {
          return {
            _id: image,
            filename: `apartment_image_${image}.jpg`,
            mimetype: 'image/jpeg',
            url: `/uploads/apartments/apartment_image_${image}.jpg`,
            description: ''
          };
        }
        
        // CASO 2: Se è un oggetto con solo ID
        if (image && image._id && Object.keys(image).length === 1) {
          const imageId = typeof image._id === 'string' ? image._id : image._id.toString();
          return {
            _id: image._id,
            filename: `apartment_image_${imageId}.jpg`,
            mimetype: 'image/jpeg',
            url: `/uploads/apartments/apartment_image_${imageId}.jpg`,
            description: ''
          };
        }
        
        // CASO 3: Se l'immagine non ha URL ma ha filename
        if (image && image.filename && !image.url) {
          return {
            ...image,
            url: `/uploads/apartments/${image.filename}`
          };
        }
        
        // CASO 4: Se l'immagine non ha URL ma ha _id
        if (image && image._id && !image.url) {
          const imageId = typeof image._id === 'string' ? image._id : image._id.toString();
          return {
            ...image,
            filename: image.filename || `apartment_image_${imageId}.jpg`,
            url: `/uploads/apartments/${image.filename || `apartment_image_${imageId}.jpg`}`,
            mimetype: image.mimetype || 'image/jpeg',
            description: image.description || ''
          };
        }
        
        // CASO 5: Per qualsiasi altro oggetto immagine, assicuriamo che abbia un URL
        if (image && typeof image === 'object' && !image.url) {
          const idStr = image._id ? (typeof image._id === 'string' ? image._id : image._id.toString()) : 'unknown';
          console.log(`⚠️ UPDATE APARTMENT - IMMAGINE SENZA URL: ${idStr} - Generando URL`);
          
          return {
            ...image,
            filename: image.filename || `apartment_image_${idStr}.jpg`,
            url: `/uploads/apartments/${image.filename || `apartment_image_${idStr}.jpg`}`,
            mimetype: image.mimetype || 'image/jpeg',
            description: image.description || ''
          };
        }
        
        return image;
      }).filter(Boolean); // Rimuovi eventuali null che potrebbero essere stati creati
    }
    
    // Aggiorna i campi dell'appartamento
    Object.keys(updateData).forEach(key => {
      project.apartments[apartmentIndex][key] = updateData[key];
    });
    
    await project.save();
    
    // Standardizza la risposta
    const standardizedProject = standardizeProjectResponse(project.toObject());
    
    res.json({
      success: true,
      message: 'Appartamento aggiornato con successo',
      apartment: standardizedProject.apartments[apartmentIndex],
      project: standardizedProject,
      projectType: project.projectType
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

// MIDDLEWARE MULTER RIMOSSO - ora gestito manualmente con busboy
// uploadApartmentImages non più necessario

// MIDDLEWARE MULTER LEGACY RIMOSSO - ora tutto gestito manualmente con busboy

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
      // Elimina da Cloudinary se il progetto non esiste
      const publicIds = files.map(f => f.filename);
      await deleteMultipleCloudinaryImages(publicIds);
      return res.status(404).json({
        success: false,
        message: 'Progetto non trovato'
      });
    }
    
    // Trova l'appartamento
    const apartmentIndex = project.apartments.findIndex(apt => apt._id.toString() === apartmentId);
    if (apartmentIndex === -1) {
      // Elimina da Cloudinary se l'appartamento non esiste
      const publicIds = files.map(f => f.filename);
      await deleteMultipleCloudinaryImages(publicIds);
      return res.status(404).json({
        success: false,
        message: 'Appartamento non trovato'
      });
    }
    
    // Crea array di immagini se non esiste
    if (!project.apartments[apartmentIndex].images) {
      project.apartments[apartmentIndex].images = [];
    }
    
    // Formatta le immagini da Cloudinary
    const formattedImages = formatCloudinaryImages(files);
    
    // Aggiungi le immagini all'appartamento
    formattedImages.forEach((image, index) => {
      // Cerca le descrizioni per questa immagine dell'appartamento
      let description = '';
      const imageDescField = `apartment_${apartmentIndex}_image_description`;
      
      if (req.body[imageDescField]) {
        try {
          const descData = JSON.parse(req.body[imageDescField]);
          if (descData.filename === image.originalName && descData.description) {
            description = descData.description;
          }
        } catch (e) {
          console.error(`Errore nel parsing della descrizione dell'immagine dell'appartamento ${apartmentIndex}:`, e);
        }
      }
      
      // Log per debug
      console.log(`✅ Aggiunta immagine Cloudinary all'appartamento ${apartmentId}: ${image.url}`);
      
      // Aggiungi immagine con descrizione
      project.apartments[apartmentIndex].images.push({
        ...image,
        description: description
      });
    });
    
    await project.save();
    
    // Usa standardizeProjectResponse per garantire che tutte le immagini abbiano URL completi
    const standardizedProject = standardizeProjectResponse(project.toObject());
    
    res.status(201).json({
      success: true,
      message: 'Immagini aggiunte con successo',
      apartment: standardizedProject.apartments[apartmentIndex],
      project: standardizedProject
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
    
    // Elimina da Cloudinary
    if (image.cloudinaryId || image.filename) {
      await deleteCloudinaryImage(image.cloudinaryId || image.filename);
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
  if (!project) return null;
  
  // Crea una copia del progetto
  const standardizedProject = JSON.parse(JSON.stringify(project));
  
  // Processa tutte le immagini degli appartamenti
  if (standardizedProject.apartments && Array.isArray(standardizedProject.apartments)) {
    standardizedProject.apartments.forEach(apartment => {
      if (apartment.images && Array.isArray(apartment.images)) {
        apartment.images = apartment.images.map(image => {
          // CASO 1: Se è solo un ID o un oggetto con solo ID
          if (typeof image === 'string') {
            console.log(`⚠️ TROVATO ID STRINGA: ${image} - Convertendo in oggetto completo`);
            return {
              _id: image,
              filename: `apartment_image_${image}.jpg`,
              mimetype: 'image/jpeg',
              url: `/uploads/apartments/apartment_image_${image}.jpg`,
              description: ''
            };
          }
          
          // CASO 2: Se è un oggetto con solo ID
          if (image && image._id && Object.keys(image).length === 1) {
            console.log(`⚠️ TROVATO OGGETTO CON SOLO ID: ${image._id} - Convertendo in oggetto completo`);
            return {
              _id: image._id,
              filename: `apartment_image_${image._id}.jpg`,
              mimetype: 'image/jpeg',
              url: `/uploads/apartments/apartment_image_${image._id}.jpg`,
              description: ''
            };
          }
          
          // CASO 3: Se l'immagine contiene dati base64, salvarla su disco
          if (image && image.data && typeof image.data === 'string' && image.data.startsWith('data:')) {
            try {
              console.log(`Trovata immagine base64 nel DB per appartamento - salvando su disco`);
              // Estraiamo il mime type e il contenuto base64
              const matches = image.data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
              
              if (matches && matches.length === 3) {
                const mimeType = matches[1];
                const base64Data = matches[2];
                const extension = mimeType.split('/')[1];
                
                // Generiamo un filename unico
                const filename = `apartment_fix_${Date.now()}_${Math.floor(Math.random() * 1000)}.${extension}`;
                
                // Assicurati che la directory esista
                const uploadDir = path.join(__dirname, '../uploads/apartments');
                if (!fs.existsSync(uploadDir)) {
                  fs.mkdirSync(uploadDir, { recursive: true });
                }
                
                const filepath = path.join(uploadDir, filename);
                
                // Salviamo il file sul disco
                const buffer = Buffer.from(base64Data, 'base64');
                fs.writeFileSync(filepath, buffer);
                
                // Sostituiamo il dato base64 con il riferimento al file
                return {
                  _id: image._id || new mongoose.Types.ObjectId(),
                  filename: filename,
                  path: filepath,
                  size: buffer.length,
                  mimetype: mimeType,
                  url: `/uploads/apartments/${filename}`,
                  description: image.description || ''
                };
              }
            } catch (err) {
              console.error('Errore nel convertire immagine base64 a file:', err);
            }
          }

          // CASO 4: Se l'immagine ha solo _id senza url
          if (image && image._id && !image.url) {
            const imageId = typeof image._id === 'string' ? image._id : image._id.toString();
            console.log(`⚠️ TROVATA IMMAGINE SENZA URL: ${imageId} - Aggiungendo URL`);
            
            return {
              ...image,
              filename: image.filename || `apartment_image_${imageId}.jpg`,
              url: `/uploads/apartments/${image.filename || `apartment_image_${imageId}.jpg`}`,
              mimetype: image.mimetype || 'image/jpeg',
              description: image.description || ''
            };
          }
          
          // CASO 5: Se l'immagine ha un filename ma non un URL
          if (image && image.filename && !image.url) {
            return {
              ...image,
              url: `/uploads/apartments/${image.filename}`
            };
          }
          
          // CASO 6: Se l'immagine non ha né URL né filename ma ha _id
          if (image && image._id && !image.url && !image.filename) {
            const imageId = typeof image._id === 'string' ? image._id : image._id.toString();
            console.log(`⚠️ IMMAGINE SENZA URL NÉ FILENAME: ${imageId} - Generando entrambi`);
            
            return {
              ...image,
              filename: `apartment_image_${imageId}.jpg`,
              url: `/uploads/apartments/apartment_image_${imageId}.jpg`,
              mimetype: image.mimetype || 'image/jpeg',
              description: image.description || ''
            };
          }
          
          // CASO 7: Se per qualche motivo arriviamo qui senza un oggetto valido
          if (!image || typeof image !== 'object') {
            console.error(`⚠️ IMMAGINE INVALIDA:`, image);
            return null;
          }
          
          // CASO 8: Se arriviamo qui e l'immagine non ha URL per qualsiasi motivo
          if (!image.url) {
            const idStr = image._id ? (typeof image._id === 'string' ? image._id : image._id.toString()) : 'unknown';
            console.log(`⚠️ ULTIMO CONTROLLO - IMMAGINE SENZA URL: ${idStr} - Generando URL`);
            
            return {
              ...image,
              filename: image.filename || `apartment_image_${idStr}.jpg`,
              url: `/uploads/apartments/${image.filename || `apartment_image_${idStr}.jpg`}`,
              mimetype: image.mimetype || 'image/jpeg'
            };
          }
          
          return image;
        }).filter(Boolean); // Rimuovi eventuali null che potrebbero essere stati creati
      }
    });
  }
  
  // Processa anche le immagini del progetto principale
  if (standardizedProject.images && Array.isArray(standardizedProject.images)) {
    standardizedProject.images = standardizedProject.images.map(image => {
      // CASO 1: Se è solo un ID o un oggetto con solo ID
      if (typeof image === 'string') {
        console.log(`⚠️ TROVATO ID STRINGA PROGETTO: ${image} - Convertendo in oggetto completo`);
        return {
          _id: image,
          filename: `project_image_${image}.jpg`,
          mimetype: 'image/jpeg',
          url: `/uploads/projects/project_image_${image}.jpg`,
          description: ''
        };
      }
      
      // CASO 2: Se è un oggetto con solo ID
      if (image && image._id && Object.keys(image).length === 1) {
        console.log(`⚠️ TROVATO OGGETTO PROGETTO CON SOLO ID: ${image._id} - Convertendo in oggetto completo`);
        return {
          _id: image._id,
          filename: `project_image_${image._id}.jpg`,
          mimetype: 'image/jpeg',
          url: `/uploads/projects/project_image_${image._id}.jpg`,
          description: ''
        };
      }
      
      // CASO 3: Se l'immagine ha solo _id senza url
      if (image && image._id && !image.url) {
        const imageId = typeof image._id === 'string' ? image._id : image._id.toString();
        console.log(`⚠️ TROVATA IMMAGINE PROGETTO SENZA URL: ${imageId} - Aggiungendo URL`);
        
        return {
          ...image,
          filename: image.filename || `project_image_${imageId}.jpg`,
          url: `/uploads/projects/${image.filename || `project_image_${imageId}.jpg`}`,
          mimetype: image.mimetype || 'image/jpeg',
          description: image.description || ''
        };
      }
      
      // CASO 4: Se l'immagine ha un filename ma non un URL
      if (image && image.filename && !image.url) {
        return {
          ...image,
          url: `/uploads/projects/${image.filename}`
        };
      }
      
      // CASO 5: Se l'immagine è già completa, restituiscila così com'è
      if (image && image.url && image.filename) {
        return image;
      }
      
      // CASO 6: Se l'immagine non ha né URL né filename ma ha _id
      if (image && image._id && !image.url && !image.filename) {
        const imageId = typeof image._id === 'string' ? image._id : image._id.toString();
        console.log(`⚠️ IMMAGINE PROGETTO SENZA URL NÉ FILENAME: ${imageId} - Generando entrambi`);
        
        return {
          ...image,
          filename: `project_image_${imageId}.jpg`,
          url: `/uploads/projects/project_image_${imageId}.jpg`,
          mimetype: image.mimetype || 'image/jpeg',
          description: image.description || ''
        };
      }
      
      return image;
    }).filter(Boolean); // Rimuovi eventuali immagini null/undefined
  }
  
  return standardizedProject;
};
