const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Assicura che la directory uploads esista
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configurazione storage per Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Assicurati che la directory esista ogni volta prima di salvare
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Genera nome file univoco: timestamp + nome originale + random
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const filename = file.fieldname + '-' + uniqueSuffix + ext;
    
    cb(null, filename);
  }
});

// Filtro per i file (PDF, JPG, PNG)
const fileFilter = (req, file, cb) => {
  // Array di MIME types consentiti
  const allowedMimeTypes = [
    'application/pdf',  // PDF
    'image/jpeg',       // JPG/JPEG
    'image/jpg',        // anche JPG (alcune implementazioni usano questo)
    'image/png',        // PNG
    'image/gif'         // GIF
  ];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Solo file PDF, JPG, PNG e GIF sono consentiti'), false);
  }
};

// Limiti di dimensione file
const limits = {
  fileSize: 10 * 1024 * 1024 // 10MB
};

// Configurazione upload
const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: limits
});

module.exports = upload;
