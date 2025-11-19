const cloudinary = require('cloudinary').v2;

// Configurazione Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Verifica configurazione
const isConfigured = !!(
  process.env.CLOUDINARY_CLOUD_NAME && 
  process.env.CLOUDINARY_API_KEY && 
  process.env.CLOUDINARY_API_SECRET
);

if (isConfigured) {
  console.log('✅ Cloudinary configurato:', process.env.CLOUDINARY_CLOUD_NAME);
} else {
  console.log('⚠️ Cloudinary NON configurato - immagini NON persistenti');
}

module.exports = { cloudinary, isConfigured };
