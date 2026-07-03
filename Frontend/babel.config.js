module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
        alias: {
          tests: ['./tests/'],
          "@components": "./src/components",
          "@screens": "./src/screens",
          "@hooks": "./src/hooks",
          "@assets": "./src/assets",
          "@navigation": "./src/navigation",
          "@utils": "./src/utils",
          "@constants": "./src/constants",
          "@services": "./src/services",
          "@store": "./src/store",
          "@context": "./src/context",
          "@api": "./src/api"
        }
      }
    ]
  ]
};

