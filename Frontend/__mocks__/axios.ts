const mockRequestUse = jest.fn();
const mockResponseUse = jest.fn();

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
    },
    response: {
      use: mockResponseUse,
    },
  },
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  patch: jest.fn(),
  request: jest.fn(),
  head: jest.fn(),
  options: jest.fn(),
};

const mockCreate = jest.fn().mockReturnValue(mockAxiosInstance);

const axios = {
  create: mockCreate,
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  patch: jest.fn(),
  request: jest.fn(),
  head: jest.fn(),
  options: jest.fn(),
  defaults: {
    headers: {
      common: {},
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
};

// Exporter les mocks pour les tests
(axios as any).__mocks = {
  mockRequestUse,
  mockResponseUse,
  mockAxiosInstance,
  mockCreate,
};

export default axios;
