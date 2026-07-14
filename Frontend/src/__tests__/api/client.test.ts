// __tests__/api/client.test.ts
import axios from 'axios';

// Mock d'axios
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    defaults: {
      baseURL: 'http://127.0.0.1:8000/api',
      headers: {
        'Content-Type': 'application/json',
      },
    },
    interceptors: {
      request: {
        use: jest.fn(),
      },
      response: {
        use: jest.fn(),
      },
    },
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    patch: jest.fn(),
  })),
}));

// Mock de @env
jest.mock('@env', () => ({
  API_URL: 'http://127.0.0.1:8000/api',
}));

// Mock des intercepteurs
jest.mock('@api/interceptors', () => ({
  requestInterceptor: jest.fn(),
  requestErrorInterceptor: jest.fn(),
  responseSuccessInterceptor: jest.fn(),
  responseInterceptor: jest.fn(),
}));

// Importer le module
import { apiClient } from '@api/client';

describe('apiClient', () => {
  it('should have correct base URL', () => {
    expect(apiClient.defaults.baseURL).toBe('http://127.0.0.1:8000/api');
  });

  it('should have correct content-type header', () => {
    expect(apiClient.defaults.headers['Content-Type']).toBe('application/json');
  });

  it('should have HTTP methods', () => {
    expect(apiClient.get).toBeDefined();
    expect(apiClient.post).toBeDefined();
    expect(apiClient.put).toBeDefined();
    expect(apiClient.delete).toBeDefined();
    expect(apiClient.patch).toBeDefined();
  });

  it('should have interceptors', () => {
    expect(apiClient.interceptors.request).toBeDefined();
    expect(apiClient.interceptors.response).toBeDefined();
  });

  it('should call axios.create with correct config', () => {
    expect(axios.create).toHaveBeenCalledWith({
      baseURL: 'http://127.0.0.1:8000/api',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  });
});
