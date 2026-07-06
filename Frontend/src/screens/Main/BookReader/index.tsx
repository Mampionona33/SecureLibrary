import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Pdf from 'react-native-pdf';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '@navigation/types';

// Co-localisation
import { preparePDFSource, calculateReadingProgress } from './pdfHandler';
import { styles } from './styles';

type Props = NativeStackScreenProps<MainStackParamList, 'BookReader'>;

const BookReaderScreen = ({ route, navigation }: Props) => {
  // On récupère les infos du livre passées par l'écran de la liste des livres (BookList)
  const { bookId, title, fileUrl } = route.params;

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [isError, setIsError] = useState<boolean>(false);

  // TODO: Récupérer le vrai token depuis AuthContext plus tard
  const mockToken = "votre_token_jwt_ici";

  // Mémoisation de la source pour éviter de re-télécharger à chaque re-render
  const pdfSource = useMemo(() => preparePDFSource(fileUrl, mockToken), [fileUrl]);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Bar / Header de lecture */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>🔕 Fermer</Text>
        </TouchableOpacity>
        <Text style={styles.bookTitle} numberOfLines={1}>{title}</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Zone d'affichage du PDF */}
      <View style={styles.container}>
        <Pdf
          trustAllCerts={false} // Option sécuritaire recommandée pour Android
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
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color="#ffffff" />
              <Text style={styles.loadingText}>Déchiffrement et chargement du livre...</Text>
            </View>
          )}
        />

        {/* Si une erreur fatale survient en dehors du composant PDF */}
        {isError && (
          <View style={styles.centerContainer}>
            <Text style={styles.errorText}>Le document n'a pas pu être affiché.</Text>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Text style={[styles.backButtonText, { color: '#3b82f6' }]}>Retour à la bibliothèque</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Barre d'état inférieure (Pagination & Progression) */}
      {!isError && totalPages > 0 && (
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Page {currentPage} / {totalPages}
          </Text>
          <Text style={styles.footerText}>
            {calculateReadingProgress(currentPage, totalPages)}% lu
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

export default BookReaderScreen;
