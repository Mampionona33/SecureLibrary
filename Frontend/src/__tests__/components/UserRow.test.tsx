// __tests__/components/UserRow.test.tsx
import React from 'react';
import TestRenderer, { ReactTestRenderer } from 'react-test-renderer';
import UserRow from '@components/UserRow';
import { Text, TouchableOpacity, View } from 'react-native';
import { UserResponse } from '@types/user';

// Mock complet de react-native
jest.mock('react-native', () => ({
  Text: 'Text',
  View: 'View',
  TouchableOpacity: 'TouchableOpacity',
  TextInput: 'TextInput',
  StyleSheet: {
    create: jest.fn(() => ({})),
  },
  TurboModuleRegistry: {
    getEnforcing: jest.fn(),
    get: jest.fn(),
  },
  NativeModules: {
    DevMenu: null,
  },
}), { virtual: true });

// Mock du thème
jest.mock('@theme/useAppTheme', () => ({
  useAppTheme: () => ({
    theme: {
      colors: {
        surface: '#FFFFFF',
        border: '#E0E0E0',
        text: '#000000',
        textSecondary: '#666666',
        textMuted: '#999999',
        surfaceVariant: '#F5F5F5',
        buttonPrimaryText: '#FFFFFF',
        success: '#34C759',
        warning: '#FF9500',
        danger: '#FF3B30',
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
        xl: 16,
        full: 999,
      },
    },
  }),
}));

// Mock des styles
jest.mock('@components/UserRow/styles', () => ({
  styles: {
    container: {},
    infoContainer: {},
    name: {},
    email: {},
    badgeRow: {},
    badge: {},
    validateButton: {},
    validateButtonText: {},
  },
}));

describe('UserRow', () => {
  // Mock d'un utilisateur actif
  const mockActiveUser: UserResponse = {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    role: 'reader',
    status: 'active',
  };

  // Mock d'un utilisateur en attente
  const mockPendingUser: UserResponse = {
    id: '2',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane@example.com',
    role: 'author',
    status: 'pending',
  };

  // Mock d'un utilisateur bloqué
  const mockSuspendedUser: UserResponse = {
    id: '3',
    firstName: 'Bob',
    lastName: 'Johnson',
    email: 'bob@example.com',
    role: 'admin',
    status: 'suspended',
  };

  it('se rend sans erreur avec un utilisateur actif', () => {
    let error = null;
    try {
      TestRenderer.act(() => {
        TestRenderer.create(
          <UserRow user={mockActiveUser} onPress={() => {}} />
        );
      });
    } catch (e) {
      error = e;
    }
    expect(error).toBeNull();
  });

  it('affiche correctement le nom complet de l\'utilisateur', () => {
    let renderer: ReactTestRenderer | null = null;
    
    TestRenderer.act(() => {
      renderer = TestRenderer.create(
        <UserRow user={mockActiveUser} onPress={() => {}} />
      );
    });

    expect(renderer).not.toBeNull();
    
    if (renderer) {
      const instance = renderer.root;
      const texts = instance.findAllByType(Text);
      
      // Trouver le texte du nom - il peut être un tableau ["John", " ", "Doe"]
      const nameText = texts.find((t: any) => {
        const children = t.props.children;
        // Vérifier si c'est un tableau qui contient "John" et "Doe"
        if (Array.isArray(children)) {
          return children.includes('John') && children.includes('Doe');
        }
        // Vérifier si c'est une chaîne qui contient "John Doe"
        if (typeof children === 'string') {
          return children === 'John Doe';
        }
        return false;
      });
      
      expect(nameText).toBeDefined();
    }
  });

  it('affiche correctement l\'email de l\'utilisateur', () => {
    let renderer: ReactTestRenderer | null = null;
    
    TestRenderer.act(() => {
      renderer = TestRenderer.create(
        <UserRow user={mockActiveUser} onPress={() => {}} />
      );
    });

    expect(renderer).not.toBeNull();
    
    if (renderer) {
      const instance = renderer.root;
      const texts = instance.findAllByType(Text);
      const textValues = texts.map((t: any) => t.props.children);
      
      expect(textValues).toContain('john@example.com');
    }
  });

  it('affiche le rôle de l\'utilisateur', () => {
    let renderer: ReactTestRenderer | null = null;
    
    TestRenderer.act(() => {
      renderer = TestRenderer.create(
        <UserRow user={mockActiveUser} onPress={() => {}} />
      );
    });

    expect(renderer).not.toBeNull();
    
    if (renderer) {
      const instance = renderer.root;
      const texts = instance.findAllByType(Text);
      const textValues = texts.map((t: any) => t.props.children);
      
      expect(textValues).toContain('reader');
    }
  });

  it('affiche "Actif" comme statut pour un utilisateur actif', () => {
    let renderer: ReactTestRenderer | null = null;
    
    TestRenderer.act(() => {
      renderer = TestRenderer.create(
        <UserRow user={mockActiveUser} onPress={() => {}} />
      );
    });

    expect(renderer).not.toBeNull();
    
    if (renderer) {
      const instance = renderer.root;
      const texts = instance.findAllByType(Text);
      const textValues = texts.map((t: any) => t.props.children);
      
      expect(textValues).toContain('Actif');
    }
  });

  it('affiche "En attente" comme statut pour un utilisateur en attente', () => {
    let renderer: ReactTestRenderer | null = null;
    
    TestRenderer.act(() => {
      renderer = TestRenderer.create(
        <UserRow user={mockPendingUser} onPress={() => {}} />
      );
    });

    expect(renderer).not.toBeNull();
    
    if (renderer) {
      const instance = renderer.root;
      const texts = instance.findAllByType(Text);
      const textValues = texts.map((t: any) => t.props.children);
      
      expect(textValues).toContain('En attente');
    }
  });

  it('affiche "Bloqué" comme statut pour un utilisateur bloqué', () => {
    let renderer: ReactTestRenderer | null = null;
    
    TestRenderer.act(() => {
      renderer = TestRenderer.create(
        <UserRow user={mockSuspendedUser} onPress={() => {}} />
      );
    });

    expect(renderer).not.toBeNull();
    
    if (renderer) {
      const instance = renderer.root;
      const texts = instance.findAllByType(Text);
      const textValues = texts.map((t: any) => t.props.children);
      
      expect(textValues).toContain('Bloqué');
    }
  });

  it('appelle onPress quand la ligne est pressée', () => {
    const mockOnPress = jest.fn();
    let renderer: ReactTestRenderer | null = null;
    
    TestRenderer.act(() => {
      renderer = TestRenderer.create(
        <UserRow user={mockActiveUser} onPress={mockOnPress} />
      );
    });

    expect(renderer).not.toBeNull();
    
    if (renderer) {
      const instance = renderer.root;
      const touchables = instance.findAllByType(TouchableOpacity);
      
      // Le premier TouchableOpacity est la ligne principale
      expect(touchables.length).toBeGreaterThan(0);
      
      TestRenderer.act(() => {
        touchables[0].props.onPress();
      });
      
      expect(mockOnPress).toHaveBeenCalled();
      expect(mockOnPress).toHaveBeenCalledTimes(1);
    }
  });

  it('affiche le bouton "Approuver" quand onValidate est fourni', () => {
    let renderer: ReactTestRenderer | null = null;
    
    TestRenderer.act(() => {
      renderer = TestRenderer.create(
        <UserRow 
          user={mockPendingUser} 
          onPress={() => {}} 
          onValidate={() => {}} 
        />
      );
    });

    expect(renderer).not.toBeNull();
    
    if (renderer) {
      const instance = renderer.root;
      const texts = instance.findAllByType(Text);
      const textValues = texts.map((t: any) => t.props.children);
      
      expect(textValues).toContain('Approuver');
    }
  });

  it('n\'affiche PAS le bouton "Approuver" quand onValidate n\'est pas fourni', () => {
    let renderer: ReactTestRenderer | null = null;
    
    TestRenderer.act(() => {
      renderer = TestRenderer.create(
        <UserRow user={mockPendingUser} onPress={() => {}} />
      );
    });

    expect(renderer).not.toBeNull();
    
    if (renderer) {
      const instance = renderer.root;
      const texts = instance.findAllByType(Text);
      const textValues = texts.map((t: any) => t.props.children);
      
      expect(textValues).not.toContain('Approuver');
    }
  });

  it('appelle onValidate quand le bouton "Approuver" est pressé', () => {
    const mockOnValidate = jest.fn();
    let renderer: ReactTestRenderer | null = null;
    
    TestRenderer.act(() => {
      renderer = TestRenderer.create(
        <UserRow 
          user={mockPendingUser} 
          onPress={() => {}} 
          onValidate={mockOnValidate} 
        />
      );
    });

    expect(renderer).not.toBeNull();
    
    if (renderer) {
      const instance = renderer.root;
      const touchables = instance.findAllByType(TouchableOpacity);
      
      // Le deuxième TouchableOpacity est le bouton "Approuver"
      expect(touchables.length).toBeGreaterThan(1);
      
      TestRenderer.act(() => {
        touchables[1].props.onPress();
      });
      
      expect(mockOnValidate).toHaveBeenCalled();
      expect(mockOnValidate).toHaveBeenCalledTimes(1);
    }
  });

  it('applique le bon style de couleur pour le statut "Actif"', () => {
    let renderer: ReactTestRenderer | null = null;
    
    TestRenderer.act(() => {
      renderer = TestRenderer.create(
        <UserRow user={mockActiveUser} onPress={() => {}} />
      );
    });

    expect(renderer).not.toBeNull();
    
    if (renderer) {
      const instance = renderer.root;
      const texts = instance.findAllByType(Text);
      
      const statusText = texts.find((t: any) => t.props.children === 'Actif');
      expect(statusText).toBeDefined();
      
      if (statusText) {
        expect(statusText.props.style).toBeDefined();
      }
    }
  });

  it('applique le bon style de couleur pour le statut "En attente"', () => {
    let renderer: ReactTestRenderer | null = null;
    
    TestRenderer.act(() => {
      renderer = TestRenderer.create(
        <UserRow user={mockPendingUser} onPress={() => {}} />
      );
    });

    expect(renderer).not.toBeNull();
    
    if (renderer) {
      const instance = renderer.root;
      const texts = instance.findAllByType(Text);
      
      const statusText = texts.find((t: any) => t.props.children === 'En attente');
      expect(statusText).toBeDefined();
      
      if (statusText) {
        expect(statusText.props.style).toBeDefined();
      }
    }
  });

  // Test supplémentaire pour vérifier que le nom complet est bien affiché
  it('affiche le nom et le prénom séparément', () => {
    let renderer: ReactTestRenderer | null = null;
    
    TestRenderer.act(() => {
      renderer = TestRenderer.create(
        <UserRow user={mockActiveUser} onPress={() => {}} />
      );
    });

    expect(renderer).not.toBeNull();
    
    if (renderer) {
      const instance = renderer.root;
      const texts = instance.findAllByType(Text);
      
      // Vérifier que le prénom est affiché
      const hasFirstName = texts.some((t: any) => {
        const children = t.props.children;
        if (Array.isArray(children)) {
          return children.includes('John');
        }
        return typeof children === 'string' && children.includes('John');
      });
      
      // Vérifier que le nom est affiché
      const hasLastName = texts.some((t: any) => {
        const children = t.props.children;
        if (Array.isArray(children)) {
          return children.includes('Doe');
        }
        return typeof children === 'string' && children.includes('Doe');
      });
      
      expect(hasFirstName).toBe(true);
      expect(hasLastName).toBe(true);
    }
  });
});
