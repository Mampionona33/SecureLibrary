// src/__mocks__/@api/client.ts
const mockApiClient = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn(),
  interceptors: {
    request: {
      use: jest.fn(),
      eject: jest.fn(),
    },
    response: {
      use: jest.fn(),
      eject: jest.fn(),
    },
  },
  defaults: {
    headers: {
      common: {},
      post: {},
      put: {},
      patch: {},
    },
    baseURL: 'http://test.com',
    timeout: 0,
  },
};

export const apiClient = mockApiClient;
export default mockApiClient;
