// screens/Admin/ManageBooks/index.tsx
import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBookStore } from '@store/useBookStore';
import { useAppTheme } from '@theme/useAppTheme';
import { styles } from './styles';

const ManageBooksScreen = ({ navigation }: any) => {
  const { books, loading, fetchBooks } = useBookStore();
  const { theme } = useAppTheme();
  const { colors, spacing, radius } = theme;

  const [filter, setFilter] = useState<'all' | 'active' | 'archived'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchBooks();
  }, []);

  const filteredBooks = useMemo(() => {
    let result = books;
    if (filter !== 'all') {
      result = result.filter((book) => book.status === filter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (book) =>
          book.title.toLowerCase().includes(q) ||
          book.author.toLowerCase().includes(q)
      );
    }
    return result;
  }, [books, filter, searchQuery]);

  const renderItem = ({ item }: { item: any }) => {
    const coverUri = item.cover_image ? item.cover_image : null;

    return (
      <TouchableOpacity
        testID={`book-item-${item.id}`}
        style={[
          styles.bookCard,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderRadius: radius.md,
            shadowColor: colors.shadow || '#000',
          },
        ]}
        onPress={() => navigation.navigate('EditBook', { bookId: item.id })}
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
          {/* Titre en haut */}
          <Text
            style={[styles.bookTitle, { color: colors.text }]}
            numberOfLines={1}
          >
            {item.title}
          </Text>

          {/* Auteur + Statut sur la même ligne */}
          <View style={styles.bookRow}>
            <Text
              style={[styles.bookAuthor, { color: colors.textSecondary }]}
              numberOfLines={1}
            >
              {item.author}
            </Text>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor:
                    item.status === 'active' ? colors.success : colors.danger,
                },
              ]}
            >
              <Text style={styles.statusBadgeText}>
                {item.status === 'active' ? 'Actif' : 'Archivé'}
              </Text>
            </View>
          </View>

          {/* Année en bas */}
          {item.year && (
            <Text style={[styles.bookYear, { color: colors.textMuted }]}>
              {item.year}
            </Text>
          )}
        </View>

        {/* Flèche pour indiquer la navigation */}
        <View style={styles.arrowContainer}>
          <Text style={[styles.arrowText, { color: colors.textMuted }]}>›</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={[styles.container, { padding: spacing.lg }]}>
        <View style={styles.header}>
          <Text testID="manage-books-title" style={[styles.title, { color: colors.text }]}>
            Gérer les Livres
          </Text>
          <TouchableOpacity
            testID="manage-books-add"
            style={[
              styles.addButton,
              {
                backgroundColor: colors.buttonPrimary,
                borderRadius: radius.md,
              },
            ]}
            onPress={() => navigation.navigate('CreateBook')}
          >
            <Text
              style={[styles.addButtonText, { color: colors.buttonPrimaryText }]}
            >
              +
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.filterContainer}>
          {(['all', 'active', 'archived'] as const).map((key) => {
            const labels = { all: 'Tous', active: 'Actifs', archived: 'Archivés' };
            const isActive = filter === key;
            return (
              <TouchableOpacity
                key={key}
                testID={`filter-${key}`}
                style={[
                  styles.filterButton,
                  isActive && styles.filterButtonActive,
                  { borderRadius: radius.sm, borderColor: colors.border },
                ]}
                onPress={() => setFilter(key)}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    {
                      color: isActive
                        ? colors.buttonPrimaryText
                        : colors.textSecondary,
                    },
                  ]}
                >
                  {labels[key]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TextInput
          testID="search-input"
          style={[
            styles.searchInput,
            {
              borderColor: colors.border,
              color: colors.text,
              backgroundColor: colors.inputBackground,
              borderRadius: radius.md,
            },
          ]}
          placeholder="Rechercher par titre ou auteur..."
          placeholderTextColor={colors.placeholder}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        {loading ? (
          <ActivityIndicator
            style={{ marginTop: spacing.xl }}
            size="large"
            color={colors.primary}
          />
        ) : (
          <FlatList
            data={filteredBooks}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <Text
                testID="books-empty"
                style={[styles.emptyText, { color: colors.textMuted }]}
              >
                Aucun livre trouvé.
              </Text>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default ManageBooksScreen;
