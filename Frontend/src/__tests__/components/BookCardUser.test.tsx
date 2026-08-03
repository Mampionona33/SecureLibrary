import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Alert } from 'react-native';
import BookCardUser from '@components/BookCardUser';
import { useAppTheme } from '@theme/useAppTheme';

jest.mock('@theme/useAppTheme', () => ({
  useAppTheme: jest.fn(),
}));

jest.mock('@components/BookCardUser/styles', () => ({
  styles: {
    bookCard: {},
    coverContainer: {},
    coverPlaceholder: {},
    coverPlaceholderText: {},
    coverImage: {},
    downloadBadge: {},
    downloadBadgeText: {},
    bookInfo: {},
    bookTitle: {},
    bookAuthor: {},
    bookMeta: {},
    bookYear: {},
    categoryTag: {},
    categoryTagText: {},
    statusBadge: {},
    statusBadgeText: {},
    downloadRequiredBadge: {},
    downloadRequiredText: {},
    arrowContainer: {},
    arrowText: {},
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
      warning: '#FF9500',
      success: '#34C759',
    },
    spacing: { md: 12 },
    radius: { lg: 12 },
  },
};

(useAppTheme as jest.Mock).mockReturnValue(mockTheme);

const mockBook = {
  id: '42',
  title: 'Tintin au pays des tests',
  author: 'Hergé',
  category: 'Aventure',
  year: '1930',
  status: 'active',
  isDownloaded: true,
};

describe('BookCardUser', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('se rend sans erreur', () => {
    let instance: any;
    ReactTestRenderer.act(() => {
      instance = ReactTestRenderer.create(
        <BookCardUser book={mockBook} onPress={jest.fn()} />,
      );
    });

    expect(instance).toBeDefined();
    expect(instance.root).toBeDefined();
  });

  it('appelle onPress immédiatement si le livre est déjà téléchargé', () => {
    const onPress = jest.fn();
    let instance: any;

    ReactTestRenderer.act(() => {
      instance = ReactTestRenderer.create(
        <BookCardUser book={mockBook} onPress={onPress} />,
      );
    });

    const card = instance.root.findByProps({ testID: 'book-item-42' });
    ReactTestRenderer.act(() => {
      card.props.onPress();
    });

    expect(onPress).toHaveBeenCalledWith(mockBook);
  });

  it('demande le téléchargement et appelle onDownload puis onPress quand le livre n’est pas téléchargé', async () => {
    const onPress = jest.fn();
    const onDownload = jest.fn().mockResolvedValue(undefined);
    const book = { ...mockBook, isDownloaded: false };
    const alertMock = jest.fn(
      (title: string, message: string, buttons: any[]) => {
        buttons[1].onPress();
      },
    );

    Alert.alert = alertMock;

    let instance: any;
    await ReactTestRenderer.act(async () => {
      instance = ReactTestRenderer.create(
        <BookCardUser book={book} onPress={onPress} onDownload={onDownload} />,
      );
    });

    const card = instance.root.findByProps({ testID: 'book-item-42' });
    await ReactTestRenderer.act(async () => {
      await card.props.onPress();
    });

    expect(Alert.alert).toHaveBeenCalled();
    expect(onDownload).toHaveBeenCalledWith(book);
    expect(onPress).toHaveBeenCalledWith(book);
  });

  it('affiche le badge de téléchargement requis quand le livre n’est pas téléchargé', () => {
    const book = { ...mockBook, isDownloaded: false, isDownloading: false };
    let instance: any;

    ReactTestRenderer.act(() => {
      instance = ReactTestRenderer.create(
        <BookCardUser book={book} onPress={jest.fn()} />,
      );
    });

    const textNodes = instance.root.findAllByType('Text');
    const hasDownloadText = textNodes.some(
      (text: any) => text.props.children === '📥 Télécharger',
    );

    expect(hasDownloadText).toBe(true);
  });

  it('affiche un badge de téléchargement en cours lorsqu’il est en cours de téléchargement', () => {
    const book = { ...mockBook, isDownloaded: false, isDownloading: true };
    let instance: any;

    ReactTestRenderer.act(() => {
      instance = ReactTestRenderer.create(
        <BookCardUser book={book} onPress={jest.fn()} />,
      );
    });

    const textNodes = instance.root.findAllByType('Text');
    const hasLoadingText = textNodes.some(
      (text: any) => text.props.children === '⏳',
    );

    expect(hasLoadingText).toBe(true);
  });
});
