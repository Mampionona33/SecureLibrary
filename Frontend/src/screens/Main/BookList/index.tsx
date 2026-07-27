import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '@navigation/types';
import { useBookStore } from '@store/useBookStore';
import { useCategoryStore } from '@store/useCategoryStore';
import { useAuthStore } from '@store/useAuthStore';
import BookCardUser from '@components/BookCardUser';
import { apiClient } from '@api/client';
import RNBlobUtil from 'react-native-blob-util';
import NetInfo from '@react-native-community/netinfo';
import { styles } from './styles';

type Props = NativeStackScreenProps<MainStackParamList, 'BookList'>;

const BookListScreen = ({ navigation }: Props) => {
  const { books, loading: booksLoading, fetchActiveBooks, fetchBooks } = useBookStore();
  const { categories, loading: categoriesLoading, fetchCategories } = useCategoryStore();
  const { isStaff } = useAuthStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filterMode, setFilterMode] = useState<'online' | 'local'>('online');
  const [downloadingBooks, setDownloadingBooks] = useState<Set<string>>(new Set());
  const [localBooks, setLocalBooks] = useState<Set<string>>(new Set());
  const [isOnline, setIsOnline] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ✅ Vérifier la connexion et charger les livres
  useEffect(() => {
    const init = async () => {
      // Vérifier la connexion
      const netInfo = await NetInfo.fetch();
      setIsOnline(netInfo.isConnected ?? true);

      // Charger les livres uniquement si en ligne
      if (netInfo.isConnected) {
        console.log('📡 En ligne - Chargement des livres...');
        try {
          // Si admin/staff, charger tous les livres, sinon seulement les actifs
          if (isStaff) {
            await fetchBooks(true);
          } else {
            await fetchActiveBooks();
          }
          await fetchCategories();
        } catch (error) {
          console.error('❌ Erreur chargement:', error);
        }
      } else {
        console.log('📡 Hors-ligne - utilisation du cache');
      }

      // Vérifier les fichiers locaux
      await checkLocalFiles();
    };

    init();

    // Écouter les changements de connexion
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(state.isConnected ?? true);
      if (state.isConnected) {
        // Recharger quand la connexion revient
        console.log('📡 Connexion rétablie - Rechargement...');
        if (isStaff) {
          fetchBooks(true);
        } else {
          fetchActiveBooks();
        }
        fetchCategories();
      }
    });

    return () => unsubscribe();
  }, []);

  // ✅ Vérifier quels livres sont déjà téléchargés
  const checkLocalFiles = async () => {
    const localSet = new Set<string>();
    for (const book of books) {
      const fileName = `${book.id}.pdf`;
      const localPath = `${RNBlobUtil.fs.dirs.DocumentDir}/${fileName}`;
      const exists = await RNBlobUtil.fs.exists(localPath);
      if (exists) {
        localSet.add(book.id);
      }
    }
    setLocalBooks(localSet);
  };

  // ✅ Pull to Refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const netInfo = await NetInfo.fetch();
      setIsOnline(netInfo.isConnected ?? true);

      if (netInfo.isConnected) {
        console.log('🔄 Pull to refresh - Rechargement...');
        if (isStaff) {
          await fetchBooks(true);
        } else {
          await fetchActiveBooks();
        }
        await fetchCategories();
        await checkLocalFiles();
      } else {
        Alert.alert('Hors-ligne', 'Impossible de rafraîchir sans connexion internet.');
      }
    } catch (error) {
      console.error('❌ Erreur refresh:', error);
    } finally {
      setRefreshing(false);
    }
  }, [isStaff]);

  // ✅ Télécharger un livre via l'endpoint download_pdf
  const handleDownload = async (book: any) => {
    if (!isOnline) {
      Alert.alert('Hors-ligne', 'Vous devez être connecté à internet pour télécharger un livre.');
      return;
    }

    try {
      setDownloadingBooks(prev => new Set(prev).add(book.id));

      const baseUrl = apiClient.defaults.baseURL || 'http://localhost:8000/api';
      const pdfUrl = `${baseUrl}/library/books/${book.id}/download_pdf/`;
      
      console.log('📥 Téléchargement du PDF depuis:', pdfUrl);

      const response = await apiClient.get(pdfUrl, {
        responseType: 'arraybuffer',
      });

      const base64 = btoa(
        new Uint8Array(response.data).reduce(
          (data, byte) => data + String.fromCharCode(byte),
          ''
        )
      );

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
    
    if (selectedCategory !== 'all') {
      result = result.filter(book => book.category === selectedCategory);
    }

    if (filterMode === 'local') {
      result = result.filter(book => localBooks.has(book.id));
    }

    return result;
  }, [books, selectedCategory, filterMode, localBooks]);

  // ✅ Gérer le clic sur un livre
  const handleBookPress = (book: any) => {
    if (localBooks.has(book.id)) {
      const fileName = `${book.id}.pdf`;
      const localPath = `${RNBlobUtil.fs.dirs.DocumentDir}/${fileName}`;
      
      navigation.navigate('BookReader', {
        bookId: book.id,
        title: book.title,
        fileUrl: `file://${localPath}`,
      });
      return;
    }

    if (!isOnline) {
      Alert.alert('Hors-ligne', 'Ce livre n\'est pas disponible hors-ligne.');
      return;
    }

    Alert.alert(
      'Téléchargement requis',
      `"${book.title}" n'est pas disponible en local. Voulez-vous le télécharger ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Télécharger', onPress: () => handleDownload(book) },
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
        <Text style={[styles.headerSubtitle, { color: isOnline ? '#22c55e' : '#ef4444' }]}>
          {isOnline ? '🟢 En ligne' : '🔴 Hors-ligne'}
        </Text>
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
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#3b82f6']}
              tintColor="#3b82f6"
            />
          }
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
