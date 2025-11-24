const busboy = require('busboy');
const path = require('path');
const fs = require('fs');
const { uploadToCloudinary } = require('../utils/cloudinaryUpload');

/**
 * Configurazione per il parsing multipart
 */
const UPLOAD_CONFIG = {
  apartments: {
    dir: path.join(__dirname, '../uploads/apartments'),
    prefix: 'apartment-',
    cloudinaryFolder: 'csv-costruzioni/apartments'
  },
  projects: {
    dir: path.join(__dirname, '../uploads/projects'),
    prefix: 'project-',
    cloudinaryFolder: 'csv-costruzioni/projects'
  }
};

/**
 * Assicura che la directory di upload esista
 * @param {String} dir - Directory path
 */
const ensureUploadDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

/**
 * Genera un nome file unico
 * @param {String} originalName - Nome originale del file
 * @param {String} prefix - Prefisso per il nome file
 * @returns {String} Nome file unico
 */
const generateUniqueFilename = (originalName, prefix = '') => {
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
  const extension = path.extname(originalName);
  return `${prefix}${uniqueSuffix}${extension}`;
};

/**
 * Determina la configurazione di upload in base al fieldname
 * @param {String} fieldname - Nome del campo
 * @returns {Object} Configurazione di upload
 */
const getUploadConfig = (fieldname) => {
  return fieldname === 'apartmentImages' 
    ? UPLOAD_CONFIG.apartments 
    : UPLOAD_CONFIG.projects;
};

/**
 * Processa un file ricevuto tramite busboy
 * @param {String} fieldname - Nome del campo
 * @param {Stream} file - Stream del file
 * @param {Object} info - Informazioni sul file
 * @returns {Promise<Object>} File processato
 */
const processFile = (fieldname, file, info) => {
  return new Promise((resolve, reject) => {
    const { filename, mimeType } = info;
    const config = getUploadConfig(fieldname);
    const newFilename = generateUniqueFilename(filename, config.prefix);
    
    ensureUploadDir(config.dir);
    
    const filePath = path.join(config.dir, newFilename);
    const writeStream = fs.createWriteStream(filePath);
    
    file.pipe(writeStream);
    
    writeStream.on('finish', () => {
      resolve({
        fieldname,
        originalname: filename,
        filename: newFilename,
        path: filePath,
        mimetype: mimeType,
        size: 0 // Sarà aggiornato dopo l'upload su Cloudinary
      });
    });
    
    writeStream.on('error', reject);
  });
};

/**
 * Carica i file su Cloudinary
 * @param {Array} files - Array di file da caricare
 * @returns {Promise<Array>} File con URL Cloudinary
 */
const uploadFilesToCloudinary = async (files) => {
  if (!files || files.length === 0) {
    return [];
  }

  console.log(`📤 Caricamento ${files.length} file su Cloudinary...`);
  
  for (const file of files) {
    const config = getUploadConfig(file.fieldname);
    console.log(`File: ${file.originalname} - path locale: ${file.path}`);
    
    try {
      const cloudinaryUrl = await uploadToCloudinary(file.path, config.cloudinaryFolder);
      console.log(`✅ URL Cloudinary: ${cloudinaryUrl}`);
      file.path = cloudinaryUrl;
    } catch (error) {
      console.error(`❌ Errore upload Cloudinary per ${file.originalname}:`, error);
      throw error;
    }
  }
  
  return files;
};

/**
 * Parsa una richiesta multipart usando busboy
 * @param {Object} req - Request object
 * @param {Boolean} uploadToCloud - Se caricare su Cloudinary
 * @returns {Promise<Object>} { fields, files }
 */
const parseMultipartRequest = (req, uploadToCloud = true) => {
  return new Promise((resolve, reject) => {
    try {
      console.log('========== BUSBOY START ==========');
      console.log('Content-Type:', req.headers['content-type']);
      
      const bb = busboy({ headers: req.headers });
      const fields = {};
      const filePromises = [];
      
      bb.on('field', (fieldname, val) => {
        console.log(`📝 Campo ricevuto: ${fieldname}`);
        fields[fieldname] = val;
      });
      
      bb.on('file', (fieldname, file, info) => {
        console.log(`📎 File ricevuto: ${fieldname} - ${info.filename}`);
        filePromises.push(processFile(fieldname, file, info));
      });
      
      bb.on('finish', async () => {
        console.log('========== BUSBOY FINISH ==========');
        
        try {
          // Attendi che tutti i file siano scritti su disco
          const files = await Promise.all(filePromises);
          console.log(`Files ricevuti: ${files.length}`);
          console.log(`Campi ricevuti: ${Object.keys(fields).length}`);
          
          // Upload su Cloudinary se richiesto
          if (uploadToCloud && files.length > 0) {
            await uploadFilesToCloudinary(files);
          } else if (files.length === 0) {
            console.log('⚠️ NESSUN FILE ricevuto da busboy!');
          }
          
          console.log('===================================');
          
          resolve({ fields, files });
        } catch (error) {
          reject(error);
        }
      });
      
      bb.on('error', reject);
      
      req.pipe(bb);
    } catch (error) {
      console.error('Errore nel parsing multipart:', error);
      reject(error);
    }
  });
};

/**
 * Middleware per il parsing multipart
 * @param {Boolean} uploadToCloud - Se caricare su Cloudinary
 * @returns {Function} Middleware function
 */
const multipartMiddleware = (uploadToCloud = true) => {
  return async (req, res, next) => {
    const contentType = req.headers['content-type'] || '';
    
    if (!contentType.includes('multipart/form-data')) {
      return next();
    }
    
    try {
      const { fields, files } = await parseMultipartRequest(req, uploadToCloud);
      req.body = fields;
      req.files = files;
      next();
    } catch (error) {
      console.error('Errore nel parsing multipart:', error);
      res.status(500).json({
        success: false,
        message: 'Errore nel parsing della richiesta',
        error: error.message
      });
    }
  };
};

module.exports = {
  parseMultipartRequest,
  multipartMiddleware,
  uploadFilesToCloudinary,
  ensureUploadDir,
  generateUniqueFilename
};
