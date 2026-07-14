// __tests__/api/interceptors.simple.test.ts
import * as Keychain from 'react-native-keychain';
import { requestInterceptor } from '@api/interceptors';

// Mock simple
jest.mock('react-native-keychain', () => ({
  getGenericPassword: jest.fn(),
}));

const mockedKeychain = Keychain as jest.Mocked<typeof Keychain>;

describe('requestInterceptor - Simple Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should add Authorization header when token exists', async () => {
    mockedKeychain.getGenericPassword.mockResolvedValue({
      password: JSON.stringify({ access: 'test-token' }),
    });

    const config = { headers: {} };
    const result = await requestInterceptor(config);

    expect(result.headers.Authorization).toBe('Bearer test-token');
  });

  it('should not add Authorization header when no token exists', async () => {
    mockedKeychain.getGenericPassword.mockResolvedValue(false);

    const config = { headers: {} };
    const result = await requestInterceptor(config);

    expect(result.headers.Authorization).toBeUndefined();
  });
});
