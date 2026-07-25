import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Pdf from 'react-native-pdf';
import RNBlobUtil from 'react-native-blob-util';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '@navigation/types';
import { decryptFile, deleteFile, isFileEncrypted } from '@utils/cryptoUtils';
import { styles } from './styles';

type Props = NativeStackScreenProps<MainStackParamList, 'BookReader'>;

const BookReaderScreen = ({ route, navigation }: Props) => {
  const { bookId, title, fileUrl } = route.params;

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [isError, setIsError] = useState<boolean>(false);
  const [pdfSource, setPdfSource] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [decryptedPath, setDecryptedPath] = useState<string | null>(null);

  useEffect(() => {
    const loadAndDecryptPDF = async () => {
      try {
        setLoading(true);
        setIsError(false);

        // 1. Vérifier si le fichier existe en local
        const fileName = fileUrl?.split('/').pop() || `${bookId}.pdf`;
        const localPath = `${RNBlobUtil.fs.dirs.DocumentDir}/${fileName}`;
        const exists = await RNBlobUtil.fs.exists(localPath);

        let sourcePath: string;

        if (exists) {
          console.log('📄 Fichier local trouvé:', localPath);
          sourcePath = localPath;
        } else if (fileUrl) {
          // 2. Télécharger depuis l'URL
          console.log('📥 Téléchargement du PDF depuis:', fileUrl);
          const response = await fetch(fileUrl);
          const base64 = await response.text();
          await RNBlobUtil.fs.writeFile(localPath, base64, 'base64');
          console.log('✅ Fichier téléchargé:', localPath);
          sourcePath = localPath;
        } else {
          throw new Error('Aucune source de fichier disponible.');
        }

        // 3. Vérifier si le fichier est chiffré
        const isEncrypted = await isFileEncrypted(sourcePath);
        console.log('🔐 Fichier chiffré:', isEncrypted);

        let finalPath: string;

        if (isEncrypted) {
          // 4. Déchiffrer le fichier
          console.log('🔓 Déchiffrement du fichier...');
          const decrypted = await decryptFile(sourcePath);
          console.log('✅ Fichier déchiffré:', decrypted);
          finalPath = decrypted;
          setDecryptedPath(decrypted);
        } else {
          // 5. Utiliser le fichier tel quel
          finalPath = sourcePath;
        }

        // 6. Préparer la source pour le PDFView
        const pdfUri = Platform.OS === 'android' ? `file://${finalPath}` : finalPath;
        setPdfSource({ uri: pdfUri, cache: true });

      } catch (err) {
        console.error('❌ Erreur chargement PDF:', err);
        setIsError(true);
        Alert.alert('Erreur', 'Impossible de charger le PDF. Veuillez réessayer.');
      } finally {
        setLoading(false);
      }
    };

    loadAndDecryptPDF();

    // Nettoyer le fichier déchiffré à la fermeture
    return () => {
      if (decryptedPath) {
        deleteFile(decryptedPath);
      }
    };
  }, [bookId, fileUrl]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Déchiffrement et chargement du livre...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Bar / Header de lecture */}
      <View style={styles.header}>
        <TouchableOpacity
          testID="bookreader-back-button"
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Retour</Text>
        </TouchableOpacity>
        <Text testID="bookreader-title" style={styles.bookTitle} numberOfLines={1}>
          {title}
        </Text>
        <View style={styles.placeholder} />
      </View>

      {/* Zone d'affichage du PDF */}
      <View style={styles.container}>
        {!isError && pdfSource ? (
          <Pdf
            testID="bookreader-pdf"
            trustAllCerts={false}
            source={pdfSource}
            onLoadComplete={(numberOfPages) => {
              setTotalPages(numberOfPages);
              setIsError(false);
            }}
            onPageChanged={(page) => {
              setCurrentPage(page);
            }}
            onError={(error) => {
              console.error('Erreur de lecture PDF :', error);
              setIsError(true);
              Alert.alert('Erreur', 'Impossible de charger ce document PDF.');
            }}
            onPressLink={(uri) => {
              console.log(`Lien cliqué dans le PDF : ${uri}`);
            }}
            style={styles.pdf}
            renderActivityIndicator={() => (
              <View testID="bookreader-loader" style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#3b82f6" />
                <Text style={styles.loadingText}>Chargement du PDF...</Text>
              </View>
            )}
          />
        ) : (
          <View testID="bookreader-error" style={styles.centerContainer}>
            <Text style={styles.errorText}>Le document n'a pas pu être affiché.</Text>
            <TouchableOpacity
              testID="bookreader-error-back-button"
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={[styles.backButtonText, { color: '#3b82f6' }]}>Retour à la bibliothèque</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Barre d'état inférieure (Pagination & Progression) */}
      {!isError && totalPages > 0 && (
        <View testID="bookreader-footer" style={styles.footer}>
          <Text testID="bookreader-page-info" style={styles.footerText}>
            Page {currentPage} / {totalPages}
          </Text>
          <Text testID="bookreader-progress" style={styles.footerText}>
            {Math.round((currentPage / totalPages) * 100)}% lu
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

export default BookReaderScreen;
