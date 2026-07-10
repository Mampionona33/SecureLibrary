import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import * as Keychain from 'react-native-keychain';
import { VaultProvider, useVault } from '@context/VaultContext';

// Configuration de l'environnement pour éviter les avertissements sur act(...)
// @ts-ignore
global.IS_REACT_ACT_ENVIRONMENT = true;

// Mocks
jest.mock('react-native-keychain', () => ({
  getGenericPassword: jest.fn(),
  setGenericPassword: jest.fn(),
  resetGenericPassword: jest.fn(),
  ACCESSIBLE: {
    WHEN_UNLOCKED_THIS_DEVICE_ONLY: 'WHEN_UNLOCKED_THIS_DEVICE_ONLY',
  },
}));

// Composant Consommateur pour les tests d'intégration
const VaultConsumer = () => {
  const {
    isLoadingVault,
    isVaultConfigured,
    isVaultUnlocked,
    setupLocalVault,
    unlockVault,
    lockVault,
    resetVault,
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

      <TouchableOpacity
        testID="unlock-wrong-button"
        onPress={() => unlockVault('9999')}
      >
        <Text>Unlock Wrong</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        testID="lock-button"
        onPress={() => lockVault()}
      >
        <Text>Lock Vault</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        testID="reset-button"
        onPress={() => resetVault()}
      >
        <Text>Reset Vault</Text>
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

  // 5. Échec de déverrouillage (unlockVault)
  test('5. Échec de déverrouillage (unlockVault) : Refuser le déverrouillage et retourner false si le PIN saisi est incorrect', async () => {
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

    fireEvent.press(screen.getByTestId('unlock-wrong-button'));

    await waitFor(() => {
      expect(screen.getByTestId('unlocked-status')).toHaveTextContent('Vault Locked');
    });
  });

  // 6. Déverrouillage sans coffre (unlockVault)
  test('6. Déverrouillage sans coffre (unlockVault) : Gérer l\'erreur et retourner false lors d\'une tentative de déverrouillage alors qu\'aucun coffre n\'est configuré', async () => {
    (Keychain.getGenericPassword as jest.Mock).mockResolvedValue(false);

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
      expect(screen.getByTestId('configured-status')).toHaveTextContent('Vault Not Configured');
      expect(screen.getByTestId('unlocked-status')).toHaveTextContent('Vault Locked');
    });
  });

  // 7. Verrouillage manuel (lockVault)
  test('7. Verrouillage manuel (lockVault) : Passer l\'état isVaultUnlocked à false lors de l\'appel à la fonction de verrouillage', async () => {
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
      expect(screen.getByTestId('unlocked-status')).toHaveTextContent('Vault Unlocked');
    });

    fireEvent.press(screen.getByTestId('lock-button'));

    await waitFor(() => {
      expect(screen.getByTestId('unlocked-status')).toHaveTextContent('Vault Locked');
    });
  });

  // 8. Réinitialisation (resetVault)
  test('8. Réinitialisation (resetVault) : Purger la clé Keychain local_vault_pin et réinitialiser les états isVaultConfigured et isVaultUnlocked à false', async () => {
    (Keychain.getGenericPassword as jest.Mock).mockResolvedValue({
      username: 'user_vault',
      password: '1234',
    });
    (Keychain.resetGenericPassword as jest.Mock).mockResolvedValue(true);

    render(
      <VaultProvider>
        <VaultConsumer />
      </VaultProvider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('loading')).toBeNull();
    });

    fireEvent.press(screen.getByTestId('reset-button'));

    await waitFor(() => {
      expect(screen.getByTestId('configured-status')).toHaveTextContent('Vault Not Configured');
      expect(screen.getByTestId('unlocked-status')).toHaveTextContent('Vault Locked');
    });

    expect(Keychain.resetGenericPassword).toHaveBeenCalledWith({
      service: 'local_vault_pin',
    });
  });


// 9. Sécurité du Hook (useVault)
  test("9. Sécurité du Hook (useVault) : Lever une exception explicite si useVault est utilisé en dehors du VaultProvider", () => {
    // Désactiver temporairement les logs d'erreur de React pour ne pas polluer la console du terminal
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const TestingComponent = () => {
      useVault();
      return null;
    };

    // On englobe l'exécution complète du render (qui déclenche le cycle de vie React) dans le toThrow
    expect(() => {
      render(<TestingComponent />);
    }).toThrow("useVault doit être utilisé à l'intérieur d'un VaultProvider");

    consoleSpy.mockRestore();
  });
