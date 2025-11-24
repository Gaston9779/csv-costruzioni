const {
  formatImageUrl,
  standardizeImage,
  standardizeImages,
  createImageObject,
  saveBase64Image,
  deleteFile
} = require('../utils/imageHelpers');

describe('imageHelpers', () => {
  describe('formatImageUrl', () => {
    test('should return Cloudinary URL if path starts with http', () => {
      const file = { path: 'https://cloudinary.com/image.jpg', filename: 'test.jpg' };
      const result = formatImageUrl(file, 'projects');
      expect(result).toBe('https://cloudinary.com/image.jpg');
    });

    test('should return local URL if path does not start with http', () => {
      const file = { path: '/local/path/image.jpg', filename: 'test.jpg' };
      const result = formatImageUrl(file, 'projects');
      expect(result).toBe('/uploads/projects/test.jpg');
    });
  });

  describe('standardizeImage', () => {
    test('should handle string ID', () => {
      const result = standardizeImage('123abc', 'apartments');
      expect(result).toEqual({
        _id: '123abc',
        filename: 'apartments_image_123abc.jpg',
        mimetype: 'image/jpeg',
        url: '/uploads/apartments/apartments_image_123abc.jpg',
        description: ''
      });
    });

    test('should handle object with only ID', () => {
      const image = { _id: '123abc' };
      const result = standardizeImage(image, 'apartments');
      expect(result._id).toBe('123abc');
      expect(result.url).toBe('/uploads/apartments/apartments_image_123abc.jpg');
    });

    test('should add URL if missing but filename present', () => {
      const image = { _id: '123', filename: 'test.jpg', mimetype: 'image/jpeg' };
      const result = standardizeImage(image, 'apartments');
      expect(result.url).toBe('/uploads/apartments/test.jpg');
    });

    test('should return null for invalid image', () => {
      const result = standardizeImage(null, 'apartments');
      expect(result).toBeNull();
    });

    test('should preserve existing URL', () => {
      const image = { 
        _id: '123', 
        filename: 'test.jpg', 
        url: 'https://cloudinary.com/test.jpg' 
      };
      const result = standardizeImage(image, 'apartments');
      expect(result.url).toBe('https://cloudinary.com/test.jpg');
    });
  });

  describe('standardizeImages', () => {
    test('should standardize array of images', () => {
      const images = [
        { _id: '1', filename: 'test1.jpg' },
        { _id: '2', filename: 'test2.jpg' }
      ];
      const result = standardizeImages(images, 'projects');
      expect(result).toHaveLength(2);
      expect(result[0].url).toBe('/uploads/projects/test1.jpg');
      expect(result[1].url).toBe('/uploads/projects/test2.jpg');
    });

    test('should return empty array for null input', () => {
      const result = standardizeImages(null, 'projects');
      expect(result).toEqual([]);
    });

    test('should filter out null images', () => {
      const images = [
        { _id: '1', filename: 'test1.jpg' },
        null,
        { _id: '2', filename: 'test2.jpg' }
      ];
      const result = standardizeImages(images, 'projects');
      expect(result).toHaveLength(2);
    });
  });

  describe('createImageObject', () => {
    test('should create complete image object', () => {
      const file = {
        filename: 'test.jpg',
        path: '/path/to/test.jpg',
        size: 1024,
        mimetype: 'image/jpeg',
        originalname: 'original.jpg'
      };
      const metadata = { description: 'Test image' };
      
      const result = createImageObject(file, 'projects', metadata);
      
      expect(result).toHaveProperty('_id');
      expect(result.filename).toBe('test.jpg');
      expect(result.url).toBe('/uploads/projects/test.jpg');
      expect(result.description).toBe('Test image');
    });

    test('should handle Cloudinary URL', () => {
      const file = {
        filename: 'test.jpg',
        path: 'https://cloudinary.com/test.jpg',
        size: 1024,
        mimetype: 'image/jpeg',
        originalname: 'original.jpg'
      };
      
      const result = createImageObject(file, 'projects');
      expect(result.url).toBe('https://cloudinary.com/test.jpg');
    });
  });

  describe('saveBase64Image', () => {
    test('should return null for invalid base64', () => {
      const result = saveBase64Image('invalid-base64', 'apartments', 0);
      expect(result).toBeNull();
    });

    test('should return null for malformed base64', () => {
      const result = saveBase64Image('data:image/jpeg;base64,', 'apartments', 0);
      expect(result).toBeNull();
    });
  });
});
