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
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import api from "@/services/api";

export default function AddBookScreen() {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BookFormData>({
    resolver: zodResolver(bookSchema),
    defaultValues: {
      title: "",
      category: "",
      author: "",
      isbn: "",
      year: "",
      pdfPath: "",
      coverImage: "",
      description: "",
      status: "active",
    },
  });

  const onSubmit = async (data: BookFormData) => {
    try {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("category", data.category);
      formData.append("author", data.author);
      formData.append("year", data.year);
      formData.append("description", data.description || "");
      formData.append("isbn", data.isbn || "");
      formData.append("status", data.status);

      if (data.pdfPath) {
        formData.append("pdf_file", {
          uri: data.pdfPath,
          name: "book.pdf",
          type: "application/pdf",
        } as any);
      }

      if (data.coverImage) {
        formData.append("cover_image", {
          uri: data.coverImage,
          name: "cover.jpg",
          type: "image/jpeg",
        } as any);
      }

      const response = await api.post("/library/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("📚 Livre enregistré :", response.data);
      alert("Livre ajouté avec succès !");
      reset();
    } catch (error: any) {
      console.error("❌ Erreur lors de l'ajout du livre :", error.message);
      alert("Impossible d'ajouter le livre. Vérifie l'API.");
    }
  };

  async function pickDocument(onChange: (uri: string) => void) {
    const result = await DocumentPicker.getDocumentAsync({
      type: "application/pdf",
      copyToCacheDirectory: true,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const file = result.assets[0];
      console.log("📄 PDF sélectionné :", file.name, file.uri);
      onChange(file.uri); // ✅ stocke l'URI du PDF
    } else {
      console.log("❌ Sélection annulée");
    }
  }

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
        {errors.description && (
          <Text style={styles.error}>{errors.description.message}</Text>
        )}

        {/* PDF Upload (placeholder) */}
        <Controller
          control={control}
          name="pdfPath"
          render={({ field: { onChange, value } }) => (
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={() => pickDocument(onChange)}
            >
              <File color="#2F66DD" size={20} />
              <Text style={styles.uploadText}>
                {value ? "PDF sélectionné" : "Choisir un PDF"}
              </Text>
            </TouchableOpacity>
          )}
        />
        {errors.pdfPath && (
          <Text style={styles.error}>{errors.pdfPath.message}</Text>
        )}

        {/* Image couverture */}
        <Controller
          control={control}
          name="coverImage"
          render={({ field: { onChange, value } }) => (
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={async () => {
                // Demande permission
                const permission =
                  await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (!permission.granted) {
                  alert("Permission refusée pour accéder aux images");
                  return;
                }

                // Ouvre la galerie
                const result = await ImagePicker.launchImageLibraryAsync({
                  mediaTypes: ImagePicker.MediaTypeOptions.Images,
                  allowsEditing: true,
                  quality: 1,
                });

                if (!result.canceled && result.assets.length > 0) {
                  const image = result.assets[0];
                  console.log("🖼️ Image sélectionnée :", image.uri);
                  onChange(image.uri); // ✅ stocke l'URI dans le formulaire
                }
              }}
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
