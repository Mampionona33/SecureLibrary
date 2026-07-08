module.exports = {
  presets: [
    'module:@react-native/babel-preset',
  ],

  plugins: [
    [
      'module-resolver',
      {
        root: ['./'],

        extensions: [
          '.ios.js',
          '.android.js',
          '.ios.ts',
          '.android.ts',
          '.ios.tsx',
          '.android.tsx',
          '.js',
          '.ts',
          '.tsx',
          '.json',
        ],

        alias: {
          '@api': './src/api',
          '@storage': './src/storage',
          '@assets': './src/assets',
          '@theme': './src/theme',
          '@components': './src/components',
          '@constants': './src/constants',
          '@context': './src/context',
          '@hooks': './src/hooks',
          '@navigation': './src/navigation',
          '@screens': './src/screens',
          '@services': './src/services',
          '@store': './src/store',
          '@utils': './src/utils',
          '@types': './src/types',
          '@tests': './src/__tests__',
        },
      },
    ],

    [
      'module:react-native-dotenv',
      {
        moduleName: '@env',
        path: '.env',
        safe: false,
        allowUndefined: true,
      },
    ],
  ],
};
