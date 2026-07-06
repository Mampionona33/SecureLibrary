module.exports = {
  // Note: Si tu utilises React Native 0.73+, le preset est devenu 'module:@react-native/babel-preset'
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./'], // <-- CORRECTION ICI : Pointage à la racine du projet
        extensions: [
          '.ios.js',
          '.android.js',
          '.ios.tsx',
          '.android.tsx',
          '.js',
          '.ts',
          '.tsx',
          '.json'
        ],
        alias: {
          "@api": "./src/api",
          "@assets": "./src/assets",
          "@components": "./src/components",
          "@constants": "./src/constants",
          "@context": "./src/context",
          "@hooks": "./src/hooks",
          "@navigation": "./src/navigation",
          "@screens": "./src/screens",
          "@services": "./src/services",
          "@store": "./src/store",
          "@types/*": ["src/types/*"],
          "@utils": "./src/utils"
        }
      }
    ],
    [
      'module:react-native-dotenv',
      {
        moduleName: '@env',
        path: '.env',
        blacklist: null,
        whitelist: null,
        safe: false,
        allowUndefined: true,
      },
    ],
  ]
};
