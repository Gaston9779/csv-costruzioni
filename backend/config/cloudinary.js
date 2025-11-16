const cloudinary = require('cloudinary').v2;

// Configurazione Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Log configurazione per debug
console.log('🔧 Cloudinary Config:', {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME ? '✅ SET' : '❌ MISSING',
  api_key: process.env.CLOUDINARY_API_KEY ? '✅ SET' : '❌ MISSING',
  api_secret: process.env.CLOUDINARY_API_SECRET ? '✅ SET' : '❌ MISSING'
});

module.exports = cloudinary;
