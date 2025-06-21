const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

/**
 * @route   POST /api/auth/login
 * @desc    Login per client e admin
 * @access  Direzionale
 */
router.post('/login', authController.login);

/**
 * @route   POST /api/auth/change-password
 * @desc    Cambio password
 * @access  Protetto
 */
router.post('/change-password', authenticateToken, authController.changePassword);

/**
 * @route   GET /api/auth/verify
 * @desc    Verifica token JWT
 * @access  Protetto
 */
router.get('/verify', authenticateToken, authController.verifyToken);

module.exports = router;
