module.exports = {
  collectCoverageFrom: ['src/**/*.js', '!src/{index,types}.js'],
  rootDir: process.cwd(),
  setupFiles: ['@babel/polyfill'],
  testEnvironment: 'node',
  testMatch: ['**/*.test.js'],
};
