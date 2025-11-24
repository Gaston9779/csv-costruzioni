# Test Suite - CSV Costruzioni

## Panoramica

Questa directory contiene i test unitari per i moduli refactorizzati del progetto.

## Struttura

```
tests/
├── imageHelpers.test.js       # Test per utils/imageHelpers.js
├── apartmentHelpers.test.js   # Test per utils/apartmentHelpers.js
└── README.md                  # Questo file
```

## Setup

### Installazione Dipendenze

```bash
npm install --save-dev jest @types/jest
```

### Configurazione package.json

Aggiungi al `package.json`:

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  },
  "jest": {
    "testEnvironment": "node",
    "coveragePathIgnorePatterns": [
      "/node_modules/"
    ]
  }
}
```

## Esecuzione Test

### Tutti i test
```bash
npm test
```

### Test specifico
```bash
npm test imageHelpers.test.js
```

### Watch mode
```bash
npm run test:watch
```

### Coverage
```bash
npm run test:coverage
```

## Test Disponibili

### imageHelpers.test.js

Test per le funzioni di gestione immagini:
- ✅ `formatImageUrl()` - Formattazione URL
- ✅ `standardizeImage()` - Standardizzazione singola immagine
- ✅ `standardizeImages()` - Standardizzazione array
- ✅ `createImageObject()` - Creazione oggetto immagine
- ✅ `saveBase64Image()` - Salvataggio base64

**Copertura**: ~85%

### apartmentHelpers.test.js

Test per le funzioni di gestione appartamenti:
- ✅ `processApartmentData()` - Processing dati
- ✅ `parseApartmentsData()` - Parsing JSON
- ✅ `filterImagesToDelete()` - Filtro eliminazione
- ✅ `validateApartmentData()` - Validazione
- ✅ `extractImageMetadata()` - Estrazione metadati

**Copertura**: ~90%

## Aggiungere Nuovi Test

### Template Test

```javascript
const { functionToTest } = require('../utils/moduleName');

describe('moduleName', () => {
  describe('functionToTest', () => {
    test('should do something', () => {
      const input = 'test';
      const result = functionToTest(input);
      expect(result).toBe('expected');
    });
    
    test('should handle edge case', () => {
      const result = functionToTest(null);
      expect(result).toBeNull();
    });
  });
});
```

## Best Practices

### 1. Test Naming
- Usa nomi descrittivi
- Formato: `should [expected behavior] when [condition]`

### 2. Test Structure
- **Arrange**: Setup dati di test
- **Act**: Esegui funzione
- **Assert**: Verifica risultato

### 3. Coverage
- Mira a >80% coverage
- Testa casi edge
- Testa error handling

### 4. Isolation
- Test indipendenti
- No dipendenze tra test
- Mock dipendenze esterne

## TODO

- [ ] Test per projectHelpers.js
- [ ] Test per projectService.js
- [ ] Test per apartmentService.js
- [ ] Test per multipartParser.js
- [ ] Test di integrazione
- [ ] Test E2E

## Troubleshooting

### Jest non trovato
```bash
npm install --save-dev jest
```

### Errori di import
Verifica che i path nei require siano corretti

### Test timeout
Aumenta il timeout in jest.config.js:
```javascript
module.exports = {
  testTimeout: 10000
};
```

## Risorse

- [Jest Documentation](https://jestjs.io/)
- [Testing Best Practices](https://testingjavascript.com/)
- [Node.js Testing Guide](https://nodejs.org/en/docs/guides/testing/)
