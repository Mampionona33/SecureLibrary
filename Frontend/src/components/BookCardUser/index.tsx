// components/BookCardUser/index.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, Alert } from 'react-native';
import RNBlobUtil from 'react-native-blob-util';
import { useAppTheme } from '@theme/useAppTheme';
import { styles } from './styles';

interface BookCardUserProps {
  book: any;
  onPress: (book: any) => void;
  onDownload?: (book: any) => Promise<void>;
  showStatus?: boolean;
  showCategory?: boolean;
  showYear?: boolean;
}

const BookCardUser: React.FC<BookCardUserProps> = ({
  book,
  onPress,
  onDownload,
  showStatus = false,
  showCategory = true,
  showYear = true,
}) => {
  const { theme } = useAppTheme();
  const { colors } = theme;
  const isDownloaded = book.isDownloaded || false;
  const isDownloading = book.isDownloading || false;

  const coverUri = book.cover_image ? book.cover_image : null;

  const handlePress = async () => {
    if (isDownloaded) {
      onPress(book);
      return;
    }

    Alert.alert(
      'Téléchargement requis',
      `Le livre "${book.title}" n'est pas disponible en local. Voulez-vous le télécharger pour le lire ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Télécharger',
          onPress: async () => {
            if (onDownload) {
              await onDownload(book);
              onPress(book);
            }
          },
        },
      ]
    );
  };

  return (
    <TouchableOpacity
      testID={`book-item-${book.id}`}
      style={[
        styles.bookCard,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          shadowColor: colors.shadow || '#000',
        },
      ]}
      onPress={handlePress}
      activeOpacity={0.7}
      disabled={isDownloading}
    >
      <View style={styles.coverContainer}>
        {coverUri ? (
          <Image
            source={{ uri: coverUri }}
            style={styles.coverImage}
            resizeMode="cover"
          />
        ) : (
          <View
            style={[
              styles.coverPlaceholder,
              {
                backgroundColor: colors.primary + '20',
              },
            ]}
          >
            <Text style={[styles.coverPlaceholderText, { color: colors.primary }]}>
              📚
            </Text>
          </View>
        )}

        {isDownloaded && (
          <View style={[styles.downloadBadge, { backgroundColor: colors.success }]}>
            <Text style={styles.downloadBadgeText}>✓</Text>
          </View>
        )}
        {isDownloading && (
          <View style={[styles.downloadBadge, { backgroundColor: colors.warning }]}>
            <Text style={styles.downloadBadgeText}>⏳</Text>
          </View>
        )}
      </View>

      <View style={styles.bookInfo}>
        <Text
          style={[styles.bookTitle, { color: colors.text }]}
          numberOfLines={2}
        >
          {book.title}
        </Text>

        <Text
          style={[styles.bookAuthor, { color: colors.textSecondary }]}
          numberOfLines={1}
        >
          {book.author}
        </Text>

        <View style={styles.bookMeta}>
          {showYear && book.year && (
            <Text style={[styles.bookYear, { color: colors.textMuted }]}>
              {book.year}
            </Text>
          )}
          {showCategory && book.category && (
            <View
              style={[
                styles.categoryTag,
                {
                  backgroundColor: colors.primary + '20',
                },
              ]}
            >
              <Text
                style={[styles.categoryTagText, { color: colors.primary }]}
                numberOfLines={1}
              >
                {book.category}
              </Text>
            </View>
          )}
          {showStatus && (
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor:
                    book.status === 'active' ? colors.success : colors.danger,
                },
              ]}
            >
              <Text style={styles.statusBadgeText}>
                {book.status === 'active' ? 'Actif' : 'Archivé'}
              </Text>
            </View>
          )}
          {!isDownloaded && !isDownloading && (
            <View style={[styles.downloadRequiredBadge, { backgroundColor: colors.warning + '20' }]}>
              <Text style={[styles.downloadRequiredText, { color: colors.warning }]}>
                📥 Télécharger
              </Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.arrowContainer}>
        <Text style={[styles.arrowText, { color: colors.textMuted }]}>›</Text>
      </View>
    </TouchableOpacity>
  );
};

export default BookCardUser;
