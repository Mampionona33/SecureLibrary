// utils/cryptoUtils.ts
import CryptoJS from 'crypto-js';
import RNBlobUtil from 'react-native-blob-util';
import { SECURE_LIBRARY_MASTER_KEY } from '@env';

// ✅ Contourner le problème de random
// Utiliser une fonction de randomisation manuelle
const customRandom = (bytes: number): string => {
  let result = '';
  for (let i = 0; i < bytes * 2; i++) {
    result += Math.floor(Math.random() * 16).toString(16);
  }
  return result;
};

// ✅ Remplacer le générateur aléatoire de CryptoJS
CryptoJS.lib.WordArray.random = function (nBytes: number) {
  const words: number[] = [];
  const randomHex = customRandom(nBytes);
  for (let i = 0; i < randomHex.length; i += 8) {
    words.push(parseInt(randomHex.substring(i, i + 8), 16));
  }
  return CryptoJS.lib.WordArray.create(words, nBytes);
};

if (!SECURE_LIBRARY_MASTER_KEY) {
  console.error('❌ SECURE_LIBRARY_MASTER_KEY non définie dans .env');
}

/**
 * Chiffrer un fichier
 */
export const encryptFile = async (
  filePath: string,
  outputPath?: string
): Promise<string> => {
  try {
    console.log('🔑 Chiffrement avec la clé du .env');
    console.log('📁 Chemin du fichier:', filePath);

    const fileContent = await RNBlobUtil.fs.readFile(filePath, 'base64');
    console.log('📄 Fichier lu, taille:', fileContent.length, 'caractères');

    // ✅ Chiffrer avec la clé
    const encrypted = CryptoJS.AES.encrypt(fileContent, SECURE_LIBRARY_MASTER_KEY).toString();
    console.log('🔐 Fichier chiffré');

    const cacheDir = RNBlobUtil.fs.dirs.CacheDir;
    const output = outputPath || `${cacheDir}/${Date.now()}_encrypted.pdf`;
    await RNBlobUtil.fs.writeFile(output, encrypted, 'utf8');
    console.log('✅ Fichier chiffré sauvegardé:', output);

    return output;
  } catch (error) {
    console.error('❌ Erreur chiffrement:', error);
    throw new Error(`Échec du chiffrement du fichier: ${error.message}`);
  }
};

/**
 * Déchiffrer un fichier
 */
export const decryptFile = async (
  encryptedPath: string,
  outputPath?: string
): Promise<string> => {
  try {
    console.log('🔑 Déchiffrement avec la clé du .env');
    console.log('📁 Chemin du fichier chiffré:', encryptedPath);

    const encryptedContent = await RNBlobUtil.fs.readFile(encryptedPath, 'utf8');
    console.log('📄 Fichier chiffré lu');

    const decrypted = CryptoJS.AES.decrypt(encryptedContent, SECURE_LIBRARY_MASTER_KEY).toString(CryptoJS.enc.Utf8);

    if (!decrypted) {
      throw new Error('Déchiffrement échoué');
    }
    console.log('🔓 Fichier déchiffré');

    const cacheDir = RNBlobUtil.fs.dirs.CacheDir;
    const output = outputPath || `${cacheDir}/${Date.now()}_decrypted.pdf`;
    await RNBlobUtil.fs.writeFile(output, decrypted, 'base64');
    console.log('✅ Fichier déchiffré sauvegardé:', output);

    return output;
  } catch (error) {
    console.error('❌ Erreur déchiffrement:', error);
    throw new Error(`Échec du déchiffrement du fichier: ${error.message}`);
  }
};

// ============================================================
// 3. FONCTIONS UTILITAIRES
// ============================================================

export const isKeyConfigured = (): boolean => {
  return Boolean(SECURE_LIBRARY_MASTER_KEY && SECURE_LIBRARY_MASTER_KEY.length > 0);
};

export const isFileEncrypted = async (filePath: string): Promise<boolean> => {
  try {
    const content = await RNBlobUtil.fs.readFile(filePath, 'utf8');
    return content.includes('U2FsdGVkX1');
  } catch {
    return false;
  }
};

export const deleteFile = async (filePath: string): Promise<void> => {
  try {
    const exists = await RNBlobUtil.fs.exists(filePath);
    if (exists) {
      await RNBlobUtil.fs.unlink(filePath);
      console.log('🗑️ Fichier supprimé:', filePath);
    }
  } catch (error) {
    console.error('❌ Erreur suppression fichier:', error);
  }
};

export const getFileSize = async (filePath: string): Promise<number> => {
  try {
    const stats = await RNBlobUtil.fs.stat(filePath);
    return stats.size;
  } catch (error) {
    console.error('❌ Erreur taille fichier:', error);
    return 0;
  }
};
