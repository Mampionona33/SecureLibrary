import React, { useState, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '@navigation/types';

// Co-localisation
import { MOCK_CATEGORIES, MOCK_BOOKS, Book } from './mockData';
import { styles } from './styles';

type Props = NativeStackScreenProps<MainStackParamList, 'BookList'>;

const BookListScreen = ({ navigation }: Props) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Filtrage dynamique des livres selon la catégorie active
  const filteredBooks = useMemo(() => {
    if (selectedCategory === 'all') return MOCK_BOOKS;
    return MOCK_BOOKS.filter(book => book.categoryId === selectedCategory);
  }, [selectedCategory]);

  // Rendu d'une carte de livre
  const renderBookItem = ({ item }: { item: Book }) => (
    <TouchableOpacity 
      testID={`booklist-book-${item.id}`}
      style={styles.bookCard}
      onPress={() => navigation.navigate('BookReader', {
        bookId: item.id,
        title: item.title,
        fileUrl: item.fileUrl
      })}
    >
      <View style={styles.coverContainer}>
        <Text style={styles.coverEmoji}>{item.coverEmoji}</Text>
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.bookTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.bookAuthor}>{item.author}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Barre supérieure d'en-tête */}
      <View style={styles.header}>
        <Text testID="booklist-header-title" style={styles.headerTitle}>Bibliothèque Archives</Text>
        <Text testID="booklist-header-subtitle" style={styles.headerSubtitle}>Sélectionnez un document crypté à décoder</Text>
      </View>

      {/* Barre de filtrage horizontale des catégories */}
      <View style={{ height: 60 }}>
        <FlatList
          testID="booklist-categories"
          data={MOCK_CATEGORIES}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const isActive = selectedCategory === item.id;
            return (
              <TouchableOpacity
                testID={`booklist-category-${item.id}`}
                style={[styles.categoryBadge, isActive && styles.categoryBadgeActive]}
                onPress={() => setSelectedCategory(item.id)}
              >
                <Text style={[styles.categoryText, isActive && styles.categoryTextActive]}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Liste principale des livres */}
      <FlatList
        testID="booklist-books"
        data={filteredBooks}
        keyExtractor={(item) => item.id}
        renderItem={renderBookItem}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <Text testID="booklist-empty" style={styles.emptyText}>Aucun document dans cette section.</Text>
        }
      />
    </SafeAreaView>
  );
};

export default BookListScreen;
