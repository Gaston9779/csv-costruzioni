const express = require('express');
const router = express.Router();
const { authenticateToken, isAdmin } = require('../middleware/auth');
const projectController = require('../controllers/projectController');

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
router.post('/admin', authenticateToken, isAdmin, projectController.uploadProjectImages, projectController.createProject);
router.put('/admin/:id', authenticateToken, isAdmin, projectController.uploadProjectImages, projectController.updateProject);
router.delete('/admin/:id', authenticateToken, isAdmin, projectController.deleteProject);
router.delete('/admin/:projectId/images/:imageId', authenticateToken, isAdmin, projectController.deleteProjectImage);

// Nuove route per la gestione degli appartamenti nei progetti multiproprietà
router.post('/admin/:projectId/apartments', authenticateToken, isAdmin, projectController.addApartmentToProject);
router.put('/admin/:projectId/apartments/:apartmentId', authenticateToken, isAdmin, projectController.updateApartment);
router.delete('/admin/:projectId/apartments/:apartmentId', authenticateToken, isAdmin, projectController.deleteApartment);

// Gestione immagini degli appartamenti
router.post('/admin/:projectId/apartments/:apartmentId/images', authenticateToken, isAdmin, projectController.uploadApartmentImages, projectController.addApartmentImages);
router.delete('/admin/:projectId/apartments/:apartmentId/images/:imageId', authenticateToken, isAdmin, projectController.deleteApartmentImage);

module.exports = router;