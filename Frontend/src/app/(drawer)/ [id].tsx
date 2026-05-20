import React, { useEffect, useState } from "react";
import { StyleSheet, View, Text, ActivityIndicator, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as FileSystem from "expo-file-system/legacy";
import { WebView } from "react-native-webview";

export default function ReaderScreen() {
  const { id, title } = useLocalSearchParams();
  const [pdfBase64, setPdfBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const ENCRYPTION_KEY = process.env.EXPO_PUBLIC_PDF_ENCRYPTION_KEY;
  const BOOKS_DIR = `${FileSystem.documentDirectory}encrypted_books/`;
  const fileUri = `${BOOKS_DIR}${id}.pdf`;

  useEffect(() => {
    loadAndDecryptFile();
  }, [id]);

  const loadAndDecryptFile = async () => {
    try {
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (!fileInfo.exists) {
        Alert.alert("Erreur", "Le fichier local est introuvable.");
        router.back();
        return;
      }

      // 1. Lire le fichier chiffré en base64
      const encryptedBase64 = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // 2. Logique de DÉCHIFFREMENT RÉELLE
      // La clé récupérée est : ENCRYPTION_KEY
      //
      // Étapes générales :
      // a. Utiliser ENCRYPTION_KEY pour initialiser l'algorithme.
      //    Note: Fernet utilise AES-128-CBC + HMAC-SHA256.
      // b. Décoder le `encryptedBase64` en un tableau d'octets (Uint8Array ou Buffer).
      // c. Appliquer l'algorithme de déchiffrement Fernet (AES-128-CBC avec HMAC).
      //    Note: Fernet ajoute un header (timestamp, IV) et un HMAC. Votre déchiffreur JS
      //    devra gérer ce format spécifique.
      // d. Encoder le résultat déchiffré en base64 pour la WebView.
      //
      // Pour l'instant, nous allons passer le contenu chiffré.
      // REMPLACEZ LA LIGNE CI-DESSOUS par le résultat de votre déchiffrement.
      const decryptedBase64 = encryptedBase64; // <-- À REMPLACER PAR LE VRAI DÉCHIFFREMENT

      setPdfBase64(decryptedBase64);
    } catch (error) {
      console.error("Erreur de lecture :", error);
      Alert.alert("Erreur", "Impossible d'ouvrir le livre.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2F66DD" />
        <Text style={styles.loadingText}>Déchiffrement sécurisé...</Text>
      </View>
    );
  }

  // Utilisation d'une WebView pour afficher le PDF sans créer de fichier temporaire non-chiffré
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
      </View>
      <WebView
        originWhitelist={["*"]}
        source={{
          html: `
            <html>
              <body style="margin:0;padding:0;background-color:#525659;">
                <embed src="data:application/pdf;base64,${pdfBase64}" type="application/pdf" width="100%" height="100%" />
              </body>
            </html>
          `,
        }}
        style={styles.webview}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 10, color: "#666" },
  header: {
    padding: 15,
    backgroundColor: "#2F66DD",
    alignItems: "center",
  },
  title: { color: "#FFF", fontSize: 16, fontWeight: "bold" },
  webview: { flex: 1 },
});
