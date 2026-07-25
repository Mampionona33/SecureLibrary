import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '@navigation/types';
import { useBookStore } from '@store/useBookStore';
import { useCategoryStore } from '@store/useCategoryStore';
import BookCardUser from '@components/BookCardUser';
import { styles } from './styles';

type Props = NativeStackScreenProps<MainStackParamList, 'BookList'>;

const BookListScreen = ({ navigation }: Props) => {
  const { books, loading: booksLoading, fetchBooks } = useBookStore();
  const { categories, loading: categoriesLoading, fetchCategories } = useCategoryStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    fetchBooks();
    fetchCategories();
  }, []);

  const filteredBooks = useMemo(() => {
    if (selectedCategory === 'all') return books;
    return books.filter(book => book.category === selectedCategory);
  }, [books, selectedCategory]);

  const renderBookItem = ({ item }: { item: any }) => (
    <BookCardUser
      book={item}
      onPress={(bookId) =>
        navigation.navigate('BookReader', {
          bookId: item.id,
          title: item.title,
          fileUrl: item.pdf_file,
        })
      }
      showStatus={false}
      showCategory={true}
      showYear={true}
    />
  );

  const isLoading = booksLoading || categoriesLoading;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: '#f8fafc' }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📚 Bibliothèque</Text>
        <Text style={styles.headerSubtitle}>Parcourez et lisez vos livres</Text>
      </View>

      {/* Catégories - Version horizontale très compacte */}
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

      {/* Nombre de livres */}
      <View style={styles.countContainer}>
        <Text style={styles.countText}>
          {filteredBooks.length} livre{filteredBooks.length > 1 ? 's' : ''} trouvé{filteredBooks.length > 1 ? 's' : ''}
        </Text>
      </View>

      {/* Liste des livres */}
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
