/* eslint-disable no-undef */
module.exports = {
  moduleFileExtensions: ['js', 'jsx'],
  moduleNameMapper: {
    '\\.(css|sass|scss|jpg)$': 'jest-transform-stub',
    'typeface-*': 'jest-transform-stub',
  },
  transformIgnorePatterns: ['<rootDir>/node_modules/'],
}
