const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');

/**
 * Formatta l'URL di un'immagine (supporta locale e Cloudinary)
 * @param {Object} file - File object
 * @param {String} type - Tipo di immagine ('projects' o 'apartments')
 * @returns {String} URL formattato
 */
const formatImageUrl = (file, type = 'projects') => {
  if (file.path && file.path.startsWith('http')) {
    return file.path;
  }
  return `/uploads/${type}/${file.filename}`;
};

/**
 * Standardizza un oggetto immagine assicurando che abbia tutti i campi necessari
 * @param {Object} image - Oggetto immagine
 * @param {String} type - Tipo di immagine ('projects' o 'apartments')
 * @returns {Object} Immagine standardizzata
 */
const standardizeImage = (image, type = 'apartments') => {
  // CASO 1: Se è solo un ID stringa
  if (typeof image === 'string') {
    return {
      _id: image,
      filename: `${type}_image_${image}.jpg`,
      mimetype: 'image/jpeg',
      url: `/uploads/${type}/${type}_image_${image}.jpg`,
      description: ''
    };
  }

  // CASO 2: Se è un oggetto con solo ID
  if (image && image._id && Object.keys(image).length === 1) {
    const imageId = typeof image._id === 'string' ? image._id : image._id.toString();
    return {
      _id: image._id,
      filename: `${type}_image_${imageId}.jpg`,
      mimetype: 'image/jpeg',
      url: `/uploads/${type}/${type}_image_${imageId}.jpg`,
      description: ''
    };
  }

  // CASO 3: Se l'immagine ha filename ma non URL
  if (image && image.filename && !image.url) {
    return {
      ...image,
      url: `/uploads/${type}/${image.filename}`
    };
  }

  // CASO 4: Se l'immagine ha _id ma non URL
  if (image && image._id && !image.url) {
    const imageId = typeof image._id === 'string' ? image._id : image._id.toString();
    return {
      ...image,
      filename: image.filename || `${type}_image_${imageId}.jpg`,
      url: `/uploads/${type}/${image.filename || `${type}_image_${imageId}.jpg`}`,
      mimetype: image.mimetype || 'image/jpeg',
      description: image.description || ''
    };
  }

  // CASO 5: Se l'immagine non ha né URL né filename ma ha _id
  if (image && image._id && !image.url && !image.filename) {
    const imageId = typeof image._id === 'string' ? image._id : image._id.toString();
    return {
      ...image,
      filename: `${type}_image_${imageId}.jpg`,
      url: `/uploads/${type}/${type}_image_${imageId}.jpg`,
      mimetype: image.mimetype || 'image/jpeg',
      description: image.description || ''
    };
  }

  // CASO 6: Se per qualche motivo non è un oggetto valido
  if (!image || typeof image !== 'object') {
    console.error(`⚠️ IMMAGINE INVALIDA:`, image);
    return null;
  }

  // CASO 7: Ultimo controllo - se ancora non ha URL
  if (!image.url) {
    const idStr = image._id ? (typeof image._id === 'string' ? image._id : image._id.toString()) : 'unknown';
    return {
      ...image,
      filename: image.filename || `${type}_image_${idStr}.jpg`,
      url: `/uploads/${type}/${image.filename || `${type}_image_${idStr}.jpg`}`,
      mimetype: image.mimetype || 'image/jpeg'
    };
  }

  return image;
};

/**
 * Processa e standardizza un array di immagini
 * @param {Array} images - Array di immagini
 * @param {String} type - Tipo di immagine ('projects' o 'apartments')
 * @returns {Array} Array di immagini standardizzate
 */
const standardizeImages = (images, type = 'apartments') => {
  if (!images || !Array.isArray(images)) {
    return [];
  }

  return images
    .map(image => standardizeImage(image, type))
    .filter(Boolean);
};

/**
 * Crea un oggetto immagine da un file caricato
 * @param {Object} file - File object da multer/busboy
 * @param {String} type - Tipo di immagine ('projects' o 'apartments')
 * @param {Object} metadata - Metadati aggiuntivi (descrizione, etc.)
 * @returns {Object} Oggetto immagine completo
 */
const createImageObject = (file, type = 'projects', metadata = {}) => {
  return {
    _id: new mongoose.Types.ObjectId(),
    filename: file.filename,
    path: file.path,
    size: file.size,
    mimetype: file.mimetype,
    url: formatImageUrl(file, type),
    originalName: file.originalname,
    description: metadata.description || '',
    cloudinaryId: file.filename
  };
};

/**
 * Salva un'immagine base64 su disco
 * @param {String} base64Data - Dati base64 dell'immagine
 * @param {String} type - Tipo di immagine ('projects' o 'apartments')
 * @param {Number} index - Indice per il nome file
 * @returns {Object|null} Oggetto immagine o null se errore
 */
const saveBase64Image = (base64Data, type = 'apartments', index = 0) => {
  try {
    const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    
    if (!matches || matches.length !== 3) {
      console.error('Formato base64 non valido');
      return null;
    }

    const mimeType = matches[1];
    const base64Content = matches[2];
    const extension = mimeType.split('/')[1];
    
    const filename = `${type}_${index}_${Date.now()}_${Math.floor(Math.random() * 1000)}.${extension}`;
    const uploadDir = path.join(__dirname, `../uploads/${type}`);
    
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    const filepath = path.join(uploadDir, filename);
    const buffer = Buffer.from(base64Content, 'base64');
    fs.writeFileSync(filepath, buffer);
    
    return {
      _id: new mongoose.Types.ObjectId(),
      filename: filename,
      path: filepath,
      size: buffer.length,
      mimetype: mimeType,
      url: `/uploads/${type}/${filename}`,
      description: ''
    };
  } catch (error) {
    console.error('Errore nel salvare immagine base64:', error);
    return null;
  }
};

/**
 * Elimina un file dal filesystem
 * @param {String} filePath - Path del file da eliminare
 * @returns {Boolean} True se eliminato con successo
 */
const deleteFile = (filePath) => {
  try {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Errore nell\'eliminazione file:', error);
    return false;
  }
};

module.exports = {
  formatImageUrl,
  standardizeImage,
  standardizeImages,
  createImageObject,
  saveBase64Image,
  deleteFile
};
