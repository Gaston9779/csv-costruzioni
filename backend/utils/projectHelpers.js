const { standardizeImages } = require('./imageHelpers');
const { standardizeApartments } = require('./apartmentHelpers');

/**
 * Standardizza la risposta di un progetto
 * Assicura che tutte le immagini abbiano URL completi
 * @param {Object} project - Progetto da standardizzare
 * @returns {Object} Progetto standardizzato
 */
const standardizeProjectResponse = (project) => {
  if (!project) return null;
  
  // Crea una copia del progetto
  const standardizedProject = JSON.parse(JSON.stringify(project));
  
  // Standardizza le immagini degli appartamenti
  if (standardizedProject.apartments && Array.isArray(standardizedProject.apartments)) {
    standardizedProject.apartments = standardizeApartments(standardizedProject.apartments);
  }
  
  // Standardizza le immagini del progetto principale
  if (standardizedProject.images && Array.isArray(standardizedProject.images)) {
    standardizedProject.images = standardizeImages(standardizedProject.images, 'projects');
  }
  
  return standardizedProject;
};

/**
 * Prepara i dati del progetto per la creazione/aggiornamento
 * @param {Object} body - Body della richiesta
 * @param {Object} user - Utente che effettua l'operazione
 * @param {Boolean} isUpdate - Se è un aggiornamento
 * @returns {Object} Dati del progetto preparati
 */
const prepareProjectData = (body, user = null, isUpdate = false) => {
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
    location,
    notes
  } = body;

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
    visible: (typeof visible !== 'undefined') ? (visible === 'true' || visible === true) : true,
    featured: featured === 'true' || featured === true,
    location: location || '',
    notes: notes || ''
  };

  // Aggiungi createdBy solo per nuovi progetti
  if (!isUpdate && user) {
    projectData.createdBy = user.id;
  }

  return projectData;
};

/**
 * Valida i dati del progetto
 * @param {Object} projectData - Dati del progetto
 * @returns {Object} { valid: Boolean, errors: Array }
 */
const validateProjectData = (projectData) => {
  const errors = [];

  if (!projectData.title || projectData.title.trim() === '') {
    errors.push('Il titolo è obbligatorio');
  }

  if (projectData.budget && projectData.budget < 0) {
    errors.push('Il budget non può essere negativo');
  }

  if (projectData.startDate && projectData.endDate) {
    const start = new Date(projectData.startDate);
    const end = new Date(projectData.endDate);
    if (end < start) {
      errors.push('La data di fine non può essere precedente alla data di inizio');
    }
  }

  const validCategories = ['Residenziale', 'Commerciale', 'Industriale', 'Infrastrutture'];
  if (projectData.category && !validCategories.includes(projectData.category)) {
    errors.push('Categoria non valida');
  }

  const validStatuses = ['In corso', 'Completato', 'In attesa', 'Sospeso'];
  if (projectData.status && !validStatuses.includes(projectData.status)) {
    errors.push('Status non valido');
  }

  const validProjectTypes = ['Singola', 'Multiproprietà'];
  if (projectData.projectType && !validProjectTypes.includes(projectData.projectType)) {
    errors.push('Tipo di progetto non valido');
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Costruisce il filtro per la query dei progetti
 * @param {Object} query - Query parameters
 * @param {Boolean} publicOnly - Se mostrare solo progetti pubblici
 * @returns {Object} Filtro MongoDB
 */
const buildProjectFilter = (query, publicOnly = false) => {
  const filter = {};

  if (publicOnly) {
    filter.visible = true;
  }

  if (query.category && query.category !== 'all') {
    filter.category = query.category;
  }

  if (query.status && query.status !== 'all') {
    filter.status = query.status;
  }

  if (query.client) {
    filter.client = query.client;
  }

  if (query.featured === 'true') {
    filter.featured = true;
  }

  if (query.projectType && query.projectType !== 'all') {
    filter.projectType = query.projectType;
  }

  return filter;
};

/**
 * Costruisce le opzioni di ordinamento per la query
 * @param {String} sortBy - Campo per ordinamento
 * @returns {Object} Opzioni di sort MongoDB
 */
const buildSortOptions = (sortBy) => {
  const sortOptions = {
    'updatedAt': { updatedAt: -1 },
    'projectId': { projectId: -1 },
    'title': { title: 1 },
    'featured': { featured: -1, createdAt: -1 }
  };

  return sortOptions[sortBy] || { createdAt: -1 };
};

/**
 * Calcola la paginazione
 * @param {Number} page - Numero pagina
 * @param {Number} limit - Elementi per pagina
 * @param {Number} total - Totale elementi
 * @returns {Object} Oggetto paginazione
 */
const calculatePagination = (page, limit, total) => {
  return {
    page: parseInt(page),
    limit: parseInt(limit),
    total,
    pages: Math.ceil(total / limit),
    hasNext: page * limit < total,
    hasPrev: page > 1
  };
};

module.exports = {
  standardizeProjectResponse,
  prepareProjectData,
  validateProjectData,
  buildProjectFilter,
  buildSortOptions,
  calculatePagination
};
