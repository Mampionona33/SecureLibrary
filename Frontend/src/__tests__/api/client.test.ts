import axios from 'axios';
import { apiClient } from '@api/client';
import { 
  requestInterceptor, 
  requestErrorInterceptor,
  responseSuccessInterceptor,
  responseInterceptor 
} from '@api/interceptors';

// Mock des dépendances
jest.mock('axios');
jest.mock('../../api/interceptors', () => ({
  requestInterceptor: jest.fn(),
  requestErrorInterceptor: jest.fn(),
  responseSuccessInterceptor: jest.fn(),
  responseInterceptor: jest.fn(),
}));

jest.mock('@env', () => ({
  API_URL: 'https://api.test.com',
}));

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('apiClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Configuration', () => {
    it('should have correct base URL', () => {
      expect(apiClient.defaults.baseURL).toBe('https://api.test.com');
    });

    it('should have correct content-type header', () => {
      expect(apiClient.defaults.headers['Content-Type']).toBe('application/json');
    });

    it('should register request interceptors', () => {
      // Vérifier que les intercepteurs sont bien enregistrés
      expect(apiClient.interceptors.request).toBeDefined();
    });

    it('should register response interceptors', () => {
      expect(apiClient.interceptors.response).toBeDefined();
    });
  });

  describe('Interceptor registration', () => {
    it('should have request interceptor registered', () => {
      // Vérifier que l'intercepteur de requête est enregistré
      const requestInterceptors = (apiClient.interceptors.request as any).handlers || [];
      expect(requestInterceptors.length).toBeGreaterThan(0);
      
      // Vérifier que le premier handler a une fonction fulfilled
      if (requestInterceptors.length > 0) {
        expect(typeof requestInterceptors[0].fulfilled).toBe('function');
        expect(typeof requestInterceptors[0].rejected).toBe('function');
      }
    });

    it('should have response interceptor registered', () => {
      // Vérifier que l'intercepteur de réponse est enregistré
      const responseInterceptors = (apiClient.interceptors.response as any).handlers || [];
      expect(responseInterceptors.length).toBeGreaterThan(0);
      
      // Vérifier que le premier handler a une fonction fulfilled et rejected
      if (responseInterceptors.length > 0) {
        expect(typeof responseInterceptors[0].fulfilled).toBe('function');
        expect(typeof responseInterceptors[0].rejected).toBe('function');
      }
    });
  });

  describe('HTTP methods', () => {
    it('should have get method', () => {
      expect(apiClient.get).toBeDefined();
      expect(typeof apiClient.get).toBe('function');
    });

    it('should have post method', () => {
      expect(apiClient.post).toBeDefined();
      expect(typeof apiClient.post).toBe('function');
    });

    it('should have put method', () => {
      expect(apiClient.put).toBeDefined();
      expect(typeof apiClient.put).toBe('function');
    });

    it('should have delete method', () => {
      expect(apiClient.delete).toBeDefined();
      expect(typeof apiClient.delete).toBe('function');
    });

    it('should have patch method', () => {
      expect(apiClient.patch).toBeDefined();
      expect(typeof apiClient.patch).toBe('function');
    });
  });

  describe('Integration with interceptors', () => {
    it('should use the exported request interceptor', () => {
      // Vérifier que l'intercepteur de requête est bien celui exporté
      const requestInterceptors = (apiClient.interceptors.request as any).handlers || [];
      if (requestInterceptors.length > 0) {
        const fulfilled = requestInterceptors[0].fulfilled;
        // Comparer les noms de fonctions ou leur contenu
        expect(fulfilled.name).toBe('requestInterceptor');
      }
    });

    it('should use the exported request error interceptor', () => {
      const requestInterceptors = (apiClient.interceptors.request as any).handlers || [];
      if (requestInterceptors.length > 0) {
        const rejected = requestInterceptors[0].rejected;
        expect(rejected.name).toBe('requestErrorInterceptor');
      }
    });

    it('should use the exported response success interceptor', () => {
      const responseInterceptors = (apiClient.interceptors.response as any).handlers || [];
      if (responseInterceptors.length > 0) {
        const fulfilled = responseInterceptors[0].fulfilled;
        expect(fulfilled.name).toBe('responseSuccessInterceptor');
      }
    });

    it('should use the exported response error interceptor', () => {
      const responseInterceptors = (apiClient.interceptors.response as any).handlers || [];
      if (responseInterceptors.length > 0) {
        const rejected = responseInterceptors[0].rejected;
        expect(rejected.name).toBe('responseInterceptor');
      }
    });
  });
});
