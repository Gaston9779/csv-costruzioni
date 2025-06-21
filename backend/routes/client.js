const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const { authenticateToken } = require('../middleware/auth');

// Middleware che verifica l'autenticazione per tutte le rotte
router.use(authenticateToken);

/**
 * @route   GET /api/client/profile
 * @desc    Ottiene il profilo del cliente
 * @access  Autenticato (client)
 */
router.get('/profile', clientController.getProfile);

/**
 * @route   GET /api/client/projects
 * @desc    Ottiene i progetti del cliente
 * @access  Autenticato (client)
 */
router.get('/projects', clientController.getProjects);

/**
 * @route   GET /api/client/documents
 * @desc    Ottiene i documenti del cliente
 * @access  Autenticato (client)
 */
router.get('/documents', clientController.getDocuments);

/**
 * @route   GET /api/client/documents/stats
 * @desc    Ottiene statistiche sui documenti del cliente
 * @access  Autenticato (client)
 */
router.get('/documents/stats', clientController.getDocumentStats);

/**
 * @route   GET /api/client/documents/:documentId/download
 * @desc    Scarica un documento specifico
 * @access  Autenticato (client)
 */
router.get('/documents/:documentId/download', clientController.downloadDocument);

module.exports = router;
