interface PDFSource {
  uri: string;
  cache?: boolean;
  headers?: { [key: string]: string };
}

/**
 * Prépare la source du PDF en injectant si nécessaire les headers d'authentification
 * requis par ton backend Django pour sécuriser l'accès aux livres.
 */
export const preparePDFSource = (bookUrl: string, token?: string): PDFSource => {
  const isRemote = bookUrl.startsWith('http://') || bookUrl.startsWith('https://');

  return {
    uri: bookUrl,
    cache: true, // Active le cache local pour ne pas re-télécharger le PDF à chaque ouverture
    headers: isRemote && token ? { 'Authorization': `Bearer ${token}` } : undefined,
  };
};

/**
 * Calcule le pourcentage de progression de la lecture.
 */
export const calculateReadingProgress = (currentPage: number, totalPages: number): number => {
  if (totalPages <= 0) return 0;
  return Math.round((currentPage / totalPages) * 100);
};
