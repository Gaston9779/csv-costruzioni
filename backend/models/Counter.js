const mongoose = require('mongoose');

/**
 * Schema per il contatore di sequenze automatiche
 * Usato per generare ID incrementali per i progetti
 */
const counterSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    unique: true 
  },
  seq: { 
    type: Number, 
    default: 0 
  }
});

module.exports = mongoose.model('Counter', counterSchema);
