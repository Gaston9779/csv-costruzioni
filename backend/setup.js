/**
 * Script di inizializzazione del database MongoDB
 * Crea un utente admin iniziale
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Importa i modelli
const Client = require('./models/Client');

// Connessione a MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log('Connessione a MongoDB riuscita');
  
  try {
    // Verifica se esiste già un admin
    const adminExists = await Client.findOne({ role: 'admin' });
    
    if (adminExists) {
      console.log('Un utente admin esiste già nel sistema');
    } else {
      // Crea l'admin con password criptata
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      
      const admin = new Client({
        name: 'Amministratore',
        email: 'admin@costruzioniviola.it',
        password: hashedPassword,
        role: 'admin'
      });
      
      await admin.save();
      console.log('Utente admin creato con successo');
      console.log('Email: admin@costruzioniviola.it');
      console.log('Password: admin123');
    }
    
    console.log('Setup completato con successo!');
  } catch (error) {
    console.error('Errore durante il setup:', error);
  } finally {
    // Chiude la connessione al termine
    mongoose.disconnect();
  }
})
.catch(err => {
  console.error('Errore di connessione a MongoDB:', err.message);
});
