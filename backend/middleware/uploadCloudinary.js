const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');
const path = require('path');
const fs = require('fs');

// Verifica se Cloudinary è configurato
const isCloudinaryConfigured = process.env.CLOUDINARY_CLOUD_NAME && 
                                process.env.CLOUDINARY_API_KEY && 
                                process.env.CLOUDINARY_API_SECRET;

// Storage locale fallback
const localProjectStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../uploads/projects');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, 'project-' + uniqueSuffix + extension);
  }
});

const localApartmentStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../uploads/apartments');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, 'apartment-' + uniqueSuffix + extension);
  }
});

// Storage per immagini progetti (Cloudinary o locale)
const projectStorage = isCloudinaryConfigured 
  ? new CloudinaryStorage({
      cloudinary: cloudinary,
      params: {
        folder: 'csv-costruzioni/projects',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic', 'heif'],
        resource_type: 'auto'
      }
    })
  : localProjectStorage;

// Storage per immagini appartamenti (Cloudinary o locale)
const apartmentStorage = isCloudinaryConfigured
  ? new CloudinaryStorage({
      cloudinary: cloudinary,
      params: {
        folder: 'csv-costruzioni/apartments',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic', 'heif'],
        resource_type: 'auto'
      }
    })
  : localApartmentStorage;

if (isCloudinaryConfigured) {
  console.log('✅ Cloudinary configurato - immagini persistenti');
} else {
  console.log('⚠️ Cloudinary NON configurato - usando storage locale (NON persistente su Render)');
}

// Configurazione multer
const createUploadMiddleware = (storage) => {
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
