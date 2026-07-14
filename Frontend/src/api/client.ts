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
