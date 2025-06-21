const mongoose = require('mongoose');
require('dotenv').config();

// Connessione a MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connesso con successo'))
.catch(err => {
  console.error('Errore di connessione a MongoDB:', err.message);
  process.exit(1); // Esce dall'applicazione se non può connettersi al database
});

module.exports = mongoose;
