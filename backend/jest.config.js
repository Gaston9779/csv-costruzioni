module.exports = {
  // Ambiente di test
  testEnvironment: 'node',
  
  // Pattern per trovare i file di test
  testMatch: [
    '**/tests/**/*.test.js',
    '**/__tests__/**/*.js'
  ],
  
  // Directory da ignorare
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/build/'
  ],
  
  // Coverage
  collectCoverageFrom: [
    'utils/**/*.js',
    'services/**/*.js',
    'controllers/**/*.js',
    '!**/node_modules/**',
    '!**/tests/**',
    '!**/coverage/**'
  ],
  
  // Threshold di coverage
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  
  // Reporter per coverage
  coverageReporters: [
    'text',
    'text-summary',
    'html',
    'lcov'
  ],
  
  // Timeout per i test (in ms)
  testTimeout: 10000,
  
  // Verbose output
  verbose: true,
  
  // Setup files
  // setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  
  // Transform
  // transform: {},
  
  // Module paths
  moduleDirectories: [
    'node_modules',
    'utils',
    'services'
  ],
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Restore mocks between tests
  restoreMocks: true,
  
  // Reset mocks between tests
  resetMocks: true
};
