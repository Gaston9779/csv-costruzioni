const Project = require('../models/Project');
const { 
  standardizeProjectResponse, 
  prepareProjectData,
  validateProjectData,
  buildProjectFilter,
  buildSortOptions,
  calculatePagination
} = require('../utils/projectHelpers');
const { 
  parseApartmentsData, 
  associateImagesToApartments,
  extractImageMetadata,
  standardizeApartments
} = require('../utils/apartmentHelpers');
const { createImageObject } = require('../utils/imageHelpers');

/**
 * Crea un nuovo progetto
 * @param {Object} data - Dati del progetto
 * @param {Object} user - Utente che crea il progetto
 * @param {Array} files - File caricati
 * @returns {Promise<Object>} Progetto creato
 */
const createProject = async (data, user, files = []) => {
  // Prepara i dati del progetto
  const projectData = prepareProjectData(data, user, false);
  
  // Valida i dati
  const validation = validateProjectData(projectData);
  if (!validation.valid) {
    throw new Error(validation.errors.join(', '));
  }
  
  // Gestione immagini del progetto principale
  const projectImages = files.filter(file => file.fieldname === 'images');
  projectData.images = projectImages.map(file => createImageObject(file, 'projects'));
  
  // Gestione appartamenti per progetti multiproprietà
  const apartmentsData = data.apartments || data.apartmentData;
  if (apartmentsData) {
    const apartments = parseApartmentsData(apartmentsData);
    
    // Gestione immagini degli appartamenti
    const apartmentImages = files.filter(file => file.fieldname === 'apartmentImages');
    const metadataMap = extractImageMetadata(data, apartmentImages.length);
    
    projectData.apartments = associateImagesToApartments(apartments, apartmentImages, metadataMap);
    projectData.totalUnits = projectData.apartments.length;
  }
  
  // Crea e salva il progetto
  const project = new Project(projectData);
  await project.save();
  
  // Recupera il progetto popolato
  const populatedProject = await Project.findById(project._id)
    .populate('client', 'name email')
    .populate('createdBy', 'name email')
    .lean();
  
  return standardizeProjectResponse(populatedProject);
};

/**
 * Aggiorna un progetto esistente
 * @param {String} projectId - ID del progetto
 * @param {Object} data - Dati da aggiornare
 * @param {Array} files - File caricati
 * @returns {Promise<Object>} Progetto aggiornato
 */
const updateProject = async (projectId, data, files = []) => {
  // Recupera il progetto esistente
  const existingProject = await Project.findById(projectId);
  if (!existingProject) {
    throw new Error('Progetto non trovato');
  }
  
  // Prepara i dati di aggiornamento
  const updateData = prepareProjectData(data, null, true);
  
  // Valida i dati
  const validation = validateProjectData(updateData);
  if (!validation.valid) {
    throw new Error(validation.errors.join(', '));
  }
  
  // Gestione immagini del progetto principale
  const projectImages = files.filter(file => file.fieldname === 'images');
  if (projectImages.length > 0) {
    const newImages = projectImages.map(file => createImageObject(file, 'projects'));
    
    if (data.replaceImages === 'true') {
      updateData.images = newImages;
    } else {
      updateData.images = [...(existingProject.images || []), ...newImages];
    }
  }
  
  // Gestione appartamenti per progetti multiproprietà
  if (data.projectType === 'Multiproprietà' && data.apartments) {
    const apartments = parseApartmentsData(data.apartments);
    
    // Gestione immagini degli appartamenti
    const apartmentImages = files.filter(file => file.fieldname === 'apartmentImages');
    const metadataMap = extractImageMetadata(data, apartmentImages.length);
    
    updateData.apartments = associateImagesToApartments(apartments, apartmentImages, metadataMap);
    updateData.totalUnits = updateData.apartments.length;
  }
  
  // Aggiorna il progetto
  const project = await Project.findByIdAndUpdate(
    projectId,
    updateData,
    { 
      new: true,
      runValidators: true,
      overwrite: false
    }
  )
  .populate('client', 'name email')
  .populate('createdBy', 'name email')
  .lean();
  
  return standardizeProjectResponse(project);
};

/**
 * Recupera tutti i progetti con filtri e paginazione
 * @param {Object} query - Query parameters
 * @param {Boolean} publicOnly - Se mostrare solo progetti pubblici
 * @returns {Promise<Object>} { projects, pagination }
 */
const getProjects = async (query, publicOnly = false) => {
  const { page = 1, limit = 10, sort } = query;
  
  // Costruisci filtro e opzioni di sort
  const filter = buildProjectFilter(query, publicOnly);
  const sortOptions = buildSortOptions(sort);
  
  const skip = (page - 1) * limit;
  
  // Esegui query in parallelo per ottimizzare le performance
  const [rawProjects, total] = await Promise.all([
    Project.find(filter)
      .populate('client', 'name email')
      .populate('createdBy', 'name email')
      .sort(sortOptions)
      .limit(parseInt(limit))
      .skip(skip)
      .lean(),
    Project.countDocuments(filter)
  ]);
  
  // Standardizza i progetti
  const projects = rawProjects.map(doc => standardizeProjectResponse(doc));
  
  // Calcola paginazione
  const pagination = calculatePagination(page, limit, total);
  
  return { projects, pagination };
};

/**
 * Recupera un singolo progetto per ID
 * @param {String} projectId - ID del progetto
 * @param {Boolean} publicOnly - Se verificare che sia pubblico
 * @returns {Promise<Object>} Progetto
 */
const getProjectById = async (projectId, publicOnly = false) => {
  const filter = { _id: projectId };
  if (publicOnly) {
    filter.visible = true;
  }
  
  const project = await Project.findOne(filter)
    .populate('client', 'name email')
    .populate('createdBy', 'name email')
    .lean();
  
  if (!project) {
    throw new Error('Progetto non trovato');
  }
  
  return standardizeProjectResponse(project);
};

/**
 * Elimina un progetto
 * @param {String} projectId - ID del progetto
 * @returns {Promise<Boolean>} True se eliminato con successo
 */
const deleteProject = async (projectId) => {
  const project = await Project.findById(projectId);
  
  if (!project) {
    throw new Error('Progetto non trovato');
  }
  
  // Elimina il progetto
  await Project.findByIdAndDelete(projectId);
  
  // Elimina documenti associati
  const Document = require('../models/Document');
  await Document.deleteMany({ project: projectId });
  
  return true;
};

/**
 * Calcola le statistiche dei progetti
 * @returns {Promise<Object>} Statistiche
 */
const getProjectStats = async () => {
  const [
    totalProjects,
    activeProjects,
    completedProjects,
    featuredProjects,
    projectsByCategory,
    projectsByStatus,
    projectsByType,
    totalUnitsResult
  ] = await Promise.all([
    Project.countDocuments(),
    Project.countDocuments({ status: 'In corso' }),
    Project.countDocuments({ status: 'Completato' }),
    Project.countDocuments({ featured: true }),
    Project.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]),
    Project.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]),
    Project.aggregate([
      { $group: { _id: '$projectType', count: { $sum: 1 } } }
    ]),
    Project.aggregate([
      { $match: { projectType: 'Multiproprietà' } },
      { $project: { apartmentsCount: { $size: "$apartments" } } },
      { $group: { _id: null, totalUnits: { $sum: "$apartmentsCount" } } }
    ])
  ]);
  
  return {
    total: totalProjects,
    active: activeProjects,
    completed: completedProjects,
    featured: featuredProjects,
    byCategory: projectsByCategory,
    byStatus: projectsByStatus,
    byType: projectsByType,
    totalUnits: totalUnitsResult.length > 0 ? totalUnitsResult[0].totalUnits : 0
  };
};

module.exports = {
  createProject,
  updateProject,
  getProjects,
  getProjectById,
  deleteProject,
  getProjectStats
};
