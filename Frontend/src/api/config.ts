import { API_URL } from '@env';

// ✅ Utiliser directement API_URL du .env
export const MAIN_API_BASE_URL = API_URL;

export const API_TIMEOUT = 300000;
export const API_MAX_CONTENT_LENGTH = 50 * 1024 * 1024;
export const API_MAX_BODY_LENGTH = 50 * 1024 * 1024;

// ✅ Debug
console.log('[Config] MAIN_API_BASE_URL:', MAIN_API_BASE_URL);

// ✅ Vérification
if (!MAIN_API_BASE_URL || MAIN_API_BASE_URL === 'undefined') {
  throw new Error('❌ MAIN_API_BASE_URL is not defined!');
}
