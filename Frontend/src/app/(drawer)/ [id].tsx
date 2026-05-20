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
import * as FileSystem from "expo-file-system/legacy";
import { WebView } from "react-native-webview"; // Nécessite npx expo install react-native-webview
import CryptoJS from "crypto-js"; // Nécessite npm install crypto-js
import { Buffer } from "buffer"; // Nécessite npm install buffer

export default function ReaderScreen() {
  const { id, title } = useLocalSearchParams();
  const [pdfBase64, setPdfBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const ENCRYPTION_KEY = process.env.EXPO_PUBLIC_PDF_ENCRYPTION_KEY;
  const BOOKS_DIR = `${FileSystem.documentDirectory}encrypted_books/`;
  const fileUri = `${BOOKS_DIR}${id}.pdf`;

  useEffect(() => {
    // Correction du bug de déconnexion au retour :
    // On intercepte le bouton retour physique pour forcer le retour à l'accueil
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

      // 2. Logique de déchiffrement Fernet (AES-128-CBC)
      // Le token Fernet est un Buffer: [Version(1), Timestamp(8), IV(16), Ciphertext(n), HMAC(32)]
      const tokenBuffer = Buffer.from(encryptedBase64, "base64");

      // Extraction de l'IV (index 9 à 25)
      const iv = CryptoJS.lib.WordArray.create(
        new Uint8Array(tokenBuffer.slice(9, 25)) as any,
      );

      // Extraction du Ciphertext (de l'index 25 jusqu'à 32 octets avant la fin)
      const ciphertext = CryptoJS.lib.WordArray.create(
        new Uint8Array(tokenBuffer.slice(25, tokenBuffer.length - 32)) as any,
      );

      // La clé Fernet (32 octets) est composée de : [Signing Key(16), Encryption Key(16)]
      const keyBuffer = Buffer.from(ENCRYPTION_KEY!, "base64");
      const encryptionKey = CryptoJS.lib.WordArray.create(
        new Uint8Array(keyBuffer.slice(16)) as any,
      );

      const decrypted = CryptoJS.AES.decrypt(
        { ciphertext: ciphertext } as any,
        encryptionKey,
        {
          iv: iv,
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7,
        },
      );

      const decryptedBase64 = decrypted.toString(CryptoJS.enc.Base64);

      if (!decryptedBase64) throw new Error("Échec du déchiffrement.");

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
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 40, // Espace pour la barre de statut
    paddingBottom: 15,
    paddingHorizontal: 15,
    backgroundColor: "#2F66DD",
  },
  backButton: { marginRight: 15 },
  title: { color: "#FFF", fontSize: 18, fontWeight: "bold", flex: 1 },
  webview: { flex: 1 },
});
