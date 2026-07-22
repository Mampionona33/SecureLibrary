import axios from 'axios';
import { API_URL } from '@env';
import { 
  requestInterceptor, 
  requestErrorInterceptor,
  responseSuccessInterceptor,
  responseInterceptor 
} from './interceptors';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 300000, // ⏱️ 60 secondes pour les gros fichiers
  maxContentLength: 50 * 1024 * 1024, // 50MB
  maxBodyLength: 50 * 1024 * 1024, // 50MB
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
