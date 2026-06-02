import "react-native-get-random-values";
import React from "react";
import {
  View,
  Text,
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
import { ActivityIndicator } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BookFormData, bookSchema } from "@/schemas/book-schema";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import api from "@/services/api";
import { encryptFernet } from "@/services/crypto";
import * as FileSystem from "expo-file-system/legacy";
import { FormInput } from "@/components/form-input";
import { UploadButton } from "@/components/upload-button";
import { deleteEncryptedPdf, encryptPdf } from "@/utils/pdf-crypto";

const ENCRYPTION_KEY = process.env.EXPO_PUBLIC_PDF_ENCRYPTION_KEY!;

export default function AddBookScreen() {
  const [loading, setLoading] = React.useState(false);
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
    console.log("🔥 SUBMIT TRIGGERED", data);

    setLoading(true); // 🟡 START LOADING

    try {
      const formData = new FormData();

      formData.append("title", data.title);
      formData.append("category", data.category);
      formData.append("author", data.author);
      formData.append("year", data.year);
      formData.append("status", data.status);

      if (data.isbn?.trim()) {
        formData.append("isbn", data.isbn);
      }

      if (data.description) {
        formData.append("description", data.description);
      }

      let encPath: string | null = null;

      if (data.pdfPath) {
        encPath = await encryptPdf(data.pdfPath);

        formData.append("pdf_file", {
          uri: encPath,
          name: "book.enc",
          type: "application/octet-stream",
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
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (encPath) {
        await deleteEncryptedPdf(encPath);
      }

      console.log("📚 Livre enregistré :", response.data);

      alert("Livre ajouté avec succès !");
      reset();
    } catch (error: any) {
      console.error("❌ Erreur lors de l'ajout du livre :", error.message);
      alert("Impossible d'ajouter le livre. Vérifie l'API.");
    } finally {
      setLoading(false); // 🔴 STOP LOADING
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

    if (!res.canceled) {
      onChange(res.assets[0].uri);
    }
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

          {/* ===================== DÉTAILS PRINCIPAUX ===================== */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Détails Principaux</Text>

            <FormInput
              control={control}
              name="title"
              placeholder="Titre du livre"
              icon={<BookOpen color="#2F66DD" size={18} />}
            />

            <FormInput
              control={control}
              name="author"
              placeholder="Auteur"
              icon={<User color="#2F66DD" size={18} />}
            />

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <FormInput
                  control={control}
                  name="category"
                  placeholder="Catégorie"
                  icon={<Tag color="#2F66DD" size={18} />}
                />
              </View>

              <View style={{ flex: 0.6 }}>
                <FormInput
                  control={control}
                  name="year"
                  placeholder="Année"
                  keyboardType="numeric"
                  icon={<Calendar color="#2F66DD" size={18} />}
                />
              </View>
            </View>
          </View>

          {/* ===================== FICHIERS ===================== */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Fichiers & Médias</Text>

            <View style={styles.fileRow}>
              <Controller
                control={control}
                name="pdfPath"
                render={({ field: { onChange, value } }) => (
                  <UploadButton
                    value={value}
                    label="Fichier PDF"
                    activeLabel="PDF prêt"
                    Icon={File}
                    onPress={() => pickDocument(onChange)}
                  />
                )}
              />

              <Controller
                control={control}
                name="coverImage"
                render={({ field: { onChange, value } }) => (
                  <UploadButton
                    value={value}
                    label="Couverture"
                    activeLabel="Image OK"
                    Icon={ImageIcon}
                    onPress={() => pickImage(onChange)}
                  />
                )}
              />
            </View>

            <Controller
              control={control}
              name="coverImage"
              render={({ field: { value } }) => (
                <View>
                  {value ? (
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
                    <View />
                  )}
                </View>
              )}
            />
          </View>

          {/* ===================== SUPPLÉMENTAIRE ===================== */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Informations Supplémentaires</Text>

            <FormInput
              control={control}
              name="isbn"
              placeholder="ISBN (Optionnel)"
              icon={<Hash color="#2F66DD" size={18} />}
            />

            <FormInput
              control={control}
              name="description"
              placeholder="Description du livre..."
              multiline
              icon={<AlignLeft color="#2F66DD" size={18} />}
            />
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.saveButton, loading && { opacity: 0.7 }]}
            onPress={handleSubmit(onSubmit)}
            activeOpacity={0.8}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Save color="#FFF" size={22} />
            )}

            <Text style={styles.saveText}>
              {loading ? "Chargement..." : "Finaliser l'enregistrement"}
            </Text>
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
  row: { flexDirection: "row" },
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
});
