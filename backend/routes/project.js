const express = require('express');
const router = express.Router();
const { authenticateToken, isAdmin } = require('../middleware/auth');
const projectController = require('../controllers/projectController');
const { uploadProjectImages, uploadApartmentImages } = require('../middleware/uploadCloudinary');

// Route di test
router.get('/test', (req, res) => {
  res.json({ message: 'Project API funzionante' });
});

// Route pubbliche per progetti
router.get('/public', projectController.getPublicProjects);
router.get('/public/:id', projectController.getPublicProject);

// Route admin per progetti
router.get('/admin', authenticateToken, isAdmin, projectController.getAllProjects);
router.get('/admin/stats', authenticateToken, isAdmin, projectController.getProjectStats);
router.post('/admin', authenticateToken, isAdmin, uploadProjectImages.array('images', 10), projectController.createProject);
router.put('/admin/:id', authenticateToken, isAdmin, uploadProjectImages.array('images', 10), projectController.updateProject);
router.delete('/admin/:id', authenticateToken, isAdmin, projectController.deleteProject);
router.delete('/admin/:projectId/images/:imageId', authenticateToken, isAdmin, projectController.deleteProjectImage);

// Nuove route per la gestione degli appartamenti nei progetti multiproprietà
router.post('/admin/:projectId/apartments', authenticateToken, isAdmin, projectController.addApartmentToProject);
router.put('/admin/:projectId/apartments/:apartmentId', authenticateToken, isAdmin, projectController.updateApartment);
router.delete('/admin/:projectId/apartments/:apartmentId', authenticateToken, isAdmin, projectController.deleteApartment);

// Gestione immagini degli appartamenti (manteniamo anche questo endpoint per upload aggiuntivi)
router.post('/admin/:projectId/apartments/:apartmentId/images', authenticateToken, isAdmin, uploadApartmentImages.array('apartmentImages', 10), projectController.addApartmentImages);
router.delete('/admin/:projectId/apartments/:apartmentId/images/:imageId', authenticateToken, isAdmin, projectController.deleteApartmentImage);

module.exports = router;