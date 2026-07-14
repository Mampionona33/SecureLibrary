// __tests__/api/client.test.ts

// Step 1: Create mock functions for interceptor.use calls
const mockRequestUse = jest.fn().mockReturnValue(0);
const mockResponseUse = jest.fn().mockReturnValue(0);

// Step 2: Create the mock axios instance structure
const mockAxiosInstance = {
  defaults: {
    baseURL: 'http://127.0.0.1:8000/api',
    headers: {
      'Content-Type': 'application/json',
    },
  },
  interceptors: {
    request: {
      use: mockRequestUse,
      eject: jest.fn(),
    },
    response: {
      use: mockResponseUse,
      eject: jest.fn(),
    },
  },
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  patch: jest.fn(),
};

// Step 3: Mock axios - simple factory
jest.mock('axios');

// Step 4: Mock @env
jest.mock('@env', () => ({
  API_URL: 'http://127.0.0.1:8000/api',
}));

// Step 5: Mock interceptors
jest.mock('@api/interceptors', () => ({
  requestInterceptor: jest.fn((config) => config),
  requestErrorInterceptor: jest.fn((error) => Promise.reject(error)),
  responseSuccessInterceptor: jest.fn((response) => response),
  responseInterceptor: jest.fn((error) => Promise.reject(error)),
}));

// Step 6: NOW import and configure the mock
import axios from 'axios';

// Configure axios mock to return our instance when .create() is called
(axios.create as jest.Mock) = jest.fn(() => mockAxiosInstance);

// Step 7: NOW safe to import client
import { apiClient } from '@api/client';
import { 
  requestInterceptor, 
  requestErrorInterceptor,
  responseSuccessInterceptor,
  responseInterceptor 
} from '@api/interceptors';

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('apiClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequestUse.mockClear();
    mockResponseUse.mockClear();
  });

  describe('Configuration', () => {
    it('should have correct base URL', () => {
      expect(apiClient.defaults.baseURL).toBe('http://127.0.0.1:8000/api');
    });

    it('should have correct content-type header', () => {
      expect(apiClient.defaults.headers['Content-Type']).toBe('application/json');
    });

    it('should register request interceptors', () => {
      expect(apiClient.interceptors.request).toBeDefined();
      expect(mockRequestUse).toHaveBeenCalled();
    });

    it('should register response interceptors', () => {
      expect(apiClient.interceptors.response).toBeDefined();
      expect(mockResponseUse).toHaveBeenCalled();
    });
  });

  describe('Interceptor registration', () => {
    it('should register request interceptor with correct handlers', () => {
      expect(mockRequestUse).toHaveBeenCalledWith(
        requestInterceptor,
        requestErrorInterceptor
      );
    });

    it('should register response interceptor with correct handlers', () => {
      expect(mockResponseUse).toHaveBeenCalledWith(
        responseSuccessInterceptor,
        responseInterceptor
      );
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
      expect(mockRequestUse).toHaveBeenCalledWith(
        requestInterceptor,
        expect.any(Function)
      );
    });

    it('should use the exported request error interceptor', () => {
      expect(mockRequestUse).toHaveBeenCalledWith(
        expect.any(Function),
        requestErrorInterceptor
      );
    });

    it('should use the exported response success interceptor', () => {
      expect(mockResponseUse).toHaveBeenCalledWith(
        responseSuccessInterceptor,
        expect.any(Function)
      );
    });

    it('should use the exported response error interceptor', () => {
      expect(mockResponseUse).toHaveBeenCalledWith(
        expect.any(Function),
        responseInterceptor
      );
    });
  });

  describe('Axios create configuration', () => {
    it('should call axios.create with correct configuration', () => {
      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: 'http://127.0.0.1:8000/api',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });
  });
});
