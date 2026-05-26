/** @type {import('jest').Config} */
module.exports = {
    testEnvironment: 'node',
    testMatch: ['**/__tests__/**/*.test.js'],
    coverageDirectory: 'coverage',
    collectCoverageFrom: [
      'src/**/*.js',
      '!src/config/**',
      '!**/node_modules/**',
    ],
    // Give each test file 15s — auth tests hit DB
    testTimeout: 15000,
    verbose: true,
  };