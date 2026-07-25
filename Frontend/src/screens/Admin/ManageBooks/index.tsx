import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBookStore } from '@store/useBookStore';
import { useAppTheme } from '@theme/useAppTheme';
import AdminBookCard from '@components/AdminBookCard'; // ✅ Nom modifié
import { styles } from './styles';

const ManageBooksScreen = ({ navigation }: any) => {
  const { books, loading, fetchBooks, deleteBook, archiveBook } = useBookStore();
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

  const handleBookPress = (bookId: string) => {
    navigation.navigate('EditBook', { bookId });
  };

  const handleArchive = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'archived' : 'active';
    try {
      await archiveBook(id, newStatus);
      await fetchBooks();
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de changer le statut.');
    }
  };

  const handleDelete = async (id: string, title: string) => {
    try {
      await deleteBook(id);
      await fetchBooks();
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de supprimer ce livre.');
    }
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
            renderItem={({ item }) => (
              <AdminBookCard
                book={item}
                onPress={handleBookPress}
                onArchive={handleArchive}
                onDelete={handleDelete}
              />
            )}
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
