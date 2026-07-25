import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '@navigation/types';
import { useBookStore } from '@store/useBookStore';
import { useCategoryStore } from '@store/useCategoryStore';
import BookCardUser from '@components/BookCardUser';
import { apiClient } from '@api/client';
import RNBlobUtil from 'react-native-blob-util';
import { styles } from './styles';

type Props = NativeStackScreenProps<MainStackParamList, 'BookList'>;

const BookListScreen = ({ navigation }: Props) => {
  const { books, loading: booksLoading, fetchActiveBooks } = useBookStore();
  const { categories, loading: categoriesLoading, fetchCategories } = useCategoryStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filterMode, setFilterMode] = useState<'online' | 'local'>('online');
  const [downloadingBooks, setDownloadingBooks] = useState<Set<string>>(new Set());
  const [localBooks, setLocalBooks] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchActiveBooks();
    fetchCategories();
    checkLocalFiles();
  }, []);

  // ✅ Vérifier quels livres sont déjà téléchargés
  const checkLocalFiles = async () => {
    const localSet = new Set<string>();
    for (const book of books) {
      // Vérifier par ID dans le dossier DocumentDir
      const fileName = `${book.id}.pdf`;
      const localPath = `${RNBlobUtil.fs.dirs.DocumentDir}/${fileName}`;
      const exists = await RNBlobUtil.fs.exists(localPath);
      if (exists) {
        localSet.add(book.id);
      }
    }
    setLocalBooks(localSet);
  };

  // ✅ Télécharger un livre via l'endpoint download_pdf
  const handleDownload = async (book: any) => {
    try {
      setDownloadingBooks(prev => new Set(prev).add(book.id));

      // ✅ Utiliser l'endpoint dédié pour télécharger le PDF
      const baseUrl = apiClient.defaults.baseURL || 'http://localhost:8000/api';
      const pdfUrl = `${baseUrl}/library/books/${book.id}/download_pdf/`;
      
      console.log('📥 Téléchargement du PDF depuis:', pdfUrl);

      const response = await apiClient.get(pdfUrl, {
        responseType: 'arraybuffer',
      });

      // Convertir en base64
      const base64 = btoa(
        new Uint8Array(response.data).reduce(
          (data, byte) => data + String.fromCharCode(byte),
          ''
        )
      );

      // Sauvegarder en local
      const fileName = `${book.id}.pdf`;
      const localPath = `${RNBlobUtil.fs.dirs.DocumentDir}/${fileName}`;
      await RNBlobUtil.fs.writeFile(localPath, base64, 'base64');

      console.log('✅ Fichier téléchargé:', localPath);

      setLocalBooks(prev => new Set(prev).add(book.id));
      
      Alert.alert('Succès', `"${book.title}" a été téléchargé avec succès !`);

      // ✅ Ouvrir le livre après téléchargement
      navigation.navigate('BookReader', {
        bookId: book.id,
        title: book.title,
        fileUrl: `file://${localPath}`,
      });

    } catch (error) {
      console.error('❌ Erreur téléchargement:', error);
      Alert.alert('Erreur', 'Impossible de télécharger le livre. Vérifiez que le fichier existe sur le serveur.');
    } finally {
      setDownloadingBooks(prev => {
        const newSet = new Set(prev);
        newSet.delete(book.id);
        return newSet;
      });
    }
  };

  // ✅ Filtrer les livres selon le mode (online/local)
  const filteredBooks = useMemo(() => {
    let result = books;
    
    // Filtrer par catégorie
    if (selectedCategory !== 'all') {
      result = result.filter(book => book.category === selectedCategory);
    }

    // Filtrer par disponibilité locale
    if (filterMode === 'local') {
      result = result.filter(book => localBooks.has(book.id));
    }

    return result;
  }, [books, selectedCategory, filterMode, localBooks]);

  // ✅ Gérer le clic sur un livre
  const handleBookPress = (book: any) => {
    // Si le livre est déjà en local, l'ouvrir directement
    if (localBooks.has(book.id)) {
      const fileName = `${book.id}.pdf`;
      const localPath = `${RNBlobUtil.fs.dirs.DocumentDir}/${fileName}`;
      const pdfUrl = `file://${localPath}`;
      
      navigation.navigate('BookReader', {
        bookId: book.id,
        title: book.title,
        fileUrl: pdfUrl,
      });
      return;
    }

    // Sinon, demander de télécharger
    Alert.alert(
      'Téléchargement requis',
      `"${book.title}" n'est pas disponible en local. Voulez-vous le télécharger ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Télécharger', 
          onPress: () => handleDownload(book) 
        },
      ]
    );
  };

  const renderBookItem = ({ item }: { item: any }) => (
    <BookCardUser
      book={{
        ...item,
        isDownloaded: localBooks.has(item.id),
        isDownloading: downloadingBooks.has(item.id),
      }}
      onPress={() => handleBookPress(item)}
      onDownload={() => handleDownload(item)}
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

      {/* Filtre : En ligne / Local */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterChip, filterMode === 'online' && styles.filterChipActive]}
          onPress={() => setFilterMode('online')}
        >
          <Text style={[styles.filterChipText, filterMode === 'online' && styles.filterChipTextActive]}>
            🌐 En ligne ({books.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterChip, filterMode === 'local' && styles.filterChipActive]}
          onPress={() => setFilterMode('local')}
        >
          <Text style={[styles.filterChipText, filterMode === 'local' && styles.filterChipTextActive]}>
            📱 Local ({localBooks.size})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Catégories */}
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
              <Text style={styles.emptyText}>
                {filterMode === 'local' 
                  ? 'Aucun livre téléchargé en local' 
                  : 'Aucun livre dans cette catégorie'}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

export default BookListScreen;
