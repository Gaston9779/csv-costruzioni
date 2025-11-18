const cloudinary = require('cloudinary').v2;

// Configurazione Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Verifica configurazione
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.error('⚠️ ATTENZIONE: Credenziali Cloudinary mancanti. Le immagini verranno salvate localmente (non persistente su Render).');
} else {
  console.log('✅ Cloudinary configurato correttamente');
}

module.exports = cloudinary;
