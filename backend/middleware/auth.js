const jwt = require('jsonwebtoken');
require('dotenv').config();

/**
 * Middleware per verificare il token JWT
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Accesso negato. Token non fornito.' 
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ 
        success: false, 
        message: 'Token non valido o scaduto.' 
      });
    }
    
    req.user = user;
    next();
  });
};

/**
 * Middleware per verificare se l'utente è un admin
 */
const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false, 
      message: 'Accesso negato. Richiesti privilegi di amministratore.' 
    });
  }
  
  next();
};

/**
 * Middleware per verificare se l'utente ha accesso al cliente specificato
 */
const hasClientAccess = (req, res, next) => {
  // Gli admin hanno accesso a tutti i clienti
  if (req.user.role === 'admin') {
    return next();
  }
  
  // Altrimenti, l'utente può accedere solo ai propri dati
  const requestedClientId = req.params.clientId || req.body.clientId;
  
  if (!requestedClientId || !req.user._id.equals(requestedClientId)) {
    return res.status(403).json({ 
      success: false, 
      message: 'Accesso negato. Non hai il permesso di accedere a questi dati.' 
    });
  }
  
  next();
};

module.exports = {
  authenticateToken,
  isAdmin,
  hasClientAccess
};
