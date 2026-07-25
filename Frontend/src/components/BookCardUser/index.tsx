import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useAppTheme } from '@theme/useAppTheme';
import { styles } from './styles';

interface BookCardUserProps {
  book: any;
  onPress: (bookId: string) => void;
  showStatus?: boolean;
  showCategory?: boolean;
  showYear?: boolean;
}

const BookCardUser: React.FC<BookCardUserProps> = ({
  book,
  onPress,
  showStatus = false,
  showCategory = true,
  showYear = true,
}) => {
  const { theme } = useAppTheme();
  const { colors } = theme;

  const coverUri = book.cover_image ? book.cover_image : null;

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
      onPress={() => onPress(book.id)}
      activeOpacity={0.7}
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
