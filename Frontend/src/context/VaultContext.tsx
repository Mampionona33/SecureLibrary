import React, { createContext, useState, useEffect, useContext } from 'react';
import * as Keychain from 'react-native-keychain';

// Identifiant unique pour différencier ce mot de passe des identifiants API
const VAULT_SERVICE_NAME = 'local_vault_pin';

interface VaultContextType {
  isVaultConfigured: boolean;
  isVaultUnlocked: boolean;
  isLoadingVault: boolean;
  setupLocalVault: (pin: string) => Promise<void>;
  unlockVault: (enteredPin?: string) => Promise<boolean>;
  lockVault: () => void;
  resetVault: () => Promise<void>; // En cas d'oubli ou de réinitialisation de l'app
}

const VaultContext = createContext<VaultContextType | undefined>(undefined);

export const VaultProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isVaultConfigured, setIsVaultConfigured] = useState<boolean>(false);
  const [isVaultUnlocked, setIsVaultUnlocked] = useState<boolean>(false);
  const [isLoadingVault, setIsLoadingVault] = useState<boolean>(true);

  // Vérifier si un PIN est déjà enregistré au lancement de l'application
  useEffect(() => {
    const checkVaultStatus = async () => {
      try {
        const credentials = await Keychain.getGenericPassword({ service: VAULT_SERVICE_NAME });
        if (credentials) {
          setIsVaultConfigured(true);
        } else {
          setIsVaultConfigured(false);
        }
      } catch (error) {
        console.error("Erreur lors de la vérification du coffre :", error);
      } finally {
        setIsLoadingVault(false);
      }
    };

    checkVaultStatus();
  }, []);

  // Créer le code PIN initialement
  const setupLocalVault = async (pin: string) => {
    try {
      await Keychain.setGenericPassword('user_vault', pin, {
        service: VAULT_SERVICE_NAME,
        // On rend le PIN accessible uniquement quand le téléphone est déverrouillé
        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      });
      setIsVaultConfigured(true);
      setIsVaultUnlocked(true); // On déverrouille automatiquement après la création
    } catch (error) {
      console.error("Erreur lors de la création du coffre :", error);
      throw new Error("Impossible de configurer le coffre.");
    }
  };

  // Déverrouiller le coffre (avec le PIN ou la biométrie)
  const unlockVault = async (enteredPin?: string): Promise<boolean> => {
    try {
      const credentials = await Keychain.getGenericPassword({ service: VAULT_SERVICE_NAME });
      
      if (!credentials) {
        throw new Error("Aucun coffre configuré.");
      }

      // Si l'utilisateur a tapé un PIN manuellement
      if (enteredPin) {
        if (credentials.password === enteredPin) {
          setIsVaultUnlocked(true);
          return true;
        } else {
          return false; // Code PIN incorrect
        }
      } 
      
      // La logique biométrique viendra se greffer ici si enteredPin n'est pas fourni
      // (ex: Keychain peut déclencher FaceID/TouchID automatiquement selon sa configuration)

      return false;
    } catch (error) {
      console.error("Erreur lors du déverrouillage :", error);
      return false;
    }
  };

  // Verrouiller manuellement l'application (ex: bouton de déconnexion locale)
  const lockVault = () => {
    setIsVaultUnlocked(false);
  };

  // Danger : Supprime le PIN local (utile pour les tests ou si l'utilisateur vide son cache)
  const resetVault = async () => {
    await Keychain.resetGenericPassword({ service: VAULT_SERVICE_NAME });
    setIsVaultConfigured(false);
    setIsVaultUnlocked(false);
  };

  return (
    <VaultContext.Provider
      value={{
        isVaultConfigured,
        isVaultUnlocked,
        isLoadingVault,
        setupLocalVault,
        unlockVault,
        lockVault,
        resetVault,
      }}
    >
      {children}
    </VaultContext.Provider>
  );
};

// Hook personnalisé pour consommer le contexte facilement
export const useVault = () => {
  const context = useContext(VaultContext);
  if (!context) {
    throw new Error("useVault doit être utilisé à l'intérieur d'un VaultProvider");
  }
  return context;
};
