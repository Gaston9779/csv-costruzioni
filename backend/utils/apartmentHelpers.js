const mongoose = require('mongoose');
const { standardizeImages, createImageObject } = require('./imageHelpers');

/**
 * Processa i dati di un appartamento dal body della richiesta
 * @param {Object} apartmentData - Dati dell'appartamento
 * @param {Number} index - Indice dell'appartamento
 * @returns {Object} Appartamento processato
 */
const processApartmentData = (apartmentData, index = 0) => {
  return {
    _id: apartmentData._id || new mongoose.Types.ObjectId(),
    title: apartmentData.title || `Appartamento ${index + 1}`,
    description: apartmentData.description || '',
    squareMeters: apartmentData.squareMeters || 0,
    floor: apartmentData.floor || 0,
    bedrooms: apartmentData.bedrooms || 0,
    bathrooms: apartmentData.bathrooms || 0,
    budget: apartmentData.budget || 0,
    status: apartmentData.status || 'In corso',
    images: []
  };
};

/**
 * Associa le immagini caricate agli appartamenti in base ai metadati
 * @param {Array} apartments - Array di appartamenti
 * @param {Array} files - File caricati
 * @param {Object} metadataMap - Mappa dei metadati delle immagini
 * @returns {Array} Appartamenti con immagini associate
 */
const associateImagesToApartments = (apartments, files, metadataMap) => {
  if (!files || files.length === 0) {
    return apartments;
  }

  files.forEach((file, fileIndex) => {
    const metadata = metadataMap[fileIndex];
    if (metadata && metadata.apartmentIndex !== undefined) {
      const apartmentIndex = metadata.apartmentIndex;
      
      if (apartments[apartmentIndex]) {
        const imageObject = createImageObject(file, 'apartments', metadata);
        apartments[apartmentIndex].images.push(imageObject);
      }
    }
  });

  return apartments;
};

/**
 * Estrae i metadati delle immagini dal body della richiesta
 * @param {Object} body - Body della richiesta
 * @param {Number} fileCount - Numero di file caricati
 * @returns {Object} Mappa dei metadati
 */
const extractImageMetadata = (body, fileCount) => {
  const metadataMap = {};
  
  for (let i = 0; i < fileCount; i++) {
    const metadataKey = `apartmentImageMetadata_${i}`;
    if (body[metadataKey]) {
      try {
        metadataMap[i] = JSON.parse(body[metadataKey]);
      } catch (e) {
        console.error(`Errore parsing metadati immagine ${i}:`, e);
      }
    }
  }
  
  return metadataMap;
};

/**
 * Processa gli appartamenti da JSON
 * @param {String|Array|Object} apartmentsData - Dati degli appartamenti
 * @returns {Array} Array di appartamenti processati
 */
const parseApartmentsData = (apartmentsData) => {
  if (!apartmentsData) {
    return [];
  }

  let parsed;
  
  try {
    if (typeof apartmentsData === 'string') {
      parsed = JSON.parse(apartmentsData);
    } else if (Array.isArray(apartmentsData)) {
      parsed = apartmentsData;
    } else {
      parsed = [apartmentsData];
    }
  } catch (error) {
    console.error('Errore nel parsing degli appartamenti:', error);
    return [];
  }

  if (!Array.isArray(parsed)) {
    return [];
  }

  return parsed.map((apt, index) => processApartmentData(apt, index));
};

/**
 * Filtra le immagini da eliminare da un appartamento
 * @param {Array} images - Array di immagini
 * @param {Array} imagesToDelete - Array di ID da eliminare
 * @returns {Array} Immagini filtrate
 */
const filterImagesToDelete = (images, imagesToDelete) => {
  if (!imagesToDelete || !Array.isArray(imagesToDelete) || imagesToDelete.length === 0) {
    return images;
  }

  return images.filter(img => {
    if (!img || !img._id) return true;
    const shouldDelete = imagesToDelete.includes(img._id.toString()) || 
                        imagesToDelete.includes(img._id);
    return !shouldDelete;
  });
};

/**
 * Standardizza tutti gli appartamenti di un progetto
 * @param {Array} apartments - Array di appartamenti
 * @returns {Array} Appartamenti standardizzati
 */
const standardizeApartments = (apartments) => {
  if (!apartments || !Array.isArray(apartments)) {
    return [];
  }

  return apartments.map(apartment => ({
    ...apartment,
    images: standardizeImages(apartment.images || [], 'apartments')
  }));
};

/**
 * Valida i dati di un appartamento
 * @param {Object} apartmentData - Dati dell'appartamento
 * @returns {Object} { valid: Boolean, errors: Array }
 */
const validateApartmentData = (apartmentData) => {
  const errors = [];

  if (!apartmentData.title || apartmentData.title.trim() === '') {
    errors.push('Il titolo dell\'appartamento è obbligatorio');
  }

  if (apartmentData.squareMeters && apartmentData.squareMeters < 0) {
    errors.push('I metri quadri non possono essere negativi');
  }

  if (apartmentData.bedrooms && apartmentData.bedrooms < 0) {
    errors.push('Il numero di camere non può essere negativo');
  }

  if (apartmentData.bathrooms && apartmentData.bathrooms < 0) {
    errors.push('Il numero di bagni non può essere negativo');
  }

  if (apartmentData.budget && apartmentData.budget < 0) {
    errors.push('Il budget non può essere negativo');
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

module.exports = {
  processApartmentData,
  associateImagesToApartments,
  extractImageMetadata,
  parseApartmentsData,
  filterImagesToDelete,
  standardizeApartments,
  validateApartmentData
};
