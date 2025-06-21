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

// Route admin temporanee
router.get('/admin', authenticateToken, isAdmin, projectController.getAllProjects);
router.get('/admin/stats', authenticateToken, isAdmin, projectController.getProjectStats);
router.post('/admin', authenticateToken, isAdmin, projectController.createProject);
router.put('/admin/:id', authenticateToken, isAdmin, projectController.updateProject);
router.delete('/admin/:id', authenticateToken, isAdmin, projectController.deleteProject);
router.delete('/admin/:projectId/images/:imageId', authenticateToken, isAdmin, projectController.deleteProjectImage);

module.exports = router;