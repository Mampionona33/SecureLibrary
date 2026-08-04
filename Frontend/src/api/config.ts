import { API_URL } from '@env';

const DEFAULT_BASE_URL = __DEV__
  ? 'http://192.168.201.144:8000/api'           // DEV
  : 'https://honest-camels-stand.loca.lt/api';  // RELEASE

export const MAIN_API_BASE_URL = API_URL || DEFAULT_BASE_URL;

export const API_TIMEOUT = 300000;
export const API_MAX_CONTENT_LENGTH = 50 * 1024 * 1024;
export const API_MAX_BODY_LENGTH = 50 * 1024 * 1024;

// ✅ Debug
if (__DEV__) {
  console.log('[Config] Mode: DEV');
  console.log('[Config] API_URL from @env:', API_URL);
  console.log('[Config] MAIN_API_BASE_URL:', MAIN_API_BASE_URL);
} else {
  console.warn('[Config] Mode: RELEASE');
  console.warn('[Config] MAIN_API_BASE_URL:', MAIN_API_BASE_URL);
}

// ✅ Vérifier que ce n'est pas `undefined`
if (!MAIN_API_BASE_URL || MAIN_API_BASE_URL === 'undefined') {
  throw new Error('❌ MAIN_API_BASE_URL is not defined!');
}
