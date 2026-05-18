import React from "react";
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
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BookFormData, bookSchema } from "@/schemas/book-schema";

export default function AddBookScreen() {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<BookFormData>({
    resolver: zodResolver(bookSchema),
    defaultValues: {
      title: "",
      category: "",
      author: "",
      year: "",
      pdfPath: "",
      coverImage: "",
      description: "",
    },
  });

  const onSubmit = (data: BookFormData) => {
    console.log("📚 Nouveau livre validé :", data);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>Ajouter un livre</Text>

        {/* Nom du livre */}
        <Controller
          control={control}
          name="title"
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={styles.input}
              placeholder="Nom du livre"
              value={value}
              onChangeText={onChange}
            />
          )}
        />
        {errors.title && (
          <Text style={styles.error}>{errors.title.message}</Text>
        )}

        {/* Catégorie */}
        <Controller
          control={control}
          name="category"
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={styles.input}
              placeholder="Catégorie"
              value={value}
              onChangeText={onChange}
            />
          )}
        />
        {errors.category && (
          <Text style={styles.error}>{errors.category.message}</Text>
        )}

        {/* Auteur */}
        <Controller
          control={control}
          name="author"
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={styles.input}
              placeholder="Auteur"
              value={value}
              onChangeText={onChange}
            />
          )}
        />
        {errors.author && (
          <Text style={styles.error}>{errors.author.message}</Text>
        )}

        {/* Année de publication */}
        <Controller
          control={control}
          name="year"
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={styles.input}
              placeholder="Année de publication"
              keyboardType="numeric"
              value={value}
              onChangeText={onChange}
            />
          )}
        />
        {errors.year && <Text style={styles.error}>{errors.year.message}</Text>}

        {/* Description */}
        <Controller
          control={control}
          name="description"
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={styles.input}
              placeholder="Description / résumé"
              multiline
              value={value}
              onChangeText={onChange}
            />
          )}
        />

        {/* PDF Upload (placeholder) */}
        <Controller
          control={control}
          name="pdfPath"
          render={({ field: { onChange, value } }) => (
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={() => onChange("fake/path/to/book.pdf")}
            >
              <File color="#2F66DD" size={20} />
              <Text style={styles.uploadText}>
                {value ? "PDF sélectionné" : "Choisir un PDF"}
              </Text>
            </TouchableOpacity>
          )}
        />

        {/* Image couverture */}
        <Controller
          control={control}
          name="coverImage"
          render={({ field: { onChange, value } }) => (
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={() => onChange("fake/path/to/cover.jpg")}
            >
              <ImageIcon color="#2F66DD" size={20} />
              <Text style={styles.uploadText}>
                {value ? "Image sélectionnée" : "Choisir une image"}
              </Text>
            </TouchableOpacity>
          )}
        />

        {/* Bouton sauvegarde */}
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSubmit(onSubmit)}
        >
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
  error: { color: "red", marginBottom: 10 },
});
