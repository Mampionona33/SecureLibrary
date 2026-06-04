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
import { ArrowLeft, FileText, Eye } from "lucide-react-native";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

export default function ReaderScreen() {
  const { id, title } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // 📂 Accès au dossier document où HomeScreen télécharge le fichier
  const BOOKS_DIR = `${FileSystem.documentDirectory}books/`;

  // ✅ Garde pour éviter de construire une URI "null.pdf" lors de l'initialisation de la route
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

  useEffect(() => {
    if (id) {
      checkAndOpenPdf();
    }
  }, [id]);

  const checkAndOpenPdf = async () => {
    if (!id || !fileUri) return;

    try {
      setLoading(true);

      // 1. Vérification de l'existence du fichier
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (!fileInfo.exists) {
        Alert.alert(
          "Fichier introuvable",
          "Le livre n'a pas pu être trouvé en local. Recommencez le téléchargement.",
        );
        router.replace("/(drawer)/home");
        return;
      }

      console.log("📄 Accès au PDF local :", fileInfo.uri);

      // ✅ Arrêt du loader global avant de déclencher l'ouverture
      setLoading(false);

      // 2. Tenter l'ouverture automatique après un léger délai CPU
      setTimeout(() => {
        openPdfWithSharing(fileInfo.uri);
      }, 300);
    } catch (error: any) {
      console.error("❌ Erreur accès :", error.message);
      setLoading(false);
      Alert.alert("Erreur", "Impossible d'accéder au fichier local.");
      router.replace("/(drawer)/home");
    }
  };

  const openPdfWithSharing = async (targetUri?: string) => {
    let uriToShare = targetUri;

    // Si aucune URI n'est transmise, on la résout dynamiquement de manière sécurisée
    if (!uriToShare) {
      if (!fileUri) return;
      try {
        const fileInfo = await FileSystem.getInfoAsync(fileUri);
        if (fileInfo.exists) {
          uriToShare = fileInfo.uri;
        } else {
          Alert.alert(
            "Erreur",
            "La version locale de ce livre est introuvable.",
          );
          return;
        }
      } catch (err) {
        Alert.alert("Erreur", "Impossible de lire le fichier local.");
        return;
      }
    }

    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert(
          "Indisponible",
          "L'ouverture automatique ou le partage de fichiers n'est pas supporté sur votre appareil.",
        );
        return;
      }

      console.log("📤 Invocation de expo-sharing pour :", uriToShare);

      // Partage / Ouverture du fichier en transmettant l'URI native validée
      await Sharing.shareAsync(uriToShare, {
        mimeType: "application/pdf",
        dialogTitle: `${title}`,
        UTI: "com.adobe.pdf",
      });
    } catch (error: any) {
      console.error("❌ Erreur expo-sharing :", error.message);
    }
  };

  if (!id) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2F66DD" />
        <Text style={styles.loadingText}>
          Attente des informations de navigation...
        </Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2F66DD" />
        <Text style={styles.loadingText}>Vérification du fichier local...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.replace("/(drawer)/home")}
          style={styles.backButton}
        >
          <ArrowLeft color="#FFF" size={24} />
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <FileText size={80} color="#2F66DD" style={styles.fileIcon} />

          <Text style={styles.bookTitleText}>{title}</Text>
          <Text style={styles.statusText}>
            Votre livre est enregistré hors-ligne en toute sécurité sur votre
            stockage local.
          </Text>

          {/* Bouton pour ré-invoquer le lecteur système manuellement ou si l'auto-ouverture a été bloquée */}
          <TouchableOpacity
            style={styles.openButton}
            onPress={() => openPdfWithSharing()}
          >
            <Eye size={20} color="#FFF" style={styles.buttonIcon} />
            <Text style={styles.openButtonText}>
              Ouvrir dans le lecteur PDF
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backLink}
            onPress={() => router.replace("/(drawer)/home")}
          >
            <Text style={styles.backLinkText}>Retourner à la bibliothèque</Text>
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
  },
  loadingText: { marginTop: 10, color: "#666", fontSize: 15 },
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
    marginBottom: 25,
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
