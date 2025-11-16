const cloudinary = require('../config/cloudinary');

/**
 * Formatta i file caricati tramite Cloudinary per il salvataggio nel database
 * @param {Array} files - Array di file caricati tramite multer-cloudinary
 * @returns {Array} Array di oggetti immagine formattati
 */
const formatCloudinaryImages = (files) => {
  if (!files || files.length === 0) return [];
  
  return files.map(file => {
    // Log per debug
    console.log('📸 File Cloudinary ricevuto:', {
      filename: file.filename,
      path: file.path,
      url: file.url,
      secure_url: file.secure_url
    });
    
    // Cloudinary restituisce secure_url come URL pubblico
    const imageUrl = file.secure_url || file.url || file.path;
    
    return {
      filename: file.filename, // public_id di Cloudinary
      path: imageUrl, // URL completo di Cloudinary
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      url: imageUrl, // URL pubblico di Cloudinary
      cloudinaryId: file.filename // Per future eliminazioni
    };
  });
};

/**
 * Elimina un'immagine da Cloudinary
 * @param {String} publicId - Public ID dell'immagine su Cloudinary
 * @returns {Promise}
 */
const deleteCloudinaryImage = async (publicId) => {
  try {
    if (!publicId) {
      console.log('⚠️ Nessun public_id fornito per eliminazione');
      return { result: 'ok' };
    }
    
    console.log(`🗑️ Eliminazione immagine Cloudinary: ${publicId}`);
    const result = await cloudinary.uploader.destroy(publicId);
    console.log(`✅ Immagine eliminata da Cloudinary:`, result);
    return result;
  } catch (error) {
    console.error('❌ Errore eliminazione immagine da Cloudinary:', error);
    throw error;
  }
};

/**
 * Elimina multiple immagini da Cloudinary
 * @param {Array} publicIds - Array di public IDs
 * @returns {Promise}
 */
const deleteMultipleCloudinaryImages = async (publicIds) => {
  try {
    if (!publicIds || publicIds.length === 0) return { result: 'ok' };
    
    console.log(`🗑️ Eliminazione ${publicIds.length} immagini da Cloudinary`);
    const results = await Promise.all(
      publicIds.map(id => deleteCloudinaryImage(id))
    );
    return results;
  } catch (error) {
    console.error('❌ Errore eliminazione multipla da Cloudinary:', error);
    throw error;
  }
};

module.exports = {
  formatCloudinaryImages,
  deleteCloudinaryImage,
  deleteMultipleCloudinaryImages
};
