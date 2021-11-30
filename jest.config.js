/*
 * For a detailed explanation regarding each configuration property and type check, visit:
 * https://jestjs.io/docs/configuration
 */

const config = {
  // The root directory that Jest should scan for tests and modules within
  rootDir: 'src',

  // Indicates whether the coverage information should be collected while executing the test
  // collectCoverage: true,

  // The directory where Jest should output its coverage files
  coverageDirectory: '../coverage',

  collectCoverageFrom: ['**/*.{js,jsx,ts,tsx}', '!**/*.d.ts'],

  coveragePathIgnorePatterns: ['/__tests__/', '/__mocks__/', '/mocks/'],

  // A map from regular expressions to module names or to arrays of module names that allow to stub out resources with a single module
  moduleNameMapper: {
    '\\.(css)$': 'identity-obj-proxy',
  },

  // A list of paths to modules that run some code to configure or set up the testing framework before each test
  setupFilesAfterEnv: ['./jest.setup.js'],

  // The test environment that will be used for testing
  testEnvironment: 'jsdom',

  // A map from regular expressions to paths to transformers
  // transform: { '^.+\\.(j|t)sx?$': 'babel-jest' },

  // Indicates whether each individual test should be reported during the run
  verbose: true,
};

module.exports = config;
