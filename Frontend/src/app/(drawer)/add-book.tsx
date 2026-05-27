import "react-native-get-random-values";
import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  File,
  Image as ImageIcon,
  Save,
  BookOpen,
  User,
  Tag,
  Hash,
  Calendar,
  AlignLeft,
  CheckCircle2,
} from "lucide-react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BookFormData, bookSchema } from "@/schemas/book-schema";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import api from "@/services/api";
import { encryptFernet } from "@/services/crypto";
import * as FileSystem from "expo-file-system/legacy";

const ENCRYPTION_KEY = process.env.EXPO_PUBLIC_PDF_ENCRYPTION_KEY!;

export default function AddBookScreen() {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
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

      // 🔒 Cryptage du PDF
      if (data.pdfPath) {
        // Lire le fichier PDF en base64 (legacy API)
        const base64Data = await FileSystem.readAsStringAsync(data.pdfPath, {
          encoding: FileSystem.EncodingType.Base64,
        });

        // 🔐 Chiffrement Fernet avec la clé
        const encryptedToken = await encryptFernet(base64Data, ENCRYPTION_KEY);

        // Envoi au backend
        formData.append("pdf_file", {
          uri: data.pdfPath,
          name: "book.enc",
          type: "application/octet-stream",
        } as any);

        // Si ton backend attend le contenu chiffré directement :
        // formData.append("encrypted_pdf", encryptedToken);
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
      onChange(file.uri);
    } else {
      console.log("❌ Sélection annulée");
    }
  }

  async function pickImage(onChange: (uri: string) => void) {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });
    if (!res.canceled) onChange(res.assets[0].uri);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.header}>Nouveau Trésor</Text>
          <Text style={styles.subHeader}>
            Ajoutez un nouveau livre à votre bibliothèque sécurisée.
          </Text>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Détails Principaux</Text>

            <View style={styles.inputWrapper}>
              <BookOpen color="#2F66DD" size={18} style={styles.inputIcon} />
              <Controller
                control={control}
                name="title"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={styles.input}
                    placeholder="Titre du livre"
                    value={value}
                    onChangeText={onChange}
                  />
                )}
              />
            </View>
            {errors.title && (
              <Text style={styles.error}>{errors.title.message}</Text>
            )}

            <View style={styles.inputWrapper}>
              <User color="#2F66DD" size={18} style={styles.inputIcon} />
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
            </View>
            {errors.author && (
              <Text style={styles.error}>{errors.author.message}</Text>
            )}

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <View style={styles.inputWrapper}>
                  <Tag color="#2F66DD" size={18} style={styles.inputIcon} />
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
                </View>
                {errors.category && (
                  <Text style={styles.error}>{errors.category.message}</Text>
                )}
              </View>
              <View style={{ flex: 0.6 }}>
                <View style={styles.inputWrapper}>
                  <Calendar
                    color="#2F66DD"
                    size={18}
                    style={styles.inputIcon}
                  />
                  <Controller
                    control={control}
                    name="year"
                    render={({ field: { onChange, value } }) => (
                      <TextInput
                        style={styles.input}
                        placeholder="Année"
                        keyboardType="numeric"
                        value={value}
                        onChangeText={(text) =>
                          onChange(text.replace(/[^0-9]/g, ""))
                        }
                      />
                    )}
                  />
                </View>
                {errors.year && (
                  <Text style={styles.error}>{errors.year.message}</Text>
                )}
              </View>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Fichiers & Médias</Text>

            <View style={styles.fileRow}>
              <Controller
                control={control}
                name="pdfPath"
                render={({ field: { onChange, value } }) => (
                  <TouchableOpacity
                    style={[
                      styles.uploadButton,
                      value ? styles.uploadActive : null,
                    ]}
                    onPress={() => pickDocument(onChange)}
                  >
                    {value ? (
                      <CheckCircle2 color="#FFF" size={20} />
                    ) : (
                      <File color="#2F66DD" size={20} />
                    )}
                    <Text
                      style={[
                        styles.uploadText,
                        value ? { color: "#FFF" } : null,
                      ]}
                    >
                      {value ? "PDF Prêt" : "Fichier PDF"}
                    </Text>
                  </TouchableOpacity>
                )}
              />

              <Controller
                control={control}
                name="coverImage"
                render={({ field: { onChange, value } }) => (
                  <TouchableOpacity
                    style={[
                      styles.uploadButton,
                      value ? styles.uploadActive : null,
                    ]}
                    onPress={() => pickImage(onChange)}
                  >
                    {value ? (
                      <CheckCircle2 color="#FFF" size={20} />
                    ) : (
                      <ImageIcon color="#2F66DD" size={20} />
                    )}
                    <Text
                      style={[
                        styles.uploadText,
                        value ? { color: "#FFF" } : null,
                      ]}
                    >
                      {value ? "Image OK" : "Couverture"}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>
            {errors.pdfPath && (
              <Text style={[styles.error, { marginTop: -8, marginBottom: 12 }]}>
                {errors.pdfPath.message}
              </Text>
            )}

            <Controller
              control={control}
              name="coverImage"
              render={({ field: { value } }) =>
                value ? (
                  <View style={styles.previewContainer}>
                    <Image
                      source={{ uri: value }}
                      style={styles.previewImage}
                    />
                    <Text style={styles.previewLabel}>
                      Aperçu de la couverture
                    </Text>
                  </View>
                ) : (
                  <></>
                )
              }
            />
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Informations Supplémentaires</Text>
            <View style={styles.inputWrapper}>
              <Hash color="#2F66DD" size={18} style={styles.inputIcon} />
              <Controller
                control={control}
                name="isbn"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={styles.input}
                    placeholder="ISBN (Optionnel)"
                    value={value}
                    onChangeText={onChange}
                  />
                )}
              />
            </View>
            <View
              style={[
                styles.inputWrapper,
                { alignItems: "flex-start", paddingTop: 10 },
              ]}
            >
              <AlignLeft
                color="#2F66DD"
                size={18}
                style={[styles.inputIcon, { marginTop: 4 }]}
              />
              <Controller
                control={control}
                name="description"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={[
                      styles.input,
                      { height: 80, textAlignVertical: "top" },
                    ]}
                    placeholder="Description du livre..."
                    multiline
                    value={value}
                    onChangeText={onChange}
                  />
                )}
              />
            </View>
          </View>
        </ScrollView>
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSubmit(onSubmit)}
            activeOpacity={0.8}
          >
            <Save color="#FFF" size={22} />
            <Text style={styles.saveText}>Finaliser l'enregistrement</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F8F9FA" },
  container: { padding: 20, paddingBottom: 20 },
  footer: {
    padding: 20,
    backgroundColor: "#FFF",
    borderTopWidth: 1,
    borderTopColor: "#E0E5F0",
  },
  header: {
    fontSize: 28,
    fontWeight: "800",
    color: "#2F66DD",
    marginBottom: 4,
  },
  subHeader: {
    fontSize: 14,
    color: "#666",
    marginBottom: 24,
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#2F66DD",
    paddingLeft: 10,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F6FF",
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E0E5F0",
  },
  inputIcon: { marginRight: 10 },
  row: { flexDirection: "row" },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: "#1E2432",
  },
  fileRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  uploadButton: {
    flex: 0.48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F6FF",
    borderWidth: 1,
    borderColor: "#2F66DD",
    borderStyle: "dashed",
    borderRadius: 12,
    paddingVertical: 14,
  },
  uploadActive: {
    backgroundColor: "#2F66DD",
    borderStyle: "solid",
  },
  uploadText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "600",
    color: "#2F66DD",
  },
  previewContainer: {
    marginTop: 16,
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 12,
  },
  previewImage: {
    width: 100,
    height: 140,
    borderRadius: 8,
    marginBottom: 8,
  },
  previewLabel: {
    fontSize: 12,
    color: "#999",
    fontStyle: "italic",
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2F66DD",
    borderRadius: 16,
    paddingVertical: 16,
    marginTop: 0,
    elevation: 4,
    shadowColor: "#2F66DD",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  saveText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "700",
    marginLeft: 10,
  },
  error: { color: "red", marginBottom: 10 },
});
