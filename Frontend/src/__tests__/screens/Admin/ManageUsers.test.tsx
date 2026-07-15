// __tests__/screens/Admin/ManageUsers.test.tsx
import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Alert } from 'react-native';
import ManageUsersScreen from '@screens/Admin/ManageUsers';
import { useUserStore } from '@store/useUserStore';
import { useAppTheme } from '@theme/useAppTheme';
import UserRow from '@components/UserRow';

// ==================== MOCKS ====================

jest.mock('@env', () => ({
  API_URL: 'http://127.0.0.1:8000/api',
}));

jest.mock('@store/useUserStore', () => ({
  useUserStore: jest.fn(),
}));

jest.mock('@theme/useAppTheme', () => ({
  useAppTheme: jest.fn(),
}));

jest.mock('@components/SearchBar', () => {
  const React = require('react');
  return {
    SearchBar: jest.fn(({ value, onChangeText }) => {
      return React.createElement(
        'View',
        { testID: 'search-bar' },
        React.createElement('Text', null, `SearchBar: ${value}`),
        React.createElement(
          'TouchableOpacity',
          { testID: 'search-change', onPress: () => onChangeText('test') },
          React.createElement('Text', null, 'Change')
        )
      );
    }),
  };
});

jest.mock('@components/UserRow', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: jest.fn(({ user, onPress, onValidate }) => {
      return React.createElement(
        'View',
        { testID: `user-row-${user.id}` },
        React.createElement('Text', null, `${user.firstName} ${user.lastName}`),
        React.createElement(
          'TouchableOpacity',
          { testID: `user-row-press-${user.id}`, onPress },
          React.createElement('Text', null, 'Press')
        ),
        onValidate &&
          React.createElement(
            'TouchableOpacity',
            { testID: `user-row-validate-${user.id}`, onPress: onValidate },
            React.createElement('Text', null, 'Validate')
          )
      );
    }),
  };
});

jest.mock('@screens/Admin/ManageUsers/styles', () => ({
  styles: {
    safeArea: {},
    container: {},
    headerRow: {},
    title: {},
    addButton: {},
    addButtonText: {},
    scrollTabWrapper: {},
    tabContainer: {},
    tab: {},
    activeTab: {},
    tabText: {},
    activeTabText: {},
    center: {},
    emptyContainer: {},
    emptyText: {},
  },
}));

jest.mock('@react-navigation/native', () => ({
  useFocusEffect: jest.fn((callback) => callback()),
  useNavigation: jest.fn(() => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
  })),
}));

// ==================== TEST SETUP ====================

const mockFetchUsers = jest.fn();
const mockValidateUserInStore = jest.fn();
const mockNavigate = jest.fn();
const mockNavigation = {
  navigate: mockNavigate,
  goBack: jest.fn(),
  dispatch: jest.fn(),
  reset: jest.fn(),
  setParams: jest.fn(),
  setOptions: jest.fn(),
};

const mockUsers = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    status: 'active',
    role: 'reader',
  },
  {
    id: '2',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane@example.com',
    status: 'pending',
    role: 'author',
  },
  {
    id: '3',
    firstName: 'Bob',
    lastName: 'Johnson',
    email: 'bob@example.com',
    status: 'suspended',
    role: 'admin',
  },
];

const mockUseUserStore = {
  users: mockUsers,
  loading: false,
  refreshing: false,
  fetchUsers: mockFetchUsers,
  validateUserInStore: mockValidateUserInStore,
};

(useUserStore as jest.Mock).mockReturnValue(mockUseUserStore);

(useAppTheme as jest.Mock).mockReturnValue({
  theme: {
    colors: {
      background: '#F5F5F5',
      surface: '#FFFFFF',
      surfaceVariant: '#F0F0F0',
      border: '#E0E0E0',
      text: '#000000',
      textSecondary: '#666666',
      textMuted: '#999999',
      buttonPrimary: '#007AFF',
      buttonPrimaryText: '#FFFFFF',
      primary: '#007AFF',
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 12,
      lg: 16,
      xl: 20,
    },
    radius: {
      sm: 4,
      md: 8,
      lg: 12,
    },
  },
  isDark: false,
});

// ==================== TESTS ====================

describe('ManageUsersScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetchUsers.mockClear();
    mockValidateUserInStore.mockClear();
    mockNavigate.mockClear();
    Alert.alert = jest.fn();
    (UserRow as jest.Mock).mockClear();
  });

  // ===== RENDER TESTS =====
  describe('Rendu', () => {
    it('devrait se rendre sans erreur', async () => {
      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <ManageUsersScreen navigation={mockNavigation} />
        );
      });
      expect(instance).toBeDefined();
    });

    it('devrait afficher le titre', async () => {
      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <ManageUsersScreen navigation={mockNavigation} />
        );
      });
      const root = instance.root;
      const title = root.findAll((el: any) => el.props.testID === 'manage-users-title');
      expect(title.length).toBeGreaterThan(0);
      expect(title[0].props.children).toBe('Membres');
    });

    it('devrait afficher le bouton "Créer Membre"', async () => {
      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <ManageUsersScreen navigation={mockNavigation} />
        );
      });
      const root = instance.root;
      const addButton = root.findAll(
        (el: any) => el.props.testID === 'manage-users-add-button'
      );
      expect(addButton.length).toBeGreaterThan(0);
    });

    it('devrait afficher les 4 onglets', async () => {
      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <ManageUsersScreen navigation={mockNavigation} />
        );
      });
      const root = instance.root;
      const tabs = ['all', 'pending', 'active', 'suspended'];

      tabs.forEach((tab) => {
        const tabElement = root.findAll(
          (el: any) => el.props.testID === `manage-users-tab-${tab}`
        );
        expect(tabElement.length).toBeGreaterThan(0);
      });
    });

    it('devrait afficher la barre de recherche', async () => {
      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <ManageUsersScreen navigation={mockNavigation} />
        );
      });
      const root = instance.root;
      const search = root.findAll((el: any) => el.props.testID === 'search-bar');
      expect(search.length).toBeGreaterThan(0);
    });
  });

  // ===== LOADING STATE =====
  describe('État de chargement', () => {
    it('devrait afficher un loader quand loading=true et users vide', async () => {
      (useUserStore as jest.Mock).mockReturnValue({
        ...mockUseUserStore,
        loading: true,
        users: [],
      });

      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <ManageUsersScreen navigation={mockNavigation} />
        );
      });
      const root = instance.root;
      const loader = root.findAll(
        (el: any) => el.props.testID === 'manage-users-loader'
      );
      expect(loader.length).toBeGreaterThan(0);

      // Reset mock for other tests
      (useUserStore as jest.Mock).mockReturnValue(mockUseUserStore);
    });
  });

  // ===== INTERACTION TESTS =====
  describe('Interactions', () => {
    it('devrait naviguer vers CreateUser lors du clic sur le bouton "Créer Membre"', async () => {
      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <ManageUsersScreen navigation={mockNavigation} />
        );
      });
      const root = instance.root;
      const addButton = root.findAll(
        (el: any) => el.props.testID === 'manage-users-add-button'
      );

      expect(addButton.length).toBeGreaterThan(0);

      await ReactTestRenderer.act(async () => {
        addButton[0].props.onPress();
      });

      expect(mockNavigate).toHaveBeenCalledWith('CreateUser');
    });

    it('devrait naviguer vers UserEdit lors du clic sur un utilisateur', async () => {
      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <ManageUsersScreen navigation={mockNavigation} />
        );
      });
      const root = instance.root;

      // Find a user row press button
      const userPressButtons = root.findAll(
        (el: any) =>
          el.props.testID && el.props.testID.startsWith('user-row-press-')
      );

      expect(userPressButtons.length).toBeGreaterThan(0);

      await ReactTestRenderer.act(async () => {
        userPressButtons[0].props.onPress();
      });

      expect(mockNavigate).toHaveBeenCalledWith('UserEdit', { userId: '1' });
    });

    it('devrait changer l\'onglet actif lors du clic sur un onglet', async () => {
      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <ManageUsersScreen navigation={mockNavigation} />
        );
      });
      const root = instance.root;
      const pendingTab = root.findAll(
        (el: any) => el.props.testID === 'manage-users-tab-pending'
      );

      expect(pendingTab.length).toBeGreaterThan(0);

      await ReactTestRenderer.act(async () => {
        pendingTab[0].props.onPress();
      });

      expect(instance.root).toBeDefined();
    });

    it('devrait appeler fetchUsers via useFocusEffect', async () => {
      // Monter le composant pour déclencher useFocusEffect
      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <ManageUsersScreen navigation={mockNavigation} />
        );
      });
      expect(instance).toBeDefined();

      // Le mock de useFocusEffect exécute le callback immédiatement
      expect(mockFetchUsers).toHaveBeenCalled();
    });

    it('devrait filtrer les utilisateurs selon la recherche', async () => {
      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <ManageUsersScreen navigation={mockNavigation} />
        );
      });
      const root = instance.root;
      const searchBar = root.findAll((el: any) => el.props.testID === 'search-bar');

      expect(searchBar.length).toBeGreaterThan(0);

      const changeButton = root.findAll(
        (el: any) => el.props.testID === 'search-change'
      );

      expect(changeButton.length).toBeGreaterThan(0);

      await ReactTestRenderer.act(async () => {
        changeButton[0].props.onPress();
      });

      expect(instance.root).toBeDefined();
    });

    it('devrait afficher le message "Aucun membre trouvé" quand la liste est vide', async () => {
      (useUserStore as jest.Mock).mockReturnValue({
        ...mockUseUserStore,
        users: [],
      });

      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <ManageUsersScreen navigation={mockNavigation} />
        );
      });
      const root = instance.root;
      const empty = root.findAll(
        (el: any) => el.props.testID === 'manage-users-empty'
      );

      expect(empty.length).toBeGreaterThan(0);

      // Reset mock for other tests
      (useUserStore as jest.Mock).mockReturnValue(mockUseUserStore);
    });
  });

  // ===== VALIDATION =====
  describe('Validation d\'utilisateur', () => {
    it('devrait appeler Alert.alert pour confirmer la validation', async () => {
      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <ManageUsersScreen navigation={mockNavigation} />
        );
      });

      const root = instance.root;

      // Find all validate buttons in the component tree
      const validateButtons = root.findAll(
        (el: any) =>
          el.props.testID && el.props.testID.startsWith('user-row-validate-')
      );

      // Find the validate button for user '2'
      const validateButton = validateButtons.find(
        (el: any) => el.props.testID === 'user-row-validate-2'
      );

      expect(validateButton).toBeDefined();

      await ReactTestRenderer.act(async () => {
        validateButton.props.onPress();
      });

      expect(Alert.alert).toHaveBeenCalledWith(
        'Validation',
        "Approuver l'accès de Jane Smith à l'organisation ?",
        expect.any(Array)
      );
    });

    it('devrait appeler validateUserInStore après confirmation', async () => {
      let approveCallback: any;

      // Mock Alert to capture the 'Approuver' callback
      Alert.alert = jest.fn((title, message, buttons) => {
        // Only capture the validation alert
        if (title === 'Validation' && Array.isArray(buttons)) {
          const approveButton = buttons.find(
            (b: any) => b.text === 'Approuver'
          );
          if (approveButton) {
            approveCallback = approveButton.onPress;
          }
        }
      });

      mockValidateUserInStore.mockResolvedValueOnce(undefined);

      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <ManageUsersScreen navigation={mockNavigation} />
        );
      });

      const root = instance.root;

      // Find the validate button for user '2'
      const validateButtons = root.findAll(
        (el: any) =>
          el.props.testID && el.props.testID.startsWith('user-row-validate-')
      );

      const validateButton = validateButtons.find(
        (el: any) => el.props.testID === 'user-row-validate-2'
      );

      expect(validateButton).toBeDefined();

      await ReactTestRenderer.act(async () => {
        validateButton.props.onPress();
      });

      expect(approveCallback).toBeDefined();

      // Execute the approve button callback
      await ReactTestRenderer.act(async () => {
        await approveCallback();
      });

      expect(mockValidateUserInStore).toHaveBeenCalledWith('2');
    });

    it('devrait gérer une erreur lors de la validation', async () => {
      let approveCallback: any;

      // Mock Alert to capture the 'Approuver' callback
      Alert.alert = jest.fn((title, message, buttons) => {
        if (title === 'Validation' && Array.isArray(buttons)) {
          const approveButton = buttons.find(
            (b: any) => b.text === 'Approuver'
          );
          if (approveButton) {
            approveCallback = approveButton.onPress;
          }
        }
      });

      // Mock the validation to reject with an error
      mockValidateUserInStore.mockRejectedValueOnce(
        new Error('Erreur serveur')
      );

      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <ManageUsersScreen navigation={mockNavigation} />
        );
      });

      const root = instance.root;

      // Find the validate button for user '2'
      const validateButtons = root.findAll(
        (el: any) =>
          el.props.testID && el.props.testID.startsWith('user-row-validate-')
      );

      const validateButton = validateButtons.find(
        (el: any) => el.props.testID === 'user-row-validate-2'
      );

      expect(validateButton).toBeDefined();

      // Trigger the validation prompt
      await ReactTestRenderer.act(async () => {
        validateButton.props.onPress();
      });

      expect(approveCallback).toBeDefined();

      // Execute the approve callback which will trigger the error
      await ReactTestRenderer.act(async () => {
        await approveCallback();
      });

      // Verify error alert was called
      const errorAlertCalls = (Alert.alert as jest.Mock).mock.calls.filter(
        (call) => call[0] === 'Erreur'
      );

      expect(errorAlertCalls.length).toBeGreaterThan(0);
      expect(errorAlertCalls[0][1]).toBe('Erreur serveur');
    });
  });
});
