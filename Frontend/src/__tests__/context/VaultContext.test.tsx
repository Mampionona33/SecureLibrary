import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import * as Keychain from 'react-native-keychain';
import { VaultProvider, useVault } from '@context/VaultContext';

// Mocks
jest.mock('react-native-keychain', () => ({
  getGenericPassword: jest.fn(),
  setGenericPassword: jest.fn(),
  resetGenericPassword: jest.fn(),
  ACCESSIBLE: {
    WHEN_UNLOCKED_THIS_DEVICE_ONLY: 'WHEN_UNLOCKED_THIS_DEVICE_ONLY',
  },
}));

// Composant Consommateur
const VaultConsumer = () => {
  const {
    isLoadingVault,
    isVaultConfigured,
    isVaultUnlocked,
    setupLocalVault,
    unlockVault,
  } = useVault();

  if (isLoadingVault) {
    return <Text testID="loading">Chargement...</Text>;
  }

  return (
    <>
      <Text testID="configured-status">
        {isVaultConfigured ? 'Vault Configured' : 'Vault Not Configured'}
      </Text>
      <Text testID="unlocked-status">
        {isVaultUnlocked ? 'Vault Unlocked' : 'Vault Locked'}
      </Text>

      <TouchableOpacity
        testID="setup-button"
        onPress={() => setupLocalVault('1234')}
      >
        <Text>Setup Vault</Text>
      </TouchableOpacity>

      <TouchableOpacity
        testID="unlock-correct-button"
        onPress={() => unlockVault('1234')}
      >
        <Text>Unlock Correct</Text>
      </TouchableOpacity>
    </>
  );
};

describe('VaultContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // 1. Initialisation (Keychain vide)
  test('1. Initialisation (Keychain vide) : Initialiser avec un coffre non configuré et verrouillé si aucun PIN n\'existe dans Keychain', async () => {
    (Keychain.getGenericPassword as jest.Mock).mockResolvedValue(false);

    render(
      <VaultProvider>
        <VaultConsumer />
      </VaultProvider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('loading')).toBeNull();
    });

    expect(screen.getByTestId('configured-status')).toHaveTextContent('Vault Not Configured');
    expect(screen.getByTestId('unlocked-status')).toHaveTextContent('Vault Locked');
    expect(Keychain.getGenericPassword).toHaveBeenCalledWith({
      service: 'local_vault_pin',
    });
  });

  // 2. Initialisation (Keychain existant)
  test('2. Initialisation (Keychain existant) : Détecter automatiquement un coffre déjà configuré au lancement si un PIN est présent dans Keychain', async () => {
    (Keychain.getGenericPassword as jest.Mock).mockResolvedValue({
      username: 'user_vault',
      password: '1234',
    });

    render(
      <VaultProvider>
        <VaultConsumer />
      </VaultProvider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('loading')).toBeNull();
    });

    expect(screen.getByTestId('configured-status')).toHaveTextContent('Vault Configured');
    expect(screen.getByTestId('unlocked-status')).toHaveTextContent('Vault Locked');
  });

  // 3. Création du PIN (setupLocalVault)
  test('3. Création du PIN (setupLocalVault) : Enregistrer le nouveau PIN dans Keychain avec l\'option WHEN_UNLOCKED_THIS_DEVICE_ONLY et déverrouiller automatiquement le coffre', async () => {
    (Keychain.getGenericPassword as jest.Mock).mockResolvedValue(false);
    (Keychain.setGenericPassword as jest.Mock).mockResolvedValue(true);

    render(
      <VaultProvider>
        <VaultConsumer />
      </VaultProvider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('loading')).toBeNull();
    });

    fireEvent.press(screen.getByTestId('setup-button'));

    await waitFor(() => {
      expect(screen.getByTestId('configured-status')).toHaveTextContent('Vault Configured');
      expect(screen.getByTestId('unlocked-status')).toHaveTextContent('Vault Unlocked');
    });

    expect(Keychain.setGenericPassword).toHaveBeenCalledWith(
      'user_vault',
      '1234',
      {
        service: 'local_vault_pin',
        accessible: 'WHEN_UNLOCKED_THIS_DEVICE_ONLY',
      }
    );
  });

  // 4. Déverrouillage réussi (unlockVault)
  test('4. Déverrouillage réussi (unlockVault) : Déverrouiller le coffre avec succès lorsque le PIN saisi correspond à celui stocké', async () => {
    (Keychain.getGenericPassword as jest.Mock).mockResolvedValue({
      username: 'user_vault',
      password: '1234',
    });

    render(
      <VaultProvider>
        <VaultConsumer />
      </VaultProvider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('loading')).toBeNull();
    });

    fireEvent.press(screen.getByTestId('unlock-correct-button'));

    await waitFor(() => {
      expect(screen.getByTestId('unlocked-status')).toHaveTextContent('Vault Unlocked');
    });
  });
});
