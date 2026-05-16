import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  Button,
  StyleSheet,
  ScrollView,
} from "react-native";
import { MotiView } from "moti";
import { BookOpen } from "lucide-react-native"; // version RN des icônes

// --- Types ---
interface Book {
  id: string;
  title: string;
  author: string;
  cover: string;
  progress: number;
  category: string;
}

// --- Mock Data ---
const BOOKS: Book[] = [
  {
    id: "1",
    title: "Le Petit Prince",
    author: "Antoine de Saint-Exupéry",
    cover:
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=400",
    progress: 85,
    category: "Classiques",
  },
  // autres livres...
];

export default function App() {
  const [activeCategory, setActiveCategory] = useState("Tous");

  const filteredBooks =
    activeCategory === "Tous"
      ? BOOKS
      : BOOKS.filter((b) => b.category === activeCategory);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Ma Bibliothèque</Text>
      <TextInput placeholder="Rechercher un livre..." style={styles.search} />

      <Text style={styles.section}>En train de lire</Text>
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        style={styles.card}
      >
        <Image source={{ uri: BOOKS[0].cover }} style={styles.cover} />
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{BOOKS[0].title}</Text>
          <Text style={styles.author}>{BOOKS[0].author}</Text>
        </View>
      </MotiView>

      <Text style={styles.section}>Explorer</Text>
      {filteredBooks.map((book, idx) => (
        <MotiView
          key={book.id}
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: idx * 100 }}
          style={styles.card}
        >
          <Image source={{ uri: book.cover }} style={styles.cover} />
          <Text style={styles.title}>{book.title}</Text>
          <Text style={styles.author}>{book.author}</Text>
        </MotiView>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FDFCFB", padding: 16 },
  header: { fontSize: 24, fontWeight: "bold", marginBottom: 8 },
  search: {
    backgroundColor: "#F4F1ED",
    borderRadius: 12,
    padding: 8,
    marginBottom: 16,
  },
  section: { fontSize: 18, fontWeight: "600", marginVertical: 12 },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
  },
  cover: { width: 80, height: 120, borderRadius: 8, marginRight: 12 },
  title: { fontSize: 16, fontWeight: "bold" },
  author: { fontSize: 14, color: "#666" },
});
