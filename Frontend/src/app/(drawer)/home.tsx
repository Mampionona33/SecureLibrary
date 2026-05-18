import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  FlatList,
  Image,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Search, Plus } from "lucide-react-native";
import BookActions from "@/components/book-actions";

const CATEGORIES = ["Tous", "Développement", "Cuisine", "Sport", "IT"];

const BOOKS_DATA = [
  {
    id: "1",
    category: "Développement",
    title: "Introduction à React Native",
    author: "Josh Evans",
    image:
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=200&auto=format&fit=crop",
    bgColor: "#E2ECE9",
  },
  {
    id: "2",
    category: "Cuisine",
    title: "Recettes faciles",
    author: "Yusuf Nugraha",
    image:
      "https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=200&auto=format&fit=crop",
    bgColor: "#FCEAEB",
  },
  {
    id: "3",
    category: "Sport",
    title: "Fitness débutant",
    author: "Paranggeni",
    image:
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=200&auto=format&fit=crop",
    bgColor: "#E8E7FA",
  },
  {
    id: "4",
    category: "IT",
    title: "Sécurité réseau",
    author: "Anggit Yuniar",
    image:
      "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=200&auto=format&fit=crop",
    bgColor: "#FCEAEB",
  },
];

export default function HomeScreen() {
  const [activeCategory, setActiveCategory] = useState("Tous");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredBooks = BOOKS_DATA.filter((book) => {
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

  const renderBookItem = ({ item }: { item: (typeof BOOKS_DATA)[number] }) => (
    <TouchableOpacity style={styles.bookRow} activeOpacity={0.7}>
      <View style={[styles.imageWrapper, { backgroundColor: item.bgColor }]}>
        <Image source={{ uri: item.image }} style={styles.bookCover} />
      </View>
      <View style={styles.bookInfo}>
        <Text style={styles.bookCategory}>{item.category}</Text>
        <Text style={styles.bookTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.bookAuthor}>{item.author}</Text>
      </View>
      {/* ✅ Menu contextuel */}
      <BookActions />
    </TouchableOpacity>
  );

  const handleAddBook = () => {
    console.log("👉 Bouton Ajouter cliqué !");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#2F66DD" />
      <FlatList
        data={filteredBooks}
        keyExtractor={(item) => item.id}
        renderItem={renderBookItem}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        style={styles.mainContainer}
      />

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
