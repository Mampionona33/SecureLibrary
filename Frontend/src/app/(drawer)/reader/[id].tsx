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

function decryptFernet(
  encryptedBase64: string,
  fernetKeyBase64: string,
): string {
  console.log(
    "🔑 decryptFernet: Clé reçue (fernetKeyBase64) :",
    fernetKeyBase64,
  );
  // 1. Décoder le token Fernet
  const tokenBytes = Buffer.from(encryptedBase64, "base64");

  // 2. Extraire IV (octets 9 à 25)
  const ivBytes = tokenBytes.slice(9, 25);

  // 3. Extraire ciphertext (25 → longueur - 32)
  const ciphertextBytes = tokenBytes.slice(25, tokenBytes.length - 32);
  console.log("🔍 decryptFernet: IV et Ciphertext extraits.");

  // 4. Découper la clé Fernet (32 octets)
  const fullKey = Buffer.from(fernetKeyBase64, "base64");
  const aesKeyBytes = fullKey.slice(16); // seconde moitié = clé AES

  // 5. Convertir en WordArray
  const aesKey = CryptoJS.lib.WordArray.create(aesKeyBytes);
  const iv = CryptoJS.lib.WordArray.create(ivBytes);
  const ciphertext = CryptoJS.lib.WordArray.create(ciphertextBytes);
  console.log("🔍 decryptFernet: WordArrays créés pour déchiffrement.");

  // 6. Déchiffrement AES-CBC + PKCS7
  const decrypted = CryptoJS.AES.decrypt({ ciphertext }, aesKey, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  const decryptedResult = decrypted.toString(CryptoJS.enc.Base64);
  console.log(
    "✅ decryptFernet: Déchiffrement terminé. Taille du résultat (Base64) :",
    decryptedResult.length,
  );
  return decryptedResult;
}

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

      console.log(
        "📦 loadAndDecryptFile: Contenu chiffré lu (Base64). Taille :",
        encryptedBase64.length,
      );
      if (!ENCRYPTION_KEY) {
        throw new Error(
          "Clé de chiffrement PDF manquante dans les variables d'environnement.",
        );
      }
      console.log(
        "🔑 loadAndDecryptFile: Clé de chiffrement du .env :",
        ENCRYPTION_KEY,
      );

      // ✅ Déchiffrement Fernet → PDF base64 via la fonction dédiée
      const decryptedBase64 = decryptFernet(encryptedBase64, ENCRYPTION_KEY);

      // Vérification simple que le déchiffrement a produit quelque chose
      if (decryptedBase64.length < 100)
        throw new Error("Contenu déchiffré trop court ou invalide.");

      console.log(
        "✨ loadAndDecryptFile: Contenu déchiffré prêt pour la WebView. Taille :",
        decryptedBase64.length,
      );
      if (!decryptedBase64) throw new Error("Échec du déchiffrement.");

      setPdfBase64(decryptedBase64);
    } catch (error: any) {
      console.error("Erreur de lecture :", error.message);
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
        originWhitelist={["*", "data:"]}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowFileAccess={true}
        scalesPageToFit={true}
        source={{
          html: `
            <!DOCTYPE html>
            <html style="margin:0;padding:0;height:100%;width:100%;">
              <body style="margin:0;padding:0;height:100%;width:100%;background-color:#525659;">
                <embed src="data:application/pdf;base64,${pdfBase64}#toolbar=0&navpanes=0&scrollbar=0" type="application/pdf" width="100%" height="100%" />
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
