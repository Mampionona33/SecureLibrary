export const MAIN_API_BASE_URL = __DEV__
  ? 'http://192.168.10.102:8000/api'  // ✅ Votre IP locale
  : process.env.MAIN_API_BASE_URL || 'http://192.168.10.102:8000/api';

export const API_TIMEOUT = 300000;
export const API_MAX_CONTENT_LENGTH = 50 * 1024 * 1024;
export const API_MAX_BODY_LENGTH = 50 * 1024 * 1024;
