import "react-native-get-random-values";
import CryptoJS from "crypto-js";
import { Buffer } from "buffer";
import * as Crypto from "expo-crypto";

/**
 * Convertit un Buffer en WordArray pour CryptoJS
 */
function bufferToWordArray(buf: Buffer) {
  const words: number[] = [];
  for (let i = 0; i < buf.length; i++) {
    words[(i / 4) | 0] |= buf[i] << (24 - 8 * (i % 4));
  }
  return CryptoJS.lib.WordArray.create(words, buf.length);
}

/**
 * Gère le format Base64Url (propre à Fernet)
 */
function base64UrlToBuffer(base64url: string) {
  const base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  return Buffer.from(base64 + padding, "base64");
}

/**
 * DÉCHIFFREMENT (Format Fernet)
 */
export function decryptFernet(token: string, key: string): string {
  try {
    const tokenBytes = base64UrlToBuffer(token.trim());
    const fullKey = base64UrlToBuffer(key.trim());

    // 1. Vérification de la signature (HMAC)
    const signingKeyBytes = fullKey.slice(0, 16);
    const partToSign = tokenBytes.slice(0, tokenBytes.length - 32);
    const hmacExpected = tokenBytes.slice(tokenBytes.length - 32);

    const hmacCalculated = CryptoJS.HmacSHA256(
      bufferToWordArray(partToSign),
      bufferToWordArray(signingKeyBytes),
    );
    const hmacCalculatedBuffer = Buffer.from(
      CryptoJS.enc.Hex.stringify(hmacCalculated),
      "hex",
    );

    if (!hmacCalculatedBuffer.equals(hmacExpected)) {
      throw new Error(
        "Signature invalide : le fichier a été modifié ou la clé est incorrecte.",
      );
    }

    // Fernet : IV (16 octets à partir de l'index 9)
    const ivBytes = tokenBytes.slice(9, 25);
    // Ciphertext : Entre l'IV et le HMAC (32 derniers octets)
    const ciphertextBytes = tokenBytes.slice(25, tokenBytes.length - 32);
    // Clé AES : 16 derniers octets de la clé Fernet
    const aesKeyBytes = fullKey.slice(16);

    const aesKey = bufferToWordArray(aesKeyBytes);
    const iv = bufferToWordArray(ivBytes);
    const ciphertext = bufferToWordArray(ciphertextBytes);

    const decrypted = CryptoJS.AES.decrypt({ ciphertext } as any, aesKey, {
      iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });

    const hex = CryptoJS.enc.Hex.stringify(decrypted);
    if (!hex) throw new Error("Déchiffrement échoué (clé incorrecte ?)");

    return Buffer.from(hex, "hex").toString("base64");
  } catch (err: any) {
    console.error("❌ Erreur Decrypt:", err.message);
    throw err;
  }
}

/**
 * CHIFFREMENT (Format Fernet)
 * Utilisé avant d'envoyer le fichier au backend
 */
export async function encryptFernet(
  base64Data: string,
  key: string,
): Promise<string> {
  try {
    const fullKey = base64UrlToBuffer(key.trim());
    const aesKeyBytes = fullKey.slice(16);
    const signingKeyBytes = fullKey.slice(0, 16);

    // Utilisation de expo-crypto pour générer un IV sécurisé
    const randomBytes = await Crypto.getRandomBytesAsync(16); // Uint8Array
    const iv = bufferToWordArray(Buffer.from(randomBytes)); // Convertir en Buffer, puis en WordArray
    const aesKey = bufferToWordArray(aesKeyBytes);
    const data = CryptoJS.enc.Base64.parse(base64Data);

    const encrypted = CryptoJS.AES.encrypt(data, aesKey, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });

    const ciphertext = encrypted.ciphertext;

    // Construction du Token Fernet
    const version = Buffer.from([0x80]); // Version 128
    const timestamp = Buffer.alloc(8);
    const now = Math.floor(Date.now() / 1000);
    timestamp.writeUInt32BE(0, 0); // Fernet utilise 8 octets pour le timestamp
    timestamp.writeUInt32BE(now, 4);

    const ivBuffer = Buffer.from(CryptoJS.enc.Hex.stringify(iv), "hex");
    const ciphertextBuffer = Buffer.from(
      CryptoJS.enc.Hex.stringify(ciphertext),
      "hex",
    );

    const partToSign = Buffer.concat([
      version,
      timestamp,
      ivBuffer,
      ciphertextBuffer,
    ]);

    // HMAC SHA256 pour l'intégrité
    const hmac = CryptoJS.HmacSHA256(
      bufferToWordArray(partToSign),
      bufferToWordArray(signingKeyBytes),
    );
    const hmacBuffer = Buffer.from(CryptoJS.enc.Hex.stringify(hmac), "hex");

    const finalToken = Buffer.concat([partToSign, hmacBuffer]);

    return finalToken
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");
  } catch (err: any) {
    console.error("❌ Erreur Encrypt:", err.message);
    throw err;
  }
}
