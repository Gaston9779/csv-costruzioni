const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

// Verifica se Cloudinary è configurato
const isCloudinaryConfigured = process.env.CLOUDINARY_CLOUD_NAME && 
                                process.env.CLOUDINARY_API_KEY && 
                                process.env.CLOUDINARY_API_SECRET;

// Storage per immagini progetti
const projectStorage = isCloudinaryConfigured 
  ? new CloudinaryStorage({
      cloudinary: cloudinary,
      params: {
        folder: 'csv-costruzioni/projects',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic', 'heif'],
        resource_type: 'auto'
      }
    })
  : null;

// Storage per immagini appartamenti
const apartmentStorage = isCloudinaryConfigured
  ? new CloudinaryStorage({
      cloudinary: cloudinary,
      params: {
        folder: 'csv-costruzioni/apartments',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic', 'heif'],
        resource_type: 'auto'
      }
    })
  : null;

// Configurazione multer
const createUploadMiddleware = (storage) => {
  if (!storage) {
    console.log('⚠️ Cloudinary non configurato - usando storage locale (non persistente)');
    return null;
  }

  return multer({
    storage: storage,
    limits: {
      fileSize: 10 * 1024 * 1024 // 10MB max
    },
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Solo immagini sono permesse'), false);
      }
    }
  });
};

const uploadProjectImages = createUploadMiddleware(projectStorage);
const uploadApartmentImages = createUploadMiddleware(apartmentStorage);

module.exports = {
  uploadProjectImages,
  uploadApartmentImages,
  isCloudinaryConfigured
};
