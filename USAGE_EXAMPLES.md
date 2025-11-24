# Esempi di Utilizzo - Moduli Refactorizzati

## Panoramica

Questa guida mostra come utilizzare i nuovi moduli helper e services nel progetto.

## 1. Image Helpers

### Standardizzare un'immagine

```javascript
const { standardizeImage } = require('./utils/imageHelpers');

// Immagine con solo ID
const image = { _id: '507f1f77bcf86cd799439011' };
const standardized = standardizeImage(image, 'apartments');

console.log(standardized);
// {
//   _id: '507f1f77bcf86cd799439011',
//   filename: 'apartments_image_507f1f77bcf86cd799439011.jpg',
//   mimetype: 'image/jpeg',
//   url: '/uploads/apartments/apartments_image_507f1f77bcf86cd799439011.jpg',
//   description: ''
// }
```

### Standardizzare array di immagini

```javascript
const { standardizeImages } = require('./utils/imageHelpers');

const images = [
  { _id: '1', filename: 'img1.jpg' },
  { _id: '2', filename: 'img2.jpg' }
];

const standardized = standardizeImages(images, 'projects');
// Tutte le immagini avranno URL completi
```

### Creare oggetto immagine da file

```javascript
const { createImageObject } = require('./utils/imageHelpers');

const file = {
  filename: 'uploaded-image.jpg',
  path: '/tmp/uploaded-image.jpg',
  size: 102400,
  mimetype: 'image/jpeg',
  originalname: 'my-photo.jpg'
};

const metadata = { description: 'Foto del soggiorno' };

const imageObject = createImageObject(file, 'apartments', metadata);
// Oggetto immagine completo con tutti i campi necessari
```

## 2. Apartment Helpers

### Processare dati appartamento

```javascript
const { processApartmentData } = require('./utils/apartmentHelpers');

const rawData = {
  title: 'Appartamento Vista Mare',
  squareMeters: 85,
  bedrooms: 2,
  bathrooms: 1
};

const apartment = processApartmentData(rawData, 0);
// Appartamento con tutti i campi inizializzati
```

### Validare dati appartamento

```javascript
const { validateApartmentData } = require('./utils/apartmentHelpers');

const apartmentData = {
  title: 'Appartamento 1',
  squareMeters: 80,
  bedrooms: 2,
  budget: 150000
};

const validation = validateApartmentData(apartmentData);

if (validation.valid) {
  console.log('Dati validi!');
} else {
  console.error('Errori:', validation.errors);
}
```

### Parsare JSON appartamenti

```javascript
const { parseApartmentsData } = require('./utils/apartmentHelpers');

// Da stringa JSON
const jsonString = '[{"title":"Apt 1"},{"title":"Apt 2"}]';
const apartments = parseApartmentsData(jsonString);

// Da array
const array = [{ title: 'Apt 1' }, { title: 'Apt 2' }];
const apartments2 = parseApartmentsData(array);

// Da oggetto singolo
const single = { title: 'Apt 1' };
const apartments3 = parseApartmentsData(single);
// Risultato: array con un elemento
```

## 3. Project Helpers

### Preparare dati progetto

```javascript
const { prepareProjectData } = require('./utils/projectHelpers');

const body = {
  title: 'Residenza Bella Vista',
  description: 'Complesso residenziale moderno',
  category: 'Residenziale',
  projectType: 'Multiproprietà',
  budget: 500000,
  visible: 'true'
};

const user = { id: '507f1f77bcf86cd799439011' };

const projectData = prepareProjectData(body, user, false);
// Dati pronti per la creazione del progetto
```

### Validare dati progetto

```javascript
const { validateProjectData } = require('./utils/projectHelpers');

const projectData = {
  title: 'Nuovo Progetto',
  category: 'Residenziale',
  budget: 300000
};

const validation = validateProjectData(projectData);

if (!validation.valid) {
  return res.status(400).json({
    success: false,
    errors: validation.errors
  });
}
```

### Costruire filtri per query

```javascript
const { buildProjectFilter } = require('./utils/projectHelpers');

const query = {
  category: 'Residenziale',
  status: 'In corso',
  featured: 'true'
};

const filter = buildProjectFilter(query, true);
// { visible: true, category: 'Residenziale', status: 'In corso', featured: true }
```

### Calcolare paginazione

```javascript
const { calculatePagination } = require('./utils/projectHelpers');

const page = 2;
const limit = 10;
const total = 45;

const pagination = calculatePagination(page, limit, total);
// {
//   page: 2,
//   limit: 10,
//   total: 45,
//   pages: 5,
//   hasNext: true,
//   hasPrev: true
// }
```

## 4. Project Service

### Creare un progetto

```javascript
const projectService = require('./services/projectService');

const data = {
  title: 'Residenza Verde',
  description: 'Progetto residenziale',
  category: 'Residenziale',
  projectType: 'Singola',
  budget: 250000
};

const user = { id: '507f1f77bcf86cd799439011' };
const files = []; // File caricati

try {
  const project = await projectService.createProject(data, user, files);
  console.log('Progetto creato:', project);
} catch (error) {
  console.error('Errore:', error.message);
}
```

### Recuperare progetti con filtri

```javascript
const projectService = require('./services/projectService');

const query = {
  category: 'Residenziale',
  page: 1,
  limit: 10,
  sort: 'featured'
};

const { projects, pagination } = await projectService.getProjects(query, true);

console.log(`Trovati ${projects.length} progetti`);
console.log(`Pagina ${pagination.page} di ${pagination.pages}`);
```

### Aggiornare un progetto

```javascript
const projectService = require('./services/projectService');

const projectId = '507f1f77bcf86cd799439011';
const updateData = {
  title: 'Titolo Aggiornato',
  status: 'Completato'
};

const project = await projectService.updateProject(projectId, updateData, []);
console.log('Progetto aggiornato:', project);
```

## 5. Apartment Service

### Aggiungere appartamento

```javascript
const apartmentService = require('./services/apartmentService');

const projectId = '507f1f77bcf86cd799439011';
const apartmentData = {
  title: 'Appartamento 1',
  squareMeters: 80,
  bedrooms: 2,
  bathrooms: 1,
  budget: 150000
};

const { apartment, project } = await apartmentService.addApartment(
  projectId,
  apartmentData,
  []
);

console.log('Appartamento aggiunto:', apartment);
```

### Aggiornare appartamento

```javascript
const apartmentService = require('./services/apartmentService');

const projectId = '507f1f77bcf86cd799439011';
const apartmentId = '507f1f77bcf86cd799439012';
const updateData = {
  title: 'Appartamento Rinnovato',
  status: 'Completato'
};

const { apartment, project } = await apartmentService.updateApartment(
  projectId,
  apartmentId,
  updateData,
  []
);
```

### Aggiungere immagini ad appartamento

```javascript
const apartmentService = require('./services/apartmentService');

const projectId = '507f1f77bcf86cd799439011';
const apartmentId = '507f1f77bcf86cd799439012';
const files = [
  // File caricati da multer
];

const { apartment, project } = await apartmentService.addApartmentImages(
  projectId,
  apartmentId,
  files,
  { description: 'Foto del soggiorno' }
);
```

## 6. Multipart Parser

### Usare il middleware

```javascript
const { multipartMiddleware } = require('./services/multipartParser');

// In una route Express
router.post('/projects', 
  multipartMiddleware(true), // true = upload su Cloudinary
  async (req, res) => {
    // req.body contiene i campi
    // req.files contiene i file (già su Cloudinary)
    console.log('Campi:', req.body);
    console.log('File:', req.files);
  }
);
```

### Parsing manuale

```javascript
const { parseMultipartRequest } = require('./services/multipartParser');

async function handleUpload(req, res) {
  try {
    const { fields, files } = await parseMultipartRequest(req, true);
    
    console.log('Campi ricevuti:', fields);
    console.log('File caricati:', files);
    
    // Processa i dati
  } catch (error) {
    console.error('Errore parsing:', error);
  }
}
```

## 7. Controller Refactorizzato

### Usare il nuovo controller

```javascript
// In routes/projects.js
const projectController = require('../controllers/projectController.refactored');

// Route pubbliche
router.get('/public', projectController.getPublicProjects);
router.get('/public/:id', projectController.getPublicProject);

// Route admin (con autenticazione)
router.post('/', auth, projectController.createProject);
router.put('/:id', auth, projectController.updateProject);
router.delete('/:id', auth, projectController.deleteProject);

// Appartamenti
router.post('/:projectId/apartments', auth, projectController.addApartmentToProject);
router.put('/:projectId/apartments/:apartmentId', auth, projectController.updateApartment);
router.delete('/:projectId/apartments/:apartmentId', auth, projectController.deleteApartment);
```

## 8. Esempi Completi

### Creare progetto con appartamenti

```javascript
const projectService = require('./services/projectService');

const projectData = {
  title: 'Residenza Bella Vista',
  projectType: 'Multiproprietà',
  apartments: JSON.stringify([
    {
      title: 'Appartamento 1',
      squareMeters: 80,
      bedrooms: 2
    },
    {
      title: 'Appartamento 2',
      squareMeters: 95,
      bedrooms: 3
    }
  ])
};

const user = { id: 'userId' };
const files = []; // File caricati

const project = await projectService.createProject(projectData, user, files);
console.log(`Progetto creato con ${project.apartments.length} appartamenti`);
```

### Gestire upload immagini

```javascript
const { multipartMiddleware } = require('./services/multipartParser');
const apartmentService = require('./services/apartmentService');

router.post('/:projectId/apartments/:apartmentId/images',
  multipartMiddleware(true),
  async (req, res) => {
    try {
      const { projectId, apartmentId } = req.params;
      
      const { apartment, project } = await apartmentService.addApartmentImages(
        projectId,
        apartmentId,
        req.files,
        req.body
      );
      
      res.json({
        success: true,
        message: 'Immagini aggiunte',
        apartment
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
);
```

## Best Practices

### 1. Gestione Errori

```javascript
try {
  const project = await projectService.createProject(data, user, files);
  res.json({ success: true, project });
} catch (error) {
  console.error('Errore:', error);
  
  const statusCode = error.message.includes('non trovato') ? 404 : 500;
  
  res.status(statusCode).json({
    success: false,
    message: error.message
  });
}
```

### 2. Validazione Input

```javascript
const { validateProjectData } = require('./utils/projectHelpers');

const validation = validateProjectData(req.body);
if (!validation.valid) {
  return res.status(400).json({
    success: false,
    errors: validation.errors
  });
}
```

### 3. Standardizzazione Risposte

```javascript
const { standardizeProjectResponse } = require('./utils/projectHelpers');

const project = await Project.findById(id).lean();
const standardized = standardizeProjectResponse(project);

res.json({
  success: true,
  project: standardized
});
```

## Troubleshooting

### Problema: Module not found
```javascript
// Verifica il path relativo
const helper = require('../utils/imageHelpers');
```

### Problema: Immagini senza URL
```javascript
// Usa sempre standardizeProjectResponse
const standardized = standardizeProjectResponse(project);
```

### Problema: Validazione fallita
```javascript
// Controlla i messaggi di errore
const validation = validateProjectData(data);
console.log('Errori:', validation.errors);
```
