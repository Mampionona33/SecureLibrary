import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '@navigation/types';
import { useBookStore } from '@store/useBookStore';
import { useCategoryStore } from '@store/useCategoryStore';
import BookCardUser from '@components/BookCardUser';
import { apiClient } from '@api/client';
import { styles } from './styles';

type Props = NativeStackScreenProps<MainStackParamList, 'BookList'>;

const BookListScreen = ({ navigation }: Props) => {
  const { books, loading: booksLoading, fetchActiveBooks } = useBookStore();
  const { categories, loading: categoriesLoading, fetchCategories } = useCategoryStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filterMode, setFilterMode] = useState<'online' | 'local'>('online');

  // ✅ Par défaut, charger uniquement les livres actifs (online)
  useEffect(() => {
    fetchActiveBooks();
    fetchCategories();
  }, []);

  // ✅ Filtrer les livres selon le mode (online/local)
  const filteredBooks = useMemo(() => {
    let result = books;
    
    // Filtrer par catégorie
    if (selectedCategory !== 'all') {
      result = result.filter(book => book.category === selectedCategory);
    }

    // ✅ Filtrer par disponibilité locale
    if (filterMode === 'local') {
      // TODO: Vérifier si le fichier existe en local
      // Pour l'instant, on simule avec un flag
      result = result.filter(book => book.isDownloaded === true);
    }

    return result;
  }, [books, selectedCategory, filterMode]);

  const renderBookItem = ({ item }: { item: any }) => (
    <BookCardUser
      book={item}
      onPress={(bookId) => {
        const pdfUrl = item.pdf_file ? `${apiClient.defaults.baseURL}${item.pdf_file}` : null;
        navigation.navigate('BookReader', {
          bookId: item.id,
          title: item.title,
          fileUrl: pdfUrl,
        });
      }}
      showStatus={false}
      showCategory={true}
      showYear={true}
    />
  );

  const isLoading = booksLoading || categoriesLoading;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: '#f8fafc' }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📚 Bibliothèque</Text>
        <Text style={styles.headerSubtitle}>Parcourez et lisez vos livres</Text>
      </View>

      {/* ✅ Filtre : En ligne / Local */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterChip, filterMode === 'online' && styles.filterChipActive]}
          onPress={() => setFilterMode('online')}
        >
          <Text style={[styles.filterChipText, filterMode === 'online' && styles.filterChipTextActive]}>
            🌐 En ligne
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterChip, filterMode === 'local' && styles.filterChipActive]}
          onPress={() => setFilterMode('local')}
        >
          <Text style={[styles.filterChipText, filterMode === 'local' && styles.filterChipTextActive]}>
            📱 Local
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.categoriesWrapper}>
        <FlatList
          horizontal
          data={[{ id: 'all', name: 'Tous' }, ...categories]}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const isActive = selectedCategory === item.id;
            return (
              <TouchableOpacity
                style={[styles.categoryChip, isActive && styles.categoryChipActive]}
                onPress={() => setSelectedCategory(item.id)}
              >
                <Text style={[styles.categoryChipText, isActive && styles.categoryChipTextActive]}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      <View style={styles.countContainer}>
        <Text style={styles.countText}>
          {filteredBooks.length} livre{filteredBooks.length > 1 ? 's' : ''} trouvé{filteredBooks.length > 1 ? 's' : ''}
        </Text>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Chargement des livres...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredBooks}
          keyExtractor={(item) => item.id}
          renderItem={renderBookItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>📭</Text>
              <Text style={styles.emptyText}>Aucun livre dans cette catégorie</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

export default BookListScreen;
