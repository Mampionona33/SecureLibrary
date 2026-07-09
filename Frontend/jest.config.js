module.exports = {
  preset: '@react-native/jest-preset',
  testEnvironment: 'node',

  setupFilesAfterEnv: [
    '<rootDir>/jest.setup.js',
  ],

  transformIgnorePatterns: [
    'node_modules/(?!(' +
      'react-native' +
      '|@react-native' +
      '|@react-navigation' +
      '|@react-native-async-storage' +
      '|react-native-mmkv' +
      '|react-native-keychain' +
      '|react-native-pdf' +
      '|react-native-blob-util' +
      ')/)',
  ],

  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@api/(.*)$': '<rootDir>/src/api/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@context/(.*)$': '<rootDir>/src/context/$1',
    '^@services/(.*)$': '<rootDir>/src/services/$1',
    '^@store/(.*)$': '<rootDir>/src/store/$1',
    '^@theme/(.*)$': '<rootDir>/src/theme/$1',
    '^@types/(.*)$': '<rootDir>/src/types/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',  // ← test-utils est ici
    '^@storage/(.*)$': '<rootDir>/src/storage/$1',
    '^@env$': '<rootDir>/__mocks__/@env.js',
  },

  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/android/',
    '<rootDir>/ios/',
  ],

  verbose: true,
};
