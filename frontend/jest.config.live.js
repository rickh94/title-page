const commonConfig = require('./jest.config.common')

module.exports = {
  ...commonConfig,
  testPathIgnorePatterns: ['/node_modules/', '/__tests__/']
}
