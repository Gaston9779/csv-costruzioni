const { cloudinary, isConfigured } = require('../config/cloudinary');
const fs = require('fs');

/**
 * Carica un file su Cloudinary e restituisce l'URL
 * @param {string} localPath - Path del file locale
 * @param {string} folder - Cartella su Cloudinary (es. 'csv-costruzioni/projects')
 * @returns {Promise<string>} - URL Cloudinary del file caricato
 */
async function uploadToCloudinary(localPath, folder = 'csv-costruzioni/projects') {
  if (!isConfigured) {
    console.log('⚠️ Cloudinary non configurato, uso path locale:', localPath);
    return localPath;
  }

  try {
    console.log(`📤 Upload a Cloudinary: ${localPath} -> ${folder}`);
    
    const result = await cloudinary.uploader.upload(localPath, {
      folder: folder,
      resource_type: 'auto'
    });

    console.log(`✅ Upload completato: ${result.secure_url}`);

    // Elimina il file locale dopo l'upload
    try {
      fs.unlinkSync(localPath);
      console.log(`🗑️ File locale eliminato: ${localPath}`);
    } catch (err) {
      console.error('Errore eliminazione file locale:', err.message);
    }

    return result.secure_url;
  } catch (error) {
    console.error('❌ Errore upload Cloudinary:', error.message);
    // In caso di errore, mantieni il file locale
    return localPath;
  }
}

/**
 * Elimina un file da Cloudinary
 * @param {string} cloudinaryUrl - URL completo Cloudinary
 * @returns {Promise<boolean>} - true se eliminato con successo
 */
async function deleteFromCloudinary(cloudinaryUrl) {
  if (!isConfigured || !cloudinaryUrl.includes('cloudinary.com')) {
    return false;
  }

  try {
    // Estrai public_id dall'URL Cloudinary
    const matches = cloudinaryUrl.match(/\/v\d+\/(.+)\.\w+$/);
    if (!matches) return false;
    
    const publicId = matches[1];
    console.log(`🗑️ Eliminazione da Cloudinary: ${publicId}`);
    
    await cloudinary.uploader.destroy(publicId);
    console.log(`✅ File eliminato da Cloudinary`);
    return true;
  } catch (error) {
    console.error('❌ Errore eliminazione Cloudinary:', error.message);
    return false;
  }
}

module.exports = {
  uploadToCloudinary,
  deleteFromCloudinary
};
