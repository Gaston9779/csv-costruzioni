const {
  processApartmentData,
  parseApartmentsData,
  filterImagesToDelete,
  validateApartmentData,
  extractImageMetadata
} = require('../utils/apartmentHelpers');

describe('apartmentHelpers', () => {
  describe('processApartmentData', () => {
    test('should process apartment with all fields', () => {
      const data = {
        title: 'Appartamento 1',
        description: 'Bellissimo appartamento',
        squareMeters: 80,
        floor: 2,
        bedrooms: 2,
        bathrooms: 1,
        budget: 150000,
        status: 'Completato'
      };
      
      const result = processApartmentData(data, 0);
      
      expect(result.title).toBe('Appartamento 1');
      expect(result.squareMeters).toBe(80);
      expect(result.images).toEqual([]);
    });

    test('should use defaults for missing fields', () => {
      const data = {};
      const result = processApartmentData(data, 5);
      
      expect(result.title).toBe('Appartamento 6');
      expect(result.squareMeters).toBe(0);
      expect(result.status).toBe('In corso');
    });
  });

  describe('parseApartmentsData', () => {
    test('should parse JSON string', () => {
      const json = JSON.stringify([
        { title: 'Apt 1' },
        { title: 'Apt 2' }
      ]);
      
      const result = parseApartmentsData(json);
      expect(result).toHaveLength(2);
      expect(result[0].title).toBe('Apt 1');
    });

    test('should handle array input', () => {
      const array = [
        { title: 'Apt 1' },
        { title: 'Apt 2' }
      ];
      
      const result = parseApartmentsData(array);
      expect(result).toHaveLength(2);
    });

    test('should convert object to array', () => {
      const obj = { title: 'Apt 1' };
      const result = parseApartmentsData(obj);
      
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Apt 1');
    });

    test('should return empty array for null', () => {
      const result = parseApartmentsData(null);
      expect(result).toEqual([]);
    });

    test('should return empty array for invalid JSON', () => {
      const result = parseApartmentsData('invalid json');
      expect(result).toEqual([]);
    });
  });

  describe('filterImagesToDelete', () => {
    test('should filter images by ID', () => {
      const images = [
        { _id: '1', filename: 'img1.jpg' },
        { _id: '2', filename: 'img2.jpg' },
        { _id: '3', filename: 'img3.jpg' }
      ];
      const toDelete = ['2'];
      
      const result = filterImagesToDelete(images, toDelete);
      
      expect(result).toHaveLength(2);
      expect(result.find(img => img._id === '2')).toBeUndefined();
    });

    test('should return all images if no IDs to delete', () => {
      const images = [
        { _id: '1', filename: 'img1.jpg' },
        { _id: '2', filename: 'img2.jpg' }
      ];
      
      const result = filterImagesToDelete(images, []);
      expect(result).toHaveLength(2);
    });

    test('should handle null toDelete', () => {
      const images = [
        { _id: '1', filename: 'img1.jpg' }
      ];
      
      const result = filterImagesToDelete(images, null);
      expect(result).toHaveLength(1);
    });
  });

  describe('validateApartmentData', () => {
    test('should validate correct data', () => {
      const data = {
        title: 'Appartamento 1',
        squareMeters: 80,
        bedrooms: 2,
        bathrooms: 1,
        budget: 150000
      };
      
      const result = validateApartmentData(data);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should reject missing title', () => {
      const data = {
        squareMeters: 80
      };
      
      const result = validateApartmentData(data);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Il titolo dell\'appartamento è obbligatorio');
    });

    test('should reject negative square meters', () => {
      const data = {
        title: 'Appartamento 1',
        squareMeters: -10
      };
      
      const result = validateApartmentData(data);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('I metri quadri non possono essere negativi');
    });

    test('should reject negative bedrooms', () => {
      const data = {
        title: 'Appartamento 1',
        bedrooms: -1
      };
      
      const result = validateApartmentData(data);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Il numero di camere non può essere negativo');
    });

    test('should reject negative budget', () => {
      const data = {
        title: 'Appartamento 1',
        budget: -1000
      };
      
      const result = validateApartmentData(data);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Il budget non può essere negativo');
    });
  });

  describe('extractImageMetadata', () => {
    test('should extract metadata from body', () => {
      const body = {
        apartmentImageMetadata_0: JSON.stringify({ apartmentIndex: 0, description: 'Test' }),
        apartmentImageMetadata_1: JSON.stringify({ apartmentIndex: 1, description: 'Test 2' })
      };
      
      const result = extractImageMetadata(body, 2);
      
      expect(result[0]).toEqual({ apartmentIndex: 0, description: 'Test' });
      expect(result[1]).toEqual({ apartmentIndex: 1, description: 'Test 2' });
    });

    test('should handle missing metadata', () => {
      const body = {};
      const result = extractImageMetadata(body, 2);
      
      expect(Object.keys(result)).toHaveLength(0);
    });

    test('should handle invalid JSON', () => {
      const body = {
        apartmentImageMetadata_0: 'invalid json'
      };
      
      const result = extractImageMetadata(body, 1);
      expect(result[0]).toBeUndefined();
    });
  });
});
