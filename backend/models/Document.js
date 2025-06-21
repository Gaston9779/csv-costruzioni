const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Schema per il model Documento
const DocumentSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  file_path: {
    type: String,
    required: true
  },
  file_name: {
    type: String,
    required: true
  },
  file_type: {
    type: String,
    required: true
  },
  file_size: {
    type: Number,
    required: true
  },
  client: {
    type: Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  },
  project: {
    type: Schema.Types.ObjectId,
    ref: 'Project'
  },
  uploaded_by: {
    type: Schema.Types.ObjectId,
    ref: 'Client'
  },
  uploaded_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Document', DocumentSchema);
