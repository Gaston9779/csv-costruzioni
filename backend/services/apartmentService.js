const mongoose = require('mongoose');
const Project = require('../models/Project');
const { standardizeProjectResponse } = require('../utils/projectHelpers');
const { 
  processApartmentData, 
  extractImageMetadata,
  validateApartmentData,
  filterImagesToDelete
} = require('../utils/apartmentHelpers');
const { createImageObject } = require('../utils/imageHelpers');
const { deleteFromCloudinary } = require('../utils/cloudinaryUpload');

/**
 * Aggiunge un appartamento a un progetto
 * @param {String} projectId - ID del progetto
 * @param {Object} apartmentData - Dati dell'appartamento
 * @param {Array} files - File caricati
 * @returns {Promise<Object>} { apartment, project }
 */
const addApartment = async (projectId, apartmentData, files = []) => {
  // Trova il progetto
  const project = await Project.findById(projectId);
  if (!project) {
    throw new Error('Progetto non trovato');
  }
  
  // Verifica che sia un progetto multiproprietà
  if (project.projectType !== 'Multiproprietà') {
    throw new Error('Solo i progetti multiproprietà possono avere appartamenti');
  }
  
  // Processa i dati dell'appartamento
  const apartment = processApartmentData(apartmentData, project.apartments.length);
  
  // Valida i dati
  const validation = validateApartmentData(apartment);
  if (!validation.valid) {
    throw new Error(validation.errors.join(', '));
  }
  
  // Processa le immagini
  if (files && files.length > 0) {
    const metadataMap = extractImageMetadata(apartmentData, files.length);
    
    files.forEach((file, index) => {
      const metadata = metadataMap[index] || {};
      const imageObject = createImageObject(file, 'apartments', metadata);
      apartment.images.push(imageObject);
    });
  }
  
  // Aggiungi l'appartamento al progetto
  project.apartments.push(apartment);
  project.totalUnits = project.apartments.length;
  
  await project.save();
  
  const standardizedProject = standardizeProjectResponse(project.toObject());
  const addedApartment = standardizedProject.apartments[standardizedProject.apartments.length - 1];
  
  return {
    apartment: addedApartment,
    project: standardizedProject
  };
};

/**
 * Aggiorna un appartamento esistente
 * @param {String} projectId - ID del progetto
 * @param {String} apartmentId - ID dell'appartamento
 * @param {Object} updateData - Dati da aggiornare
 * @param {Array} files - File caricati
 * @returns {Promise<Object>} { apartment, project }
 */
const updateApartment = async (projectId, apartmentId, updateData, files = []) => {
  // Trova il progetto
  const project = await Project.findById(projectId);
  if (!project) {
    throw new Error('Progetto non trovato');
  }
  
  // Trova l'appartamento
  const apartmentIndex = project.apartments.findIndex(
    apt => apt._id.toString() === apartmentId
  );
  
  if (apartmentIndex === -1) {
    throw new Error('Appartamento non trovato');
  }
  
  // Valida i dati di aggiornamento
  const validation = validateApartmentData(updateData);
  if (!validation.valid) {
    throw new Error(validation.errors.join(', '));
  }
  
  // Gestione eliminazione immagini
  if (updateData.imagesToDelete && Array.isArray(updateData.imagesToDelete)) {
    const currentImages = project.apartments[apartmentIndex].images || [];
    const filteredImages = filterImagesToDelete(currentImages, updateData.imagesToDelete);
    
    // Elimina da Cloudinary
    const imagesToDeleteFromCloud = currentImages.filter(img => 
      updateData.imagesToDelete.includes(img._id.toString()) || 
      updateData.imagesToDelete.includes(img._id)
    );
    
    for (const img of imagesToDeleteFromCloud) {
      if (img.cloudinaryId || img.filename) {
        try {
          await deleteFromCloudinary(img.cloudinaryId || img.filename);
        } catch (error) {
          console.error('Errore eliminazione da Cloudinary:', error);
        }
      }
    }
    
    project.apartments[apartmentIndex].images = filteredImages;
  }
  
  // Aggiungi nuove immagini
  if (files && files.length > 0) {
    const metadataMap = extractImageMetadata(updateData, files.length);
    
    if (!project.apartments[apartmentIndex].images) {
      project.apartments[apartmentIndex].images = [];
    }
    
    files.forEach((file, index) => {
      const metadata = metadataMap[index] || {};
      const imageObject = createImageObject(file, 'apartments', metadata);
      project.apartments[apartmentIndex].images.push(imageObject);
    });
  }
  
  // Aggiorna i campi dell'appartamento
  Object.keys(updateData).forEach(key => {
    if (key !== 'imagesToDelete' && key !== 'images') {
      project.apartments[apartmentIndex][key] = updateData[key];
    }
  });
  
  await project.save();
  
  const standardizedProject = standardizeProjectResponse(project.toObject());
  
  return {
    apartment: standardizedProject.apartments[apartmentIndex],
    project: standardizedProject
  };
};

/**
 * Elimina un appartamento
 * @param {String} projectId - ID del progetto
 * @param {String} apartmentId - ID dell'appartamento
 * @returns {Promise<Object>} Progetto aggiornato
 */
const deleteApartment = async (projectId, apartmentId) => {
  // Trova il progetto
  const project = await Project.findById(projectId);
  if (!project) {
    throw new Error('Progetto non trovato');
  }
  
  // Trova l'appartamento
  const apartmentIndex = project.apartments.findIndex(
    apt => apt._id.toString() === apartmentId
  );
  
  if (apartmentIndex === -1) {
    throw new Error('Appartamento non trovato');
  }
  
  // Elimina le immagini da Cloudinary
  const apartment = project.apartments[apartmentIndex];
  if (apartment.images && apartment.images.length > 0) {
    for (const image of apartment.images) {
      if (image.cloudinaryId || image.filename) {
        try {
          await deleteFromCloudinary(image.cloudinaryId || image.filename);
        } catch (error) {
          console.error('Errore eliminazione immagine da Cloudinary:', error);
        }
      }
    }
  }
  
  // Rimuovi l'appartamento
  project.apartments.splice(apartmentIndex, 1);
  project.totalUnits = project.apartments.length;
  
  await project.save();
  
  return standardizeProjectResponse(project.toObject());
};

/**
 * Aggiunge immagini a un appartamento
 * @param {String} projectId - ID del progetto
 * @param {String} apartmentId - ID dell'appartamento
 * @param {Array} files - File da aggiungere
 * @param {Object} metadata - Metadati delle immagini
 * @returns {Promise<Object>} { apartment, project }
 */
const addApartmentImages = async (projectId, apartmentId, files, metadata = {}) => {
  if (!files || files.length === 0) {
    throw new Error('Nessuna immagine caricata');
  }
  
  // Trova il progetto
  const project = await Project.findById(projectId);
  if (!project) {
    throw new Error('Progetto non trovato');
  }
  
  // Trova l'appartamento
  const apartmentIndex = project.apartments.findIndex(
    apt => apt._id.toString() === apartmentId
  );
  
  if (apartmentIndex === -1) {
    throw new Error('Appartamento non trovato');
  }
  
  // Crea array di immagini se non esiste
  if (!project.apartments[apartmentIndex].images) {
    project.apartments[apartmentIndex].images = [];
  }
  
  // Aggiungi le immagini
  files.forEach(file => {
    const imageObject = createImageObject(file, 'apartments', metadata);
    project.apartments[apartmentIndex].images.push(imageObject);
  });
  
  await project.save();
  
  const standardizedProject = standardizeProjectResponse(project.toObject());
  
  return {
    apartment: standardizedProject.apartments[apartmentIndex],
    project: standardizedProject
  };
};

/**
 * Elimina un'immagine da un appartamento
 * @param {String} projectId - ID del progetto
 * @param {String} apartmentId - ID dell'appartamento
 * @param {String} imageId - ID dell'immagine
 * @returns {Promise<Object>} { apartment, project }
 */
const deleteApartmentImage = async (projectId, apartmentId, imageId) => {
  // Trova il progetto
  const project = await Project.findById(projectId);
  if (!project) {
    throw new Error('Progetto non trovato');
  }
  
  // Trova l'appartamento
  const apartmentIndex = project.apartments.findIndex(
    apt => apt._id.toString() === apartmentId
  );
  
  if (apartmentIndex === -1) {
    throw new Error('Appartamento non trovato');
  }
  
  // Verifica che l'appartamento abbia immagini
  if (!project.apartments[apartmentIndex].images || 
      project.apartments[apartmentIndex].images.length === 0) {
    throw new Error('Nessuna immagine trovata per questo appartamento');
  }
  
  // Trova l'immagine
  const imageIndex = project.apartments[apartmentIndex].images.findIndex(
    img => img._id.toString() === imageId
  );
  
  if (imageIndex === -1) {
    throw new Error('Immagine non trovata');
  }
  
  const image = project.apartments[apartmentIndex].images[imageIndex];
  
  // Elimina da Cloudinary
  if (image.cloudinaryId || image.filename) {
    try {
      await deleteFromCloudinary(image.cloudinaryId || image.filename);
    } catch (error) {
      console.error('Errore eliminazione da Cloudinary:', error);
    }
  }
  
  // Rimuovi dall'array
  project.apartments[apartmentIndex].images.splice(imageIndex, 1);
  await project.save();
  
  const standardizedProject = standardizeProjectResponse(project.toObject());
  
  return {
    apartment: standardizedProject.apartments[apartmentIndex],
    project: standardizedProject
  };
};

module.exports = {
  addApartment,
  updateApartment,
  deleteApartment,
  addApartmentImages,
  deleteApartmentImage
};
