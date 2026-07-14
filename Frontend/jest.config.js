module.exports = {
  preset: '@react-native/jest-preset',
  testEnvironmentOptions: {
    IS_REACT_ACT_ENVIRONMENT: true,
  },
  setupFilesAfterEnv: [
    '@testing-library/react-native/setup',
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
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@storage/(.*)$': '<rootDir>/src/storage/$1',
    '^@env$': '<rootDir>/__mocks__/@env.js',
  },
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/android/',
    '<rootDir>/ios/',
  ],
  collectCoverage: false,  // Off by default
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.styles.ts',
    '!src/**/*.test.tsx',
    '!src/__tests__/**',
    '!src/types/**',
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
  ],
  coverageReporters: ['text', 'lcov', 'html', 'json-summary'],
  coverageDirectory: '<rootDir>/coverage',
  coverageThreshold: null, // ← ADD THIS LINE to disable thresholds
  verbose: true,
}
