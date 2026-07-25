import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, Alert } from 'react-native';
import RNBlobUtil from 'react-native-blob-util';
import { useAppTheme } from '@theme/useAppTheme';
import { styles } from './styles';

interface BookCardUserProps {
  book: any;
  onPress: (bookId: string) => void;
  onDownload?: (bookId: string) => Promise<void>;
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
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const coverUri = book.cover_image ? book.cover_image : null;

  // Vérifier si le fichier existe en local
  const checkLocalFile = async () => {
    if (!book.pdf_file) return;
    
    try {
      const fileName = book.pdf_file.split('/').pop() || `${book.id}.pdf`;
      const localPath = `${RNBlobUtil.fs.dirs.DocumentDir}/${fileName}`;
      const exists = await RNBlobUtil.fs.exists(localPath);
      setIsDownloaded(exists);
    } catch (error) {
      console.error('Erreur vérification fichier local:', error);
      setIsDownloaded(false);
    }
  };

  useEffect(() => {
    checkLocalFile();
  }, [book.pdf_file]);

  const handlePress = async () => {
    // Si le livre est déjà téléchargé, on ouvre directement
    if (isDownloaded) {
      onPress(book.id);
      return;
    }

    // Si le livre n'est pas téléchargé, on propose de le télécharger
    if (onDownload) {
      Alert.alert(
        'Téléchargement requis',
        `Le livre "${book.title}" n'est pas disponible en local. Voulez-vous le télécharger pour le lire ?`,
        [
          { text: 'Annuler', style: 'cancel' },
          {
            text: 'Télécharger',
            onPress: async () => {
              setIsDownloading(true);
              try {
                await onDownload(book.id);
                setIsDownloaded(true);
                // Après téléchargement, ouvrir le livre
                onPress(book.id);
              } catch (error) {
                Alert.alert('Erreur', 'Impossible de télécharger le livre.');
              } finally {
                setIsDownloading(false);
              }
            },
          },
        ]
      );
    } else {
      // Fallback: naviguer vers le lecteur qui gérera le téléchargement
      onPress(book.id);
    }
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
      {/* Image de couverture */}
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
        
        {/* Badge de statut de téléchargement */}
        {isDownloaded && (
          <View style={styles.downloadedBadge}>
            <Text style={styles.downloadedBadgeText}>✓</Text>
          </View>
        )}
        {isDownloading && (
          <View style={styles.downloadingBadge}>
            <Text style={styles.downloadingBadgeText}>⏳</Text>
          </View>
        )}
      </View>

      {/* Informations du livre */}
      <View style={styles.bookInfo}>
        {/* Titre */}
        <Text
          style={[styles.bookTitle, { color: colors.text }]}
          numberOfLines={2}
        >
          {book.title}
        </Text>

        {/* Auteur */}
        <Text
          style={[styles.bookAuthor, { color: colors.textSecondary }]}
          numberOfLines={1}
        >
          {book.author}
        </Text>

        {/* Métadonnées */}
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

      {/* Flèche pour indiquer la navigation */}
      <View style={styles.arrowContainer}>
        <Text style={[styles.arrowText, { color: colors.textMuted }]}>›</Text>
      </View>
    </TouchableOpacity>
  );
};

export default BookCardUser;
