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

const axios: any = jest.fn().mockResolvedValue({});
axios.create = jest.fn().mockReturnValue(mockAxiosInstance);
axios.get = jest.fn();
axios.post = jest.fn();
axios.put = jest.fn();
axios.delete = jest.fn();
axios.patch = jest.fn();
axios.request = jest.fn();
axios.head = jest.fn();
axios.options = jest.fn();
axios.defaults = {
  headers: {
    common: {},
  },
};
axios.interceptors = {
  request: {
    use: mockRequestUse,
  },
  response: {
    use: mockResponseUse,
  },
};

// Exporter les mocks pour les tests
axios.__mocks = {
  mockRequestUse,
  mockResponseUse,
  mockAxiosInstance,
  mockCreate: axios.create,
};

export default axios;
