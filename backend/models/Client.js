const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Schema per il model Cliente
const ClientSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  external_id: {
    type: String,
    unique: true,
    sparse: true // permette null/undefined
  },
  role: {
    type: String,
    enum: ['admin', 'client'],
    default: 'client'
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

// Aggiorna la data di modifica prima del salvataggio
ClientSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

module.exports = mongoose.model('Client', ClientSchema);
