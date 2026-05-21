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

// Convertir un Buffer en WordArray correctement
function bufferToWordArray(buf: Buffer) {
  const words = [];

  for (let i = 0; i < buf.length; i++) {
    words[(i / 4) | 0] |= buf[i] << (24 - 8 * (i % 4));
  }

  return CryptoJS.lib.WordArray.create(words, buf.length);
}

function base64UrlToBuffer(base64url: string) {
  const base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");

  const padding = "=".repeat((4 - (base64.length % 4)) % 4);

  return Buffer.from(base64 + padding, "base64");
}

export function decryptFernet(token: string, key: string): string {
  function base64UrlToBuffer(base64url: string) {
    const base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");

    const padding = "=".repeat((4 - (base64.length % 4)) % 4);

    return Buffer.from(base64 + padding, "base64");
  }

  function bufferToWordArray(buf: Buffer) {
    const words: number[] = [];

    for (let i = 0; i < buf.length; i++) {
      words[(i / 4) | 0] |= buf[i] << (24 - 8 * (i % 4));
    }

    return CryptoJS.lib.WordArray.create(words, buf.length);
  }

  try {
    // TOKEN FERNET → bytes
    const tokenBytes = base64UrlToBuffer(token.trim());

    console.log("📦 Token bytes:", tokenBytes.length);

    // Fernet structure:
    // version (1)
    // timestamp (8)
    // IV (16)
    // ciphertext (n)
    // HMAC (32)

    const ivBytes = tokenBytes.slice(9, 25);

    const ciphertextBytes = tokenBytes.slice(25, tokenBytes.length - 32);

    // CLÉ FERNET
    const fullKey = base64UrlToBuffer(key.trim());

    console.log("🔑 Full key length:", fullKey.length);

    // 16 derniers octets = AES key
    const aesKeyBytes = fullKey.slice(16);

    console.log("🔐 AES key length:", aesKeyBytes.length);

    // conversion CryptoJS
    const aesKey = bufferToWordArray(aesKeyBytes);

    const iv = bufferToWordArray(ivBytes);

    const ciphertext = bufferToWordArray(ciphertextBytes);

    // AES-128-CBC
    const decrypted = CryptoJS.AES.decrypt({ ciphertext } as any, aesKey, {
      iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });

    // bytes réels
    const hex = CryptoJS.enc.Hex.stringify(decrypted);

    const pdfBytes = Buffer.from(hex, "hex");

    // PDF → base64
    const pdfBase64 = pdfBytes.toString("base64");

    console.log("📄 PDF header:", pdfBase64.substring(0, 20));

    // PDF valide commence par:
    // JVBERi0

    if (!pdfBase64.startsWith("JVBERi")) {
      throw new Error("PDF invalide après déchiffrement");
    }

    return pdfBase64;
  } catch (err: any) {
    console.error("❌ decryptFernet:", err.message);

    throw err;
  }
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
      const encryptedToken = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      if (!ENCRYPTION_KEY) {
        throw new Error(
          "La clé EXPO_PUBLIC_PDF_ENCRYPTION_KEY est absente du .env",
        );
      }
      console.log("🔑 Clé chargée depuis .env :", ENCRYPTION_KEY);

      const decryptedBase64 = decryptFernet(encryptedToken, ENCRYPTION_KEY);

      if (!decryptedBase64 || decryptedBase64.length < 100) {
        throw new Error("Le déchiffrement a produit un résultat invalide.");
      }

      setPdfBase64(decryptedBase64);
    } catch (error: any) {
      // Capture l'erreur avec un type explicite
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
