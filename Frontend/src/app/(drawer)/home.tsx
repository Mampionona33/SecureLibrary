import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  FlatList,
  Image,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Search, Plus, Download, CheckCircle } from "lucide-react-native";
import BookActions from "@/components/book-actions";
import { useRouter } from "expo-router";
import * as FileSystem from "expo-file-system/legacy";
import api from "@/services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

const CATEGORIES = ["Tous", "Développement", "Cuisine", "Sport", "IT"];

interface Book {
  id: string;
  title: string;
  author: string;
  category: string;
  cover_image: string | null;
  pdf_file: string | null;
  bgColor?: string;
}

export default function HomeScreen() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [localBooks, setLocalBooks] = useState<string[]>([]);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState("Tous");
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const BOOKS_DIR = `${FileSystem.documentDirectory}encrypted_books/`;

  const ensureDirectoryExists = async () => {
    const dirInfo = await FileSystem.getInfoAsync(BOOKS_DIR);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(BOOKS_DIR, { intermediates: true });
    }
  };

  const checkLocalFiles = async () => {
    try {
      const files = await FileSystem.readDirectoryAsync(BOOKS_DIR);
      setLocalBooks(files.map((f) => f.replace(".pdf", "")));
    } catch (e) {
      console.log("Erreur lecture fichiers locaux", e);
    }
  };

  const fetchBooks = async (isRefreshing = false) => {
    if (!isRefreshing) setLoading(true);
    try {
      const response = await api.get("/library/");
      setBooks(response.data);
      await checkLocalFiles();
    } catch (error) {
      console.error("Erreur lors du chargement des livres :", error);
      Alert.alert("Erreur", "Impossible de charger la bibliothèque.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    ensureDirectoryExists();
    fetchBooks();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchBooks(true);
  }, []);

  const downloadBook = async (book: Book) => {
    if (!book.pdf_file) {
      Alert.alert("Erreur", "Ce livre n'a pas de fichier associé.");
      return;
    }

    setDownloadingId(book.id);
    const fileUri = `${BOOKS_DIR}${book.id}.pdf`;
    const token = await AsyncStorage.getItem("accessToken");

    // Gestion des URLs relatives (si le backend ne renvoie pas l'URL complète)
    let downloadUrl = book.pdf_file;
    if (downloadUrl && downloadUrl.startsWith("/")) {
      const serverUrl = api.defaults.baseURL?.split("/api")[0];
      downloadUrl = `${serverUrl}${downloadUrl}`;
    }

    try {
      const downloadRes = await FileSystem.downloadAsync(
        downloadUrl!,
        fileUri,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (downloadRes.status === 200) {
        setLocalBooks((prev) => [...prev, book.id]);
        Alert.alert(
          "Succès",
          `${book.title} est maintenant disponible hors ligne.`,
        );
      }
    } catch (error) {
      console.error("Erreur téléchargement :", error);
      Alert.alert("Erreur", "Le téléchargement a échoué.");
    } finally {
      setDownloadingId(null);
    }
  };

  const filteredBooks = books.filter((book) => {
    const matchSearch = book.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchCategory =
      activeCategory === "Tous" || book.category === activeCategory;
    return matchSearch && matchCategory;
  });

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.categoriesContainer}>
        {CATEGORIES.map((cat) => {
          const isActive = cat === activeCategory;
          return (
            <TouchableOpacity
              key={cat}
              onPress={() => setActiveCategory(cat)}
              style={styles.categoryTab}
            >
              <Text
                style={[
                  styles.categoryText,
                  isActive && styles.activeCategoryText,
                ]}
              >
                {cat}
              </Text>
              {isActive && <View style={styles.activeIndicator} />}
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.whiteCardHeader}>
        <View style={styles.searchBarContainer}>
          <Search color="#B0B0C0" size={20} style={styles.searchIcon} />
          <TextInput
            placeholder="Rechercher un livre..."
            placeholderTextColor="#B0B0C0"
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>
    </View>
  );

  const renderBookItem = ({ item }: { item: Book }) => {
    const isDownloaded = localBooks.includes(item.id);
    const isDownloading = downloadingId === item.id;

    return (
      <View style={styles.bookRow}>
        <View style={styles.bookMainContent}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              if (isDownloaded) {
                router.push({
                  pathname: "/(drawer)/[id]",
                  params: { id: item.id, title: item.title },
                });
              } else {
                Alert.alert(
                  "Information",
                  "Veuillez télécharger le livre pour le lire.",
                );
              }
            }}
          >
            <View
              style={[
                styles.imageWrapper,
                { backgroundColor: item.bgColor || "#E2ECE9" },
              ]}
            >
              <Image
                source={{
                  uri: item.cover_image || "https://via.placeholder.com/150",
                }}
                style={styles.bookCover}
              />
            </View>
          </TouchableOpacity>
          <View style={styles.bookInfo}>
            <Text style={styles.bookCategory}>{item.category}</Text>
            <Text style={styles.bookTitle} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.bookAuthor}>{item.author}</Text>

            <View style={styles.statusContainer}>
              <TouchableOpacity
                style={styles.downloadIcon}
                onPress={() => {
                  if (isDownloaded) {
                    router.push({
                      pathname: "/(drawer)/[id]",
                      params: { id: item.id, title: item.title },
                    });
                  } else {
                    downloadBook(item);
                  }
                }}
                disabled={isDownloading}
              >
                {isDownloading ? (
                  <ActivityIndicator size="small" color="#2F66DD" />
                ) : isDownloaded ? (
                  <View style={styles.statusBadge}>
                    <CheckCircle color="#2F66DD" size={16} />
                    <Text style={[styles.statusText, { color: "#2F66DD" }]}>
                      Lire
                    </Text>
                  </View>
                ) : (
                  <Download color="#2F66DD" size={20} />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <BookActions />
      </View>
    );
  };

  const handleAddBook = () => {
    router.push("/add-book");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#2F66DD" />
      {loading && !refreshing ? (
        <ActivityIndicator
          size="large"
          color="#FFF"
          style={{ marginTop: 20 }}
        />
      ) : (
        <FlatList
          data={filteredBooks}
          keyExtractor={(item) => item.id}
          renderItem={renderBookItem}
          ListHeaderComponent={renderHeader}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#FFF"
            />
          }
          contentContainerStyle={styles.listContent}
          style={styles.mainContainer}
        />
      )}

      {/* ✅ Bouton flottant Ajouter */}
      <TouchableOpacity style={styles.addButton} onPress={handleAddBook}>
        <Plus color="#FFF" size={28} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#2F66DD" },
  mainContainer: { flex: 1, backgroundColor: "#FFF" },
  listContent: { backgroundColor: "#FFF", paddingBottom: 80 },
  headerContainer: { backgroundColor: "#2F66DD", paddingTop: 15 },
  categoriesContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  categoryTab: { alignItems: "center", paddingVertical: 5 },
  categoryText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 16,
    fontWeight: "500",
  },
  activeCategoryText: { color: "#FFF", fontWeight: "bold" },
  activeIndicator: {
    marginTop: 6,
    width: 14,
    height: 3,
    backgroundColor: "#FFF",
    borderRadius: 2,
  },
  whiteCardHeader: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingHorizontal: 20,
    paddingTop: 25,
    paddingBottom: 10,
  },
  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F5FA",
    borderRadius: 15,
    paddingHorizontal: 15,
    height: 50,
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 15, color: "#333" },
  bookRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F8F9FA",
  },
  bookMainContent: { flex: 1, flexDirection: "row", alignItems: "center" },
  imageWrapper: {
    width: 90,
    height: 105,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
  },
  bookCover: { width: 55, height: 75, borderRadius: 4 },
  bookInfo: { flex: 1, marginLeft: 20, justifyContent: "center" },
  bookCategory: { fontSize: 12, color: "#9A9A9A", marginBottom: 4 },
  bookTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1E2432",
    marginBottom: 6,
  },
  bookAuthor: { fontSize: 14, color: "#A5A6AE" },
  statusContainer: { marginTop: 5 },
  statusBadge: { flexDirection: "row", alignItems: "center" },
  statusText: {
    fontSize: 12,
    color: "#4CAF50",
    marginLeft: 5,
    fontWeight: "600",
  },
  downloadIcon: { alignSelf: "flex-start", paddingVertical: 5 },
  addButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#2F66DD",
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
});
