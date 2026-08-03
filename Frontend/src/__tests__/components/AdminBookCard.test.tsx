import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Alert } from 'react-native';
import AdminBookCard from '@components/AdminBookCard';
import { useAppTheme } from '@theme/useAppTheme';

jest.mock('@theme/useAppTheme', () => ({
  useAppTheme: jest.fn(),
}));

jest.mock('@components/AdminBookCard/styles', () => ({
  styles: {
    bookCard: {},
    coverContainer: {},
    coverPlaceholder: {},
    coverPlaceholderText: {},
    coverImage: {},
    bookInfo: {},
    bookTitle: {},
    bookRow: {},
    bookAuthor: {},
    statusBadge: {},
    statusBadgeText: {},
    bookYear: {},
    arrowContainer: {},
    arrowText: {},
    modalOverlay: {},
    modalContent: {},
    modalTitle: {},
    modalAction: {},
    modalActionText: {},
    modalCancel: {},
    modalCancelText: {},
  },
}));

jest.mock(
  'react-native',
  () => {
    const React = require('react');
    return {
      View: 'View',
      Text: 'Text',
      TouchableOpacity: 'TouchableOpacity',
      Image: 'Image',
      Modal: ({ visible, children }: any) =>
        visible
          ? React.createElement('View', { testID: 'modal-view' }, children)
          : null,
      Alert: { alert: jest.fn() },
      StyleSheet: {
        create: jest.fn(() => ({})),
      },
    };
  },
  { virtual: true },
);

const mockTheme = {
  theme: {
    colors: {
      surface: '#FFFFFF',
      border: '#E0E0E0',
      text: '#000000',
      textSecondary: '#666666',
      textMuted: '#999999',
      primary: '#007AFF',
      danger: '#FF3B30',
      warning: '#FF9500',
      success: '#34C759',
      shadow: '#000000',
    },
    spacing: { md: 12 },
    radius: { lg: 12 },
  },
};

(useAppTheme as jest.Mock).mockReturnValue(mockTheme);

const mockBook = {
  id: '1',
  title: 'Le meilleur livre',
  author: 'Auteur Test',
  cover_image: null,
  year: '2025',
  status: 'active',
};

describe('AdminBookCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('se rend sans erreur', () => {
    let instance: any;
    ReactTestRenderer.act(() => {
      instance = ReactTestRenderer.create(
        <AdminBookCard book={mockBook} onPress={jest.fn()} />,
      );
    });

    expect(instance).toBeDefined();
    expect(instance.root).toBeDefined();
  });

  it('appelle onPress avec l’identifiant du livre', () => {
    const onPress = jest.fn();
    let instance: any;

    ReactTestRenderer.act(() => {
      instance = ReactTestRenderer.create(
        <AdminBookCard book={mockBook} onPress={onPress} />,
      );
    });

    const card = instance.root.findByProps({ testID: 'book-item-1' });
    card.props.onPress();

    expect(onPress).toHaveBeenCalledWith('1');
  });

  it('ouvre le modal et appelle onArchive après action', () => {
    const onArchive = jest.fn();
    let instance: any;

    ReactTestRenderer.act(() => {
      instance = ReactTestRenderer.create(
        <AdminBookCard
          book={mockBook}
          onPress={jest.fn()}
          onArchive={onArchive}
        />,
      );
    });

    const card = instance.root.findByProps({ testID: 'book-item-1' });
    ReactTestRenderer.act(() => {
      card.props.onLongPress();
    });

    const modal = instance.root.findByProps({ testID: 'modal-view' });
    expect(modal).toBeDefined();

    const archiveButton = modal.findByProps({ testID: 'action-archive' });

    expect(archiveButton).toBeDefined();

    ReactTestRenderer.act(() => {
      archiveButton.props.onPress();
    });

    expect(onArchive).toHaveBeenCalledWith('1', 'active');
  });

  it('appelle Alert.alert et onDelete lorsque la suppression est confirmée', () => {
    const onDelete = jest.fn();
    const alertMock = jest.fn(
      (title: string, message: string, buttons: any[]) => {
        const deleteButton = buttons.find(
          button => button.style === 'destructive',
        );
        deleteButton.onPress();
      },
    );

    Alert.alert = alertMock;

    let instance: any;
    ReactTestRenderer.act(() => {
      instance = ReactTestRenderer.create(
        <AdminBookCard
          book={mockBook}
          onPress={jest.fn()}
          onDelete={onDelete}
        />,
      );
    });

    const card = instance.root.findByProps({ testID: 'book-item-1' });
    ReactTestRenderer.act(() => {
      card.props.onLongPress();
    });

    const modal = instance.root.findByProps({ testID: 'modal-view' });
    const deleteButton = modal.findByProps({ testID: 'action-delete' });

    expect(deleteButton).toBeDefined();

    ReactTestRenderer.act(() => {
      deleteButton.props.onPress();
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      'Confirmer la suppression',
      'Voulez-vous vraiment supprimer "Le meilleur livre" ?',
      expect.any(Array),
    );
    expect(onDelete).toHaveBeenCalledWith('1', 'Le meilleur livre');
  });
});
