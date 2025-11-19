const mongoose = require('mongoose');
require('dotenv').config();

// Connessione a MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout più aggressivo
      socketTimeoutMS: 45000,
      maxPoolSize: 10, // Pool di connessioni
      minPoolSize: 2
    });
    console.log('MongoDB connesso con successo');
  } catch (error) {
    console.error('Errore connessione MongoDB:', error);
    process.exit(1);
  }
};

connectDB();

module.exports = mongoose;
