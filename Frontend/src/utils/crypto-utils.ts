// ⚠️ DOIT être la toute première ligne, avant tout autre import
import "react-native-get-random-values";
import CryptoJS from "crypto-js";

const SECRET_KEY = process.env.EXPO_PUBLIC_PDF_KEY || "default_key";

export function encryptData(data: string): string {
  return CryptoJS.AES.encrypt(data, SECRET_KEY).toString();
}

export function decryptData(cipherText: string): string {
  const bytes = CryptoJS.AES.decrypt(cipherText, SECRET_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
}
