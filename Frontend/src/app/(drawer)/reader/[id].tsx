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
import { ArrowLeft } from "lucide-react-native";
import * as FileSystem from "expo-file-system";
import { WebView } from "react-native-webview";

export default function ReaderScreen() {
  const { id, title } = useLocalSearchParams();
  const [pdfBase64, setPdfBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // 📂 Dossier persistant où les PDF sont sauvegardés
  const BOOKS_DIR = `${FileSystem.documentDirectory}encrypted_books/`;
  const fileUri = `${BOOKS_DIR}${id}.pdf`;

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
    loadPdfFile();
  }, [id]);

  const loadPdfFile = async () => {
    try {
      // 1. Vérifier que le fichier existe bien en local
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (!fileInfo.exists) {
        Alert.alert("Erreur", "Le fichier local est introuvable.");
        router.replace("/(drawer)/home");
        return;
      }

      console.log("📄 Lecture du fichier PDF local :", fileUri);

      // 2. Lire le fichier PDF en Base64
      const base64String = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      setPdfBase64(base64String);
    } catch (error: any) {
      console.error("❌ Erreur de lecture :", error.message);
      Alert.alert("Erreur", "Impossible de charger le livre.");
      router.replace("/(drawer)/home");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2F66DD" />
        <Text style={styles.loadingText}>Chargement du livre...</Text>
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

      {/* Affichage du PDF depuis le fichier local */}
      {pdfBase64 && (
        <WebView
          originWhitelist={["*", "data:"]}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          allowFileAccess={true}
          scalesPageToFit={true}
          mixedContentMode="always"
          source={{
            html: `
              <!DOCTYPE html>
              <html style="margin:0;padding:0;height:100%;width:100%;">
                <body style="margin:0;padding:0;height:100%;width:100%;background-color:#525659;display:flex;justify-content:center;align-items:center;">
                  <object data="data:application/pdf;base64,${pdfBase64}" type="application/pdf" width="100%" height="100%">
                    <embed src="data:application/pdf;base64,${pdfBase64}" type="application/pdf" />
                  </object>
                </body>
              </html>
            `,
          }}
          style={styles.webview}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 10, color: "#666" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 40,
    paddingBottom: 15,
    paddingHorizontal: 15,
    backgroundColor: "#2F66DD",
  },
  backButton: { marginRight: 15 },
  title: { color: "#FFF", fontSize: 18, fontWeight: "bold", flex: 1 },
  webview: { flex: 1 },
});
