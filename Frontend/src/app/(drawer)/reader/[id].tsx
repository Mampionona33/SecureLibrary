import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  BackHandler,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, FileText, Eye, AlertCircle } from "lucide-react-native";
// ✅ Alignement stratégique de l'import pour garantir le même accès disque que home.tsx
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";

export default function ReaderScreen() {
  const { id, title } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const router = useRouter();

  // 📂 Dossier persistant identique à celui de home.tsx
  const BOOKS_DIR = `${FileSystem.documentDirectory}encrypted_books/`;

  // ✅ Évite de monter un chemin "undefined.pdf" au premier rendu asynchrone
  const fileUri = id ? `${BOOKS_DIR}${id}.pdf` : null;

  useEffect(() => {
    const backAction = () => {
      router.replace("/(drawer)/home");
      return true;
    };
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction,
    );
    return () => backHandler.remove();
  }, []);

  // ✅ On ne lance la vérification que lorsque l'ID du livre est réellement hydraté par Expo
  useEffect(() => {
    if (id) {
      checkAndOpenPdf();
    } else {
      console.log(
        "⏳ En attente de la résolution des paramètres par Expo Router...",
      );
    }
  }, [id]);

  const checkAndOpenPdf = async () => {
    if (!fileUri) return;

    try {
      setLoading(true);
      setErrorStatus(null);
      console.log("🔍 Évaluation de l'URI locale du PDF :", fileUri);

      // 1. Vérification asynchrone de la présence physique du document
      const fileInfo = await FileSystem.getInfoAsync(fileUri);

      if (!fileInfo.exists) {
        console.warn("⚠️ Fichier introuvable localement :", fileUri);
        Alert.alert(
          "Fichier introuvable",
          "Le livre n'est pas encore téléchargé ou a été supprimé.",
          [
            {
              text: "Retour à l'accueil",
              onPress: () => router.replace("/(drawer)/home"),
            },
          ],
        );
        return;
      }

      console.log("📄 Document PDF local validé !");

      // ✅ Une fois l'intégrité du document validée, on cache le chargement
      setLoading(false);

      // 2. Déclenchement automatique et sécurisé du lecteur système (après un infime délai de rendu du layout)
      setTimeout(async () => {
        try {
          await openPdfWithSharing();
        } catch (shareErr) {
          console.error("❌ Échec de l'ouverture automatique :", shareErr);
        }
      }, 400);
    } catch (error: any) {
      console.error(
        "❌ Erreur critique lors de l'accès au fichier :",
        error.message,
      );
      setErrorStatus(error.message);
      Alert.alert(
        "Erreur technique",
        "Impossible de charger correctement ce livre de la bibliothèque.",
        [{ text: "OK", onPress: () => router.replace("/(drawer)/home") }],
      );
    } finally {
      // ✅ Le bloc finally garantit que le chargement s'arrêtera peu importe le cas de figure !
      setLoading(false);
    }
  };

  const openPdfWithSharing = async () => {
    if (!fileUri) return;

    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert(
          "Incompatibilité",
          "L'ouverture asynchrone sécurisée de fichiers locaux n'est pas supportée sur cet appareil.",
        );
        return;
      }

      console.log(
        "📤 Partage/Ouverture du document via expo-sharing :",
        fileUri,
      );

      await Sharing.shareAsync(fileUri, {
        mimeType: "application/pdf",
        dialogTitle: `Lecture de : ${title || "Mon Livre"}`,
        UTI: "com.adobe.pdf",
      });
    } catch (error: any) {
      console.error("❌ Erreur pendant le partage :", error.message);
      Alert.alert(
        "Lecteur introuvable",
        "Aucune application de lecture PDF n'a pu prendre en charge ce document.",
        [{ text: "OK" }],
      );
    }
  };

  // 🌀 Spinner de chargement propre avec sous-titre rassurant
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2F66DD" />
        <Text style={styles.loadingText}>Vérification du fichier...</Text>
        <Text style={styles.subLoadingText}>
          Lecture sécurisée du disque physique
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Barre d'en-tête (Navigation) */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.replace("/(drawer)/home")}
          style={styles.backButton}
        >
          <ArrowLeft color="#FFF" size={24} />
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>
          {title || "Lecteur sécurisé"}
        </Text>
      </View>

      {/* Contenu principal de secours si la boîte système est fermée ou ignorée */}
      <View style={styles.content}>
        <View style={styles.card}>
          <FileText size={80} color="#2F66DD" style={styles.fileIcon} />

          <Text style={styles.bookTitleText}>{title || "Sans Titre"}</Text>
          <Text style={styles.statusText}>
            Ce document est cryptographié et disponible hors-ligne localement.
          </Text>

          {errorStatus && (
            <View style={styles.errorContainer}>
              <AlertCircle size={16} color="#E53E3E" />
              <Text style={styles.errorText}>Status: {errorStatus}</Text>
            </View>
          )}

          {/* Bouton pour réactiver le lecteur externe si besoin */}
          <TouchableOpacity
            style={styles.openButton}
            onPress={openPdfWithSharing}
          >
            <Eye size={20} color="#FFF" style={styles.buttonIcon} />
            <Text style={styles.openButtonText}>Consulter le document</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backLink}
            onPress={() => router.replace("/(drawer)/home")}
          >
            <Text style={styles.backLinkText}>Retourner à l'étagère</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F5FA" },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF",
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    color: "#1E2432",
    fontSize: 16,
    fontWeight: "600",
  },
  subLoadingText: { marginTop: 4, color: "#9A9A9A", fontSize: 12 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 15,
    backgroundColor: "#2F66DD",
  },
  backButton: { marginRight: 15 },
  title: { color: "#FFF", fontSize: 18, fontWeight: "bold", flex: 1 },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 30,
    width: "100%",
    maxWidth: 340,
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  fileIcon: { marginBottom: 20 },
  bookTitleText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1E2432",
    textAlign: "center",
    marginBottom: 10,
  },
  statusText: {
    fontSize: 14,
    color: "#9A9A9A",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF5F5",
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
    gap: 6,
  },
  errorText: {
    fontSize: 12,
    color: "#C53030",
    fontWeight: "500",
  },
  openButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2F66DD",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    width: "100%",
    justifyContent: "center",
    elevation: 2,
  },
  buttonIcon: { marginRight: 8 },
  openButtonText: { color: "#FFF", fontSize: 15, fontWeight: "bold" },
  backLink: { marginTop: 20 },
  backLinkText: { color: "#2F66DD", fontSize: 14, fontWeight: "600" },
});
