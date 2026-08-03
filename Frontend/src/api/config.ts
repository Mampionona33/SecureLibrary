export const MAIN_API_BASE_URL = __DEV__
  ? 'http://192.168.10.102:8000/api'  // ✅ Votre IP locale pour le développement
  : ' https://honest-camels-stand.loca.lt/api';  // ✅ URL Localtunnel pour la release

export const API_TIMEOUT = 300000;
export const API_MAX_CONTENT_LENGTH = 50 * 1024 * 1024;
export const API_MAX_BODY_LENGTH = 50 * 1024 * 1024;

// ✅ Logs pour vérifier quelle URL est utilisée
console.log('[Config] __DEV__:', __DEV__);
console.log('[Config] MAIN_API_BASE_URL:', MAIN_API_BASE_URL);
