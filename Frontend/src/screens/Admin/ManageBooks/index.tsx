// screens/Admin/ManageBooks/index.tsx
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

  const handleDelete = (id: string, title: string) => {
    Alert.alert(
      'Confirmer la suppression',
      `Voulez-vous vraiment supprimer "${title}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteBook(id);
              await fetchBooks();
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de supprimer ce livre.');
            }
          },
        },
      ]
    );
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

  const renderItem = ({ item }: { item: any }) => (
    <View testID={`book-item-${item.id}`} style={[styles.bookItem, { borderBottomColor: colors.border }]}>
      <View style={styles.bookInfo}>
        <Text style={[styles.bookTitle, { color: colors.text }]}>{item.title}</Text>
        <Text style={[styles.bookAuthor, { color: colors.textSecondary }]}>{item.author}</Text>
        <View style={styles.bookMeta}>
          <Text style={[styles.bookDate, { color: colors.textMuted }]}>
            {new Date(item.createdAt).toLocaleDateString()}
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
            <Text style={styles.statusText}>
              {item.status === 'active' ? 'Actif' : 'Archivé'}
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.bookActions}>
        <TouchableOpacity
          testID={`book-edit-${item.id}`}
          style={[styles.actionButton, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate('EditBook', { bookId: item.id })}
        >
          <Text style={styles.actionText}>✏️</Text>
        </TouchableOpacity>
        <TouchableOpacity
          testID={`book-archive-${item.id}`}
          style={[styles.actionButton, { backgroundColor: colors.warning }]}
          onPress={() => handleArchive(item.id, item.status)}
        >
          <Text style={styles.actionText}>
            {item.status === 'active' ? '📁' : '📂'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          testID={`book-delete-${item.id}`}
          style={[styles.actionButton, { backgroundColor: colors.danger }]}
          onPress={() => handleDelete(item.id, item.title)}
        >
          <Text style={styles.actionText}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={[styles.container, { padding: spacing.lg }]}>
        <View style={styles.header}>
          <Text testID="manage-books-title" style={[styles.title, { color: colors.text }]}>
            Gérer les Livres
          </Text>
          <TouchableOpacity
            testID="manage-books-add"
            style={[styles.addButton, { backgroundColor: colors.buttonPrimary, borderRadius: radius.md }]}
            onPress={() => navigation.navigate('CreateBook')}
          >
            <Text style={[styles.addButtonText, { color: colors.buttonPrimaryText }]}>+</Text>
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
                    { color: isActive ? colors.buttonPrimaryText : colors.textSecondary },
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
          <ActivityIndicator style={{ marginTop: spacing.xl }} size="large" color={colors.primary} />
        ) : (
          <FlatList
            data={filteredBooks}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={
              <Text testID="books-empty" style={[styles.emptyText, { color: colors.textMuted }]}>
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
