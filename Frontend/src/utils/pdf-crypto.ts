import * as FileSystem from "expo-file-system/legacy";
import { encryptFernet, decryptFernet } from "@/services/crypto";

const ENCRYPTION_KEY = process.env.EXPO_PUBLIC_PDF_ENCRYPTION_KEY!;

/**
 * 🔒 Chiffre un PDF (URI -> fichier .enc)
 * @param fileUri URI du fichier PDF
 * @returns URI du fichier chiffré
 */
export async function encryptPdf(fileUri: string): Promise<string> {
  const base64 = await FileSystem.readAsStringAsync(fileUri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const encrypted = await encryptFernet(base64, ENCRYPTION_KEY);

  const encPath = `${FileSystem.cacheDirectory}pdf_${Date.now()}.enc`;

  await FileSystem.writeAsStringAsync(encPath, encrypted, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  return encPath;
}

/**
 * 🔓 Déchiffre un PDF (.enc -> base64)
 * @param encFileUri URI du fichier chiffré
 * @returns base64 du PDF
 */
export async function decryptPdf(encFileUri: string): Promise<string> {
  const encrypted = await FileSystem.readAsStringAsync(encFileUri, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  const decryptedBase64 = await decryptFernet(encrypted, ENCRYPTION_KEY);

  return decryptedBase64;
}

/**
 * 🧹 Supprime un fichier temporaire chiffré
 */
export async function deleteEncryptedPdf(fileUri: string): Promise<void> {
  try {
    await FileSystem.deleteAsync(fileUri, { idempotent: true });
  } catch (error) {
    console.warn("Erreur suppression fichier PDF :", error);
  }
}
