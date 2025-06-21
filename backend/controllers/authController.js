const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Client = require('../models/Client');
require('dotenv').config();

/**
 * Controller per la gestione dell'autenticazione
 */
const authController = {
  /**
   * Login per client e admin
   */
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Validazione input
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email e password sono richiesti'
        });
      }

      // Trova l'utente nel database
      const user = await Client.findOne({ email: email.toLowerCase() });

      // Verifica se l'utente esiste
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Credenziali non valide'
        });
      }

      // Confronta la password (prima bcrypt, poi in chiaro per retrocompatibilità)
      let isMatch = false;

      // Se la password salvata è lunga almeno 30 caratteri ed inizia per $2b$ o $2a$ o $2y$ (formato bcrypt), prova bcrypt
      if (typeof user.password === 'string' && user.password.length > 30 && user.password.startsWith('$2')) {
        try {
          isMatch = await bcrypt.compare(password, user.password);
        } catch (err) {
          isMatch = false;
        }
      }
      
      // Se non è un hash bcrypt, fai confronto in chiaro
      if (!isMatch && user.password === password) {
        // Aggiorna la password nel DB con hash bcrypt
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        user.password = hashedPassword;
        await user.save();
        isMatch = true;
      }

      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Credenziali non valide'
        });
      }

      // Genera JWT
      const token = jwt.sign(
        {
          id: user._id,
          email: user.email,
          role: user.role
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      // Risposta
      res.json({
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Errore durante il login:', error);
      res.status(500).json({
        success: false,
        message: "Errore del server durante l'autenticazione"
      });
    }
  },

  /**
   * Cambio password
   */
  changePassword: async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user.id;

      // Validazione input
      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Password corrente e nuova password sono richieste'
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'La nuova password deve essere lunga almeno 6 caratteri'
        });
      }

      // Recupera l'utente dal DB
      const user = await Client.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Utente non trovato'
        });
      }

      // Verifica la password corrente
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'La password corrente non è valida'
        });
      }

      // Hash della nuova password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // Aggiorna nel DB
      user.password = hashedPassword;
      user.updated_at = Date.now();
      await user.save();

      res.json({
        success: true,
        message: 'Password aggiornata con successo'
      });
    } catch (error) {
      console.error('Errore durante il cambio password:', error);
      res.status(500).json({
        success: false,
        message: 'Errore del server durante il cambio password'
      });
    }
  },

  /**
   * Verifica token JWT
   */
  verifyToken: async (req, res) => {
    // Se siamo qui, il middleware di autenticazione ha già validato il token
    res.json({
      success: true,
      user: {
        id: req.user.id,
        email: req.user.email,
        role: req.user.role
      }
    });
  }
};

module.exports = authController;