import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { File, Image as ImageIcon, Save } from "lucide-react-native";

export default function AddBookScreen() {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [author, setAuthor] = useState("");
  const [pdfPath, setPdfPath] = useState("");
  const [coverImage, setCoverImage] = useState("");

  const handleSave = () => {
    console.log("📚 Nouveau livre ajouté :", {
      title,
      category,
      author,
      pdfPath,
      coverImage,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>Ajouter un livre</Text>

        {/* Nom du livre */}
        <TextInput
          style={styles.input}
          placeholder="Nom du livre"
          value={title}
          onChangeText={setTitle}
        />

        {/* Catégorie */}
        <TextInput
          style={styles.input}
          placeholder="Catégorie"
          value={category}
          onChangeText={setCategory}
        />

        {/* Auteur */}
        <TextInput
          style={styles.input}
          placeholder="Auteur"
          value={author}
          onChangeText={setAuthor}
        />

        {/* PDF Upload (placeholder) */}
        <TouchableOpacity
          style={styles.uploadButton}
          onPress={() => setPdfPath("fake/path/to/book.pdf")}
        >
          <File color="#2F66DD" size={20} />
          <Text style={styles.uploadText}>
            {pdfPath ? "PDF sélectionné" : "Choisir un PDF"}
          </Text>
        </TouchableOpacity>

        {/* Image couverture */}
        <TouchableOpacity
          style={styles.uploadButton}
          onPress={() => setCoverImage("fake/path/to/cover.jpg")}
        >
          <ImageIcon color="#2F66DD" size={20} />
          <Text style={styles.uploadText}>
            {coverImage ? "Image sélectionnée" : "Choisir une image"}
          </Text>
        </TouchableOpacity>

        {/* ✅ Autres éléments utiles */}
        <TextInput
          style={styles.input}
          placeholder="Description / résumé"
          multiline
        />

        <TextInput
          style={styles.input}
          placeholder="Année de publication"
          keyboardType="numeric"
        />

        {/* Bouton sauvegarde */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Save color="#FFF" size={20} />
          <Text style={styles.saveText}>Enregistrer</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FFF" },
  container: { padding: 20 },
  header: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 20,
    color: "#2F66DD",
  },
  input: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
  },
  uploadText: { marginLeft: 10, fontSize: 16, color: "#333" },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2F66DD",
    borderRadius: 8,
    padding: 15,
    marginTop: 20,
  },
  saveText: { color: "#FFF", fontSize: 16, fontWeight: "600", marginLeft: 8 },
});
