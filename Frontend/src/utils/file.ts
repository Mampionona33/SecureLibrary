import * as FileSystem from "expo-file-system";

const cacheDir = (FileSystem as any).cacheDirectory;

/**
 * 🔒 Copie fichier vers cache stable
 */
export async function prepareFile(uri: string, name: string): Promise<string> {
  if (!uri) throw new Error("URI invalide");

  const uniqueId =
    Date.now() + "_" + Math.random().toString(36).substring(2, 10);

  const safeName = `${uniqueId}_${name}`;

  const newPath = `${cacheDir}${safeName}`;

  await FileSystem.copyAsync({
    from: uri,
    to: newPath,
  });

  return newPath;
}

/**
 * 🧹 delete file
 */
export async function deleteFile(uri: string) {
  try {
    await FileSystem.deleteAsync(uri, { idempotent: true });
  } catch (e) {
    console.warn("deleteFile error:", e);
  }
}
