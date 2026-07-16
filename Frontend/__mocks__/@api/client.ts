// Mock centralisé pour apiClient

const mockGet = jest.fn();
const mockPost = jest.fn();
const mockPut = jest.fn();
const mockDelete = jest.fn();

// Export par défaut du client mocké
const apiClientMock = {
  get: mockGet,
  post: mockPost,
  put: mockPut,
  delete: mockDelete,
};

// Export des fonctions mock pour les tests
export const __mocks__ = {
  mockGet,
  mockPost,
  mockPut,
  mockDelete,
};

export default apiClientMock;
