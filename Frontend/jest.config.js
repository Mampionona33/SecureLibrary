module.exports = {
  // Preset officiel recommandé pour les projets React Native récents
  preset: '@react-native/jest-preset',
  
  // Script exécuté avant chaque fichier de test (mocks globaux, matcher-matchers de Testing Library)
  setupFilesAfterEnv: [
    '@testing-library/jest-native/extend-expect',
    './src/__tests__/setup.ts',
  ],

  // Empêche Jest d'ignorer la transformation Babel des bibliothèques React Native natives
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-native-community|@react-navigation|react-native-mmkv)/)',
  ],

  // Résolution des Alias (doit correspondre à ton tsconfig.json)
  moduleNameMapper: {
    '^@api/(.*)$': '<rootDir>/src/api/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@context/(.*)$': '<rootDir>/src/context/$1',
    '^@services/(.*)$': '<rootDir>/src/services/$1',
    '^@store/(.*)$': '<rootDir>/src/store/$1',
    '^@theme/(.*)$': '<rootDir>/src/theme/$1',
    '^@types/(.*)$': '<rootDir>/src/types/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@storage/(.*)$': '<rootDir>/src/storage/$1',
    '^@tests/(.*)$': '<rootDir>/src/__tests__/$1',
  },

  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

  // Empêche Jest d'aller scanner les fichiers de build Android/iOS
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/android/',
    '<rootDir>/ios/',
  ],

  verbose: true,
};
