const mongoose = require('mongoose');

const apartmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String
  },
  squareMeters: {
    type: Number
  },
  floor: {
    type: Number
  },
  bedrooms: {
    type: Number
  },
  bathrooms: {
    type: Number
  },
  budget: {
    type: Number
  },
  images: [{
    filename: String,
    path: String,
    originalName: String
  }],
  status: {
    type: String,
    enum: ['In corso', 'Completato', 'In pausa', 'Pianificato'],
    default: 'Pianificato'
  }
}, { _id: true });

const projectSchema = new mongoose.Schema({
  projectId: {
    type: Number,
    unique: true,
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: false
  },
  projectType: {
    type: String,
    required: true,
    enum: ['Singola', 'Multiproprietà'],
    default: 'Singola'
  },
  category: {
    type: String,
    required: false,
    enum: ['Residenziale', 'Commerciale', 'Produttivo', 'Direzionale', 'Altro']
  },
  images: [{
    filename: String,
    path: String,
    originalName: String
  }],
  status: {
    type: String,
    enum: ['In corso', 'Completato', 'In pausa', 'Pianificato'],
    default: 'Pianificato'
  },
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client'
  },
  location: {
    type: String
  },
  budget: {
    type: Number
  },
  // Nuovo campo per gli appartamenti (solo per multiproprietà)
  apartments: [apartmentSchema],
  totalUnits: {
    type: Number,
    default: 1
  },
  featured: {
    type: Boolean,
    default: false
  },
  visible: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Aggiungiamo un middleware pre-save per gestire l'auto-incremento dell'ID
projectSchema.pre('save', async function(next) {
  // Se il documento è nuovo (non ha projectId)
  if (this.isNew && this.projectId == undefined) {
    try {
      // Troviamo il progetto con il più alto projectId
      const highestProject = await this.constructor.findOne().sort('-projectId');
      
      // Se esiste, incrementiamo di 1, altrimenti iniziamo da 1
      this.projectId = highestProject && highestProject.projectId ? highestProject.projectId + 1 : 1;
      
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

// Indici per migliorare le performance
projectSchema.index({ category: 1 });
projectSchema.index({ status: 1 });
projectSchema.index({ featured: 1 });
projectSchema.index({ visible: 1 });
projectSchema.index({ projectId: 1 });
projectSchema.index({ projectType: 1 });

// Assicura che i campi projectType e apartments siano sempre disponibili
projectSchema.set('toJSON', { 
  virtuals: true,
  transform: function(doc, ret) {
    // Assicurati che projectType sia sempre presente
    if (!ret.projectType) {
      console.log(`FIX: Aggiungo projectType mancante al progetto ${ret._id}`);
      ret.projectType = 'Singola';
    }
    
    // Assicurati che apartments sia sempre un array
    if (!ret.apartments) {
      console.log(`FIX: Aggiungo apartments mancante al progetto ${ret._id}`);
      ret.apartments = [];
    }
    
    return ret;
  }
});

// Imposta toObject per essere consistente con toJSON
projectSchema.set('toObject', { 
  virtuals: true,
  transform: function(doc, ret) {
    // Assicurati che projectType sia sempre presente
    if (!ret.projectType) {
      ret.projectType = 'Singola';
    }
    
    // Assicurati che apartments sia sempre un array
    if (!ret.apartments) {
      ret.apartments = [];
    }
    
    return ret;
  }
});

module.exports = mongoose.model('Project', projectSchema);
