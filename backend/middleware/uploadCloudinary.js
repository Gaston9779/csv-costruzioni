const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

// Storage per immagini progetti
const projectStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'csv-costruzioni/projects',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [{ width: 1200, height: 800, crop: 'limit' }]
  }
});

// Storage per immagini appartamenti
const apartmentStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'csv-costruzioni/apartments',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [{ width: 1200, height: 800, crop: 'limit' }]
  }
});

// Multer upload per progetti
const uploadProjectImages = multer({
  storage: projectStorage,
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

// Multer upload per appartamenti
const uploadApartmentImages = multer({
  storage: apartmentStorage,
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

module.exports = {
  uploadProjectImages,
  uploadApartmentImages,
  cloudinary
};
