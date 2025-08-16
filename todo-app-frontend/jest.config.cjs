// jest.config.cjs
module.exports = {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.jsx?$': 'babel-jest',
  },
  moduleFileExtensions: ['js', 'jsx', 'json', 'mjs'],
  moduleDirectories: ['node_modules', 'frontend-src'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  clearMocks: true,
  verbose: true,
  globals: {
    'babel-jest': {
      useESM: true,
    },
  },
};
