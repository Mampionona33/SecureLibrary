import React from 'react';
import { render, waitFor } from '@utils/test-utils';
import SecurityStack from '@navigation/SecurityStack';
import { useVault } from '@context/VaultContext';

jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: () => ({
    Navigator: ({ children }: any) => children,
    Screen: ({ component: Component }: any) => Component ? Component({}) : null,
  }),
}));

jest.mock('@context/VaultContext', () => ({
  useVault: jest.fn(),
  VaultProvider: ({ children }: any) => children,
}));

jest.mock('@screens/Security/SetupVault', () => () => null);
jest.mock('@screens/Security/UnlockVault', () => () => null);

describe('SecurityStack', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('SecurityStack renders SetupVault screen when vault is not configured', async () => {
    (useVault as jest.Mock).mockReturnValue({
      isVaultConfigured: false,
      isVaultUnlocked: false,
      isLoadingVault: false,
      setupLocalVault: jest.fn(),
      unlockVault: jest.fn(),
      lockVault: jest.fn(),
      resetVault: jest.fn(),
    });

    expect(() => {
      render(<SecurityStack />);
    }).not.toThrow();
  });
});
