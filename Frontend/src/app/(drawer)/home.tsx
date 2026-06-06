import React, { useState, useCallback } from "react";
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
  ImageBackground,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Search, Plus, Download, CheckCircle } from "lucide-react-native";
import BookActions from "@/components/book-actions";
import { useRouter } from "expo-router";

// Import de la NOUVELLE API pour la gestion locale ultra-rapide
import { File, Directory, Paths } from "expo-file-system";
// Import ciblé de l'API Legacy UNIQUEMENT pour la requête réseau (téléchargement)
import * as FileSystemLegacy from "expo-file-system/legacy";

import api from "@/services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";

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

  // Objet Directory moderne
  const BOOKS_DIR = new Directory(Paths.document, "books");

  const ensureDirectoryExists = () => {
    // Vérification et création synchrones (Nouvelle API)
    if (!BOOKS_DIR.exists) {
      BOOKS_DIR.create();
    }
  };

  const checkLocalFiles = (currentBooks: Book[]) => {
    try {
      if (!BOOKS_DIR.exists) return;

      // Vérification synchrone instantanée avec .exists
      const downloadedIds = currentBooks
        .filter((book) => new File(BOOKS_DIR, `${book.id}.pdf`).exists)
        .map((book) => book.id);

      setLocalBooks(downloadedIds);
    } catch (e) {
      console.log("Erreur lecture fichiers locaux", e);
    }
  };

  const fetchBooks = async (isRefreshing = false) => {
    if (!isRefreshing) setLoading(true);

    try {
      const response = await api.get("/library/");
      const fetchedBooks = response.data;
      setBooks(fetchedBooks);

      checkLocalFiles(fetchedBooks);
    } catch (error: any) {
      console.error(
        "ERREUR LORS DU CHARGEMENT :",
        error.response?.data || error.message,
      );
      Alert.alert("Erreur", "Impossible de charger la bibliothèque.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      ensureDirectoryExists();
      fetchBooks();
    }, []),
  );

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

    // Création de l'objet File moderne
    const bookFile = new File(BOOKS_DIR, `${book.id}.pdf`);
    const token = await AsyncStorage.getItem("accessToken");

    let downloadUrl = book.pdf_file;
    if (downloadUrl && downloadUrl.startsWith("/")) {
      const serverUrl = api.defaults.baseURL?.split("/api")[0];
      downloadUrl = `${serverUrl}${downloadUrl}`;
    }

    try {
      // Utilisation de l'outil réseau (Legacy) en lui passant le chemin (URI) du fichier moderne
      await FileSystemLegacy.downloadAsync(downloadUrl!, bookFile.uri, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setLocalBooks((prev) => [...prev, book.id]);
      Alert.alert(
        "Succès",
        `${book.title} est maintenant disponible hors ligne.`,
      );
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
    <View style={homeStyles.headerContainer}>
      <View style={homeStyles.categoriesContainer}>
        {CATEGORIES.map((cat) => {
          const isActive = cat === activeCategory;
          return (
            <TouchableOpacity
              key={cat}
              onPress={() => setActiveCategory(cat)}
              style={homeStyles.categoryTab}
            >
              <Text
                style={[
                  homeStyles.categoryText,
                  isActive && homeStyles.activeCategoryText,
                ]}
              >
                {cat}
              </Text>
              {isActive && <View style={homeStyles.activeIndicator} />}
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={homeStyles.whiteCardHeader}>
        <View style={homeStyles.searchBarContainer}>
          <Search color="#B0B0C0" size={20} style={homeStyles.searchIcon} />
          <TextInput
            placeholder="Rechercher un livre..."
            placeholderTextColor="#B0B0C0"
            style={homeStyles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>
    </View>
  );

  const deleteBookFromDisk = async (bookId: string, bookTitle: string) => {
    const bookFile = new File(BOOKS_DIR, `${bookId}.pdf`);
    try {
      if (bookFile.exists) {
        bookFile.delete(); // Suppression synchrone de la nouvelle API
      }
      setLocalBooks((prev) => prev.filter((id) => id !== bookId));
      Alert.alert(
        "Succès",
        `La version locale de "${bookTitle}" a été supprimée.`,
      );
    } catch (error) {
      console.error("Erreur suppression disque :", error);
      Alert.alert("Erreur", "Impossible de supprimer le fichier local.");
    }
  };

  const deleteBookFromServer = async (bookId: string, bookTitle: string) => {
    try {
      await api.delete(`/library/${bookId}/`);
      setBooks((prev) => prev.filter((b) => b.id !== bookId));
      setLocalBooks((prev) => prev.filter((id) => id !== bookId));

      const bookFile = new File(BOOKS_DIR, `${bookId}.pdf`);
      if (bookFile.exists) {
        bookFile.delete();
      }

      Alert.alert(
        "Succès",
        `Le livre "${bookTitle}" a été supprimé du serveur.`,
      );
    } catch (error) {
      console.error("Erreur suppression serveur :", error);
      Alert.alert("Erreur", "Échec de la suppression sur le serveur.");
    }
  };

  const renderEmptyState = () => (
    <ImageBackground
      source={require("../../../assets/images/no_book_found.png")}
      style={homeStyles.emptyBackground}
    >
      <View style={homeStyles.emptyOverlay}>
        <Text style={homeStyles.emptyText}>
          Oups ! Votre étagère est déserte... 🌵
        </Text>
        <Text style={homeStyles.emptySubText}>
          Aucun livre n'a été trouvé ici. C'est peut-être le moment idéal pour
          en ajouter un nouveau trésor !
        </Text>
      </View>
    </ImageBackground>
  );

  const renderBookItem = ({ item }: { item: Book }) => {
    const isDownloaded = localBooks.includes(item.id);
    const isDownloading = downloadingId === item.id;

    return (
      <View style={homeStyles.bookRow}>
        <View style={homeStyles.bookMainContent}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              if (isDownloaded) {
                router.push({
                  pathname: "/(drawer)/reader/[id]",
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
                homeStyles.imageWrapper,
                { backgroundColor: item.bgColor || "#E2ECE9" },
              ]}
            >
              <Image
                source={{
                  uri: item.cover_image || "https://via.placeholder.com/150",
                }}
                style={homeStyles.bookCover}
              />
            </View>
          </TouchableOpacity>
          <View style={homeStyles.bookInfo}>
            <Text style={homeStyles.bookCategory}>{item.category}</Text>
            <Text style={homeStyles.bookTitle} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={homeStyles.bookAuthor}>{item.author}</Text>

            <View style={homeStyles.statusContainer}>
              <TouchableOpacity
                style={homeStyles.downloadIcon}
                onPress={async () => {
                  if (isDownloaded) {
                    router.push({
                      pathname: "/(drawer)/reader/[id]",
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
                  <View style={homeStyles.statusBadge}>
                    <CheckCircle color="#2F66DD" size={16} />
                    <Text style={[homeStyles.statusText, { color: "#2F66DD" }]}>
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
        <BookActions
          isDownloaded={isDownloaded}
          onDeleteFromDisk={() => deleteBookFromDisk(item.id, item.title)}
          onDeleteFromServer={() => deleteBookFromServer(item.id, item.title)}
        />
      </View>
    );
  };

  const handleAddBook = () => {
    router.push("/add-book");
  };

  return (
    <SafeAreaView style={homeStyles.safeArea}>
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
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#FFF"
            />
          }
          contentContainerStyle={homeStyles.listContent}
          style={homeStyles.mainContainer}
        />
      )}

      <TouchableOpacity style={homeStyles.addButton} onPress={handleAddBook}>
        <Plus color="#FFF" size={28} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const homeStyles = StyleSheet.create({
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
  emptyBackground: {
    flex: 1,
    height: 450,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 20,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  emptyOverlay: {
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    padding: 25,
    marginHorizontal: 20,
    borderRadius: 15,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1E2432",
    textAlign: "center",
    marginBottom: 10,
  },
  emptySubText: {
    fontSize: 16,
    color: "#9A9A9A",
    textAlign: "center",
    lineHeight: 22,
  },
});
