import axios from 'axios';
import { 
  requestInterceptor, 
  requestErrorInterceptor,
  responseSuccessInterceptor,
  responseInterceptor 
} from './interceptors';
import { 
  MAIN_API_BASE_URL,
  API_TIMEOUT,
  API_MAX_CONTENT_LENGTH,
  API_MAX_BODY_LENGTH
} from './config';  // ✅ Import depuis config

export const apiClient = axios.create({
  baseURL: MAIN_API_BASE_URL,  // ✅ De config
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: API_TIMEOUT,  // ✅ De config
  maxContentLength: API_MAX_CONTENT_LENGTH,  // ✅ De config
  maxBodyLength: API_MAX_BODY_LENGTH,  // ✅ De config
});

// Utiliser les intercepteurs exportés
apiClient.interceptors.request.use(
  requestInterceptor,
  requestErrorInterceptor
);

apiClient.interceptors.response.use(
  responseSuccessInterceptor,
  responseInterceptor
);
