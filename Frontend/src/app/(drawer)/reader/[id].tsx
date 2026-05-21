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
import { WebView } from "react-native-webview";
import CryptoJS from "crypto-js";
import { Buffer } from "buffer";

function decryptFernet(
  encryptedBase64: string,
  fernetKeyBase64: string,
): string {
  console.log("🔑 decryptFernet: Début du processus avec la clé du token.");
  // 1. Décoder le token Fernet (base64 → bytes)
  const tokenBytes = Buffer.from(encryptedBase64, "base64");

  // 2. Extraire IV (octets 9 à 25)
  const ivBytes = tokenBytes.slice(9, 25);

  // 3. Extraire ciphertext (25 → longueur - 32)
  const ciphertextBytes = tokenBytes.slice(25, tokenBytes.length - 32);

  // 4. Découper la clé Fernet (32 octets)
  const fullKey = Buffer.from(fernetKeyBase64, "base64");
  const aesKeyBytes = fullKey.slice(16); // seconde moitié = clé AES

  // 5. Convertir en WordArray pour crypto-js
  const aesKey = CryptoJS.lib.WordArray.create(aesKeyBytes as any);
  const iv = CryptoJS.lib.WordArray.create(ivBytes as any);
  const ciphertext = CryptoJS.lib.WordArray.create(ciphertextBytes as any);

  // 6. Déchiffrement AES-CBC + PKCS7
  const decrypted = CryptoJS.AES.decrypt({ ciphertext } as any, aesKey, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  // 7. Résultat en base64 pour WebView
  const result = decrypted.toString(CryptoJS.enc.Base64);

  // Vérification de validité (Le Base64 d'un PDF commence par 'JVBERi')
  if (!result.startsWith("JVBERi")) {
    console.warn(
      "⚠️ Le déchiffrement semble avoir réussi mais le header PDF est absent.",
    );
  }

  console.log(
    "✅ decryptFernet: Déchiffrement terminé. Taille :",
    result.length,
  );
  return result;
}

export default function ReaderScreen() {
  const { id, title } = useLocalSearchParams();
  const [pdfBase64, setPdfBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const BOOKS_DIR = `${FileSystem.documentDirectory}encrypted_books/`;
  const fileUri = `${BOOKS_DIR}${id}.pdf`;
  const ENCRYPTION_KEY = process.env.EXPO_PUBLIC_PDF_ENCRYPTION_KEY;

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
    loadAndDecryptFile();
  }, [id]);

  const loadAndDecryptFile = async () => {
    try {
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (!fileInfo.exists) {
        Alert.alert("Erreur", "Le fichier local est introuvable.");
        router.replace("/(drawer)/home");
        return;
      }

      console.log("📦 loadAndDecryptFile: Lecture du fichier chiffré...");
      const encryptedBase64 = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      if (!ENCRYPTION_KEY) {
        throw new Error(
          "La clé EXPO_PUBLIC_PDF_ENCRYPTION_KEY est absente du .env",
        );
      }
      console.log("🔑 Clé chargée depuis .env :", ENCRYPTION_KEY);

      const decryptedBase64 = decryptFernet(encryptedBase64, ENCRYPTION_KEY);

      if (!decryptedBase64 || decryptedBase64.length < 100) {
        throw new Error("Le déchiffrement a produit un résultat invalide.");
      }

      setPdfBase64(decryptedBase64);
    } catch (error: any) {
      console.error("❌ Erreur de lecture/déchiffrement :", error.message);
      Alert.alert("Erreur de sécurité", "Impossible de déchiffrer le livre.");
      router.replace("/(drawer)/home");
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
