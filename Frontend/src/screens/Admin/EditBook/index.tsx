import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { valibotResolver } from '@hookform/resolvers/valibot';

import { useBookStore } from '@store/useBookStore';
import { useCategoryStore } from '@store/useCategoryStore';
import { useAppTheme } from '@theme/useAppTheme';
import { createBookSchema, CreateBookFormType } from '../CreateBook/schema';
import { styles } from '../CreateBook/styles';
import CategoryPickerModal from '@components/CategoryPickerModal';
import FilePickerComponent from '@components/FilePicker';

const EditBookScreen = ({ route, navigation }: any) => {
  const { bookId } = route.params;
  const { categories } = useCategoryStore();
  const { theme } = useAppTheme();
  const { colors, spacing, radius } = theme;

  // 🔥 Utiliser le store
  const { books, updateBook, fetchBooks, loading: storeLoading } = useBookStore();

  // États locaux
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [book, setBook] = useState<any>(null);
  const [selectedPdf, setSelectedPdf] = useState<{ uri: string; name: string } | null>(null);
  const [selectedCover, setSelectedCover] = useState<{ uri: string; name: string } | null>(null);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<CreateBookFormType>({
    resolver: valibotResolver(createBookSchema),
    defaultValues: {
      title: '',
      author: '',
      category: '',
      year: undefined,
      isbn: '',
      description: '',
    },
  });

  // 🔥 Récupérer les données du livre depuis le store
  const loadBookDetails = async () => {
    try {
      setLoading(true);
      setApiError(null);

      console.log('📚 Loading book details for ID:', bookId);

      // Vérifier si le livre est déjà dans le store
      let bookData = books.find((b) => b.id === bookId);

      // Si pas trouvé, charger tous les livres
      if (!bookData) {
        console.log('📚 Book not in store, fetching all books...');
        await fetchBooks();
        // Récupérer depuis le store après fetch
        const updatedBooks = useBookStore.getState().books;
        bookData = updatedBooks.find((b) => b.id === bookId);
      }

      if (bookData) {
        console.log('✅ Book found:', bookData.title);
        setBook(bookData);
        setSelectedCategoryId(bookData.category || null);

        // Remplir le formulaire
        reset({
          title: bookData.title || '',
          author: bookData.author || '',
          category: bookData.category || '',
          year: bookData.year || undefined,
          isbn: bookData.isbn || '',
          description: bookData.description || '',
        });
      } else {
        console.log('❌ Book not found');
        setApiError('Livre non trouvé.');
      }
    } catch (error: any) {
      console.error('❌ Error loading book:', error);
      setApiError(error.message || 'Impossible de charger les données du livre.');
    } finally {
      setLoading(false);
    }
  };

  // Charger les données au montage du composant
  useEffect(() => {
    loadBookDetails();
  }, [bookId]);

  const onSubmit = async (data: CreateBookFormType) => {
    setApiError(null);
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('title', data.title.trim());
      formData.append('author', data.author.trim());
      if (data.category) formData.append('category', data.category.trim());
      if (data.year) formData.append('year', String(data.year));
      if (data.isbn) formData.append('isbn', data.isbn.trim());
      if (data.description) formData.append('description', data.description.trim());

      if (selectedPdf) {
        formData.append('pdf_file', {
          uri: selectedPdf.uri,
          type: 'application/pdf',
          name: selectedPdf.name,
        } as any);
      }

      if (selectedCover) {
        formData.append('cover_image', {
          uri: selectedCover.uri,
          type: 'image/jpeg',
          name: selectedCover.name,
        } as any);
      }

      console.log('📤 Updating book...');
      
      // 🔥 Utiliser updateBook du store
      await updateBook(bookId, formData);

      console.log('✅ Book updated successfully');

      setSubmitting(false);
      Alert.alert('Succès', 'Le livre a été modifié avec succès.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      console.error('❌ Update error:', error);
      setSubmitting(false);
      
      const message = error.response?.data?.non_field_errors?.[0] ||
                      error.response?.data?.detail ||
                      error.message ||
                      'Impossible de modifier le livre.';
      setApiError(message);
      Alert.alert('Erreur', message);
    }
  };

  const handleCategorySelect = (categoryId: string | null) => {
    setSelectedCategoryId(categoryId);
    setValue('category', categoryId || '');
  };

  const getCategoryName = (id: string | null) => {
    if (!id) return 'Aucune';
    const category = categories.find((c) => c.id === id);
    return category ? category.name : 'Aucune';
  };

  // ============================================================
  // RENDER STATES
  // ============================================================

  // État : Chargement
  if (loading || storeLoading) {
    return (
      <SafeAreaView style={[{ backgroundColor: colors.background, flex: 1 }]}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ marginTop: 20, color: colors.textSecondary, fontSize: 16 }}>
            Chargement du livre...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // État : Erreur
  if (apiError && !book) {
    return (
      <SafeAreaView style={[{ backgroundColor: colors.background, flex: 1 }]}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ color: colors.danger, fontSize: 18, textAlign: 'center' }}>
            {apiError}
          </Text>
          <View style={{ flexDirection: 'row', marginTop: 20 }}>
            <TouchableOpacity
              onPress={loadBookDetails}
              style={{
                backgroundColor: colors.primary,
                paddingHorizontal: 20,
                paddingVertical: 12,
                borderRadius: 8,
                marginRight: 10,
              }}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>Réessayer</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{
                backgroundColor: colors.border,
                paddingHorizontal: 20,
                paddingVertical: 12,
                borderRadius: 8,
              }}
            >
              <Text style={{ color: colors.text, fontWeight: 'bold' }}>Retour</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // État : Livre non trouvé
  if (!book) {
    return (
      <SafeAreaView style={[{ backgroundColor: colors.background, flex: 1 }]}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ color: colors.danger, fontSize: 18, textAlign: 'center' }}>
            📕 Livre non trouvé
          </Text>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{
              backgroundColor: colors.primary,
              paddingHorizontal: 20,
              paddingVertical: 12,
              borderRadius: 8,
              marginTop: 20,
            }}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>Retour</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ============================================================
  // RENDER PRINCIPAL
  // ============================================================

  return (
    <SafeAreaView style={[{ backgroundColor: colors.background, flex: 1 }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xl }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={true}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md }}>
            <Text
              testID="edit-book-title"
              style={[styles.title, { color: colors.text, flex: 1 }]}
            >
              Modifier le livre
            </Text>
            <TouchableOpacity
              onPress={loadBookDetails}
              style={{ padding: 8 }}
            >
              <Text style={{ color: colors.primary, fontSize: 16 }}>⟳</Text>
            </TouchableOpacity>
          </View>

          {apiError && (
            <View
              testID="edit-book-api-error"
              style={[
                styles.errorBanner,
                {
                  backgroundColor: colors.danger + '20',
                  borderLeftColor: colors.danger,
                  borderRadius: radius.md,
                  padding: spacing.md,
                  marginBottom: spacing.md,
                },
              ]}
            >
              <Text style={[styles.errorBannerText, { color: colors.danger }]}>
                {apiError}
              </Text>
            </View>
          )}

          <View
            style={[
              styles.formCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderRadius: radius.lg,
                padding: spacing.lg,
                marginBottom: spacing.xl,
              },
            ]}
          >
            {/* Titre */}
            <View style={[styles.inputGroup, { marginBottom: spacing.md }]}>
              <Text style={[styles.label, { color: colors.textSecondary, marginBottom: spacing.xs }]}>
                Titre *
              </Text>
              <Controller
                control={control}
                name="title"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    testID="edit-book-title-input"
                    style={[
                      styles.input,
                      {
                        backgroundColor: colors.inputBackground,
                        borderColor: errors.title ? colors.danger : colors.inputBorder,
                        color: colors.text,
                        borderRadius: radius.md,
                        paddingHorizontal: spacing.md,
                      },
                      errors.title && { backgroundColor: colors.danger + '10' },
                    ]}
                    placeholder="Ex: Le Seigneur des Anneaux"
                    placeholderTextColor={colors.placeholder}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
              {errors.title && (
                <Text
                  testID="edit-book-title-error"
                  style={[styles.fieldErrorText, { color: colors.danger, marginTop: spacing.xs }]}
                >
                  {errors.title.message}
                </Text>
              )}
            </View>

            {/* Auteur */}
            <View style={[styles.inputGroup, { marginBottom: spacing.md }]}>
              <Text style={[styles.label, { color: colors.textSecondary, marginBottom: spacing.xs }]}>
                Auteur *
              </Text>
              <Controller
                control={control}
                name="author"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    testID="edit-book-author-input"
                    style={[
                      styles.input,
                      {
                        backgroundColor: colors.inputBackground,
                        borderColor: errors.author ? colors.danger : colors.inputBorder,
                        color: colors.text,
                        borderRadius: radius.md,
                        paddingHorizontal: spacing.md,
                      },
                      errors.author && { backgroundColor: colors.danger + '10' },
                    ]}
                    placeholder="Ex: J.R.R. Tolkien"
                    placeholderTextColor={colors.placeholder}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
              {errors.author && (
                <Text
                  testID="edit-book-author-error"
                  style={[styles.fieldErrorText, { color: colors.danger, marginTop: spacing.xs }]}
                >
                  {errors.author.message}
                </Text>
              )}
            </View>

            {/* Catégorie */}
            <View style={[styles.inputGroup, { marginBottom: spacing.md }]}>
              <Text style={[styles.label, { color: colors.textSecondary, marginBottom: spacing.xs }]}>
                Catégorie
              </Text>
              <TouchableOpacity
                testID="edit-book-category-select"
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.inputBackground,
                    borderColor: colors.inputBorder,
                    borderRadius: radius.md,
                    paddingHorizontal: spacing.md,
                    justifyContent: 'center',
                  },
                ]}
                onPress={() => setCategoryModalVisible(true)}
              >
                <Text
                  style={[
                    styles.categorySelectorText,
                    { color: selectedCategoryId ? colors.text : colors.placeholder },
                  ]}
                >
                  {selectedCategoryId ? getCategoryName(selectedCategoryId) : 'Sélectionner une catégorie'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Année */}
            <View style={[styles.inputGroup, { marginBottom: spacing.md }]}>
              <Text style={[styles.label, { color: colors.textSecondary, marginBottom: spacing.xs }]}>
                Année
              </Text>
              <Controller
                control={control}
                name="year"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    testID="edit-book-year-input"
                    style={[
                      styles.input,
                      {
                        backgroundColor: colors.inputBackground,
                        borderColor: colors.inputBorder,
                        color: colors.text,
                        borderRadius: radius.md,
                        paddingHorizontal: spacing.md,
                      },
                    ]}
                    placeholder="Ex: 1954"
                    placeholderTextColor={colors.placeholder}
                    keyboardType="numeric"
                    onBlur={onBlur}
                    onChangeText={(text) => {
                      const num = text ? Number(text) : undefined;
                      onChange(num);
                    }}
                    value={value !== undefined && value !== null ? String(value) : ''}
                  />
                )}
              />
            </View>

            {/* ISBN */}
            <View style={[styles.inputGroup, { marginBottom: spacing.md }]}>
              <Text style={[styles.label, { color: colors.textSecondary, marginBottom: spacing.xs }]}>
                ISBN
              </Text>
              <Controller
                control={control}
                name="isbn"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    testID="edit-book-isbn-input"
                    style={[
                      styles.input,
                      {
                        backgroundColor: colors.inputBackground,
                        borderColor: colors.inputBorder,
                        color: colors.text,
                        borderRadius: radius.md,
                        paddingHorizontal: spacing.md,
                      },
                    ]}
                    placeholder="Ex: 978-3-16-148410-0"
                    placeholderTextColor={colors.placeholder}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value || ''}
                  />
                )}
              />
            </View>

            {/* Description */}
            <View style={[styles.inputGroup, { marginBottom: spacing.md }]}>
              <Text style={[styles.label, { color: colors.textSecondary, marginBottom: spacing.xs }]}>
                Description
              </Text>
              <Controller
                control={control}
                name="description"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    testID="edit-book-description-input"
                    style={[
                      styles.input,
                      styles.textArea,
                      {
                        backgroundColor: colors.inputBackground,
                        borderColor: colors.inputBorder,
                        color: colors.text,
                        borderRadius: radius.md,
                        paddingHorizontal: spacing.md,
                      },
                    ]}
                    placeholder="Résumé du livre..."
                    placeholderTextColor={colors.placeholder}
                    multiline
                    numberOfLines={4}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value || ''}
                  />
                )}
              />
            </View>

            {/* Fichier PDF */}
            <FilePickerComponent
              selectedFile={selectedPdf}
              onFileSelected={setSelectedPdf}
              label="Fichier PDF"
              placeholder={book.pdf_file ? '📄 PDF existant - Choisir pour remplacer' : 'Choisir un fichier PDF'}
              testID="edit-book-pdf-picker"
              type="pdf"
            />

            {/* Image de couverture */}
            <FilePickerComponent
              selectedFile={selectedCover}
              onFileSelected={setSelectedCover}
              label="Image de couverture"
              placeholder={book.cover_image ? '🖼️ Image existante - Choisir pour remplacer' : 'Choisir une image'}
              testID="edit-book-cover-picker"
              type="image"
            />

            {/* Info de dernière mise à jour */}
            <View style={{ marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border }}>
              <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                Dernière modification: {book.updated_at ? new Date(book.updated_at).toLocaleString() : 'N/A'}
              </Text>
              <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                Créé le: {book.created_at ? new Date(book.created_at).toLocaleString() : 'N/A'}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            testID="edit-book-submit"
            style={[
              styles.submitButton,
              {
                backgroundColor: colors.buttonPrimary,
                borderRadius: radius.md,
                height: 48,
              },
              (submitting || loading) && { backgroundColor: colors.disabled },
            ]}
            onPress={handleSubmit(onSubmit)}
            disabled={submitting || loading}
          >
            {submitting ? (
              <ActivityIndicator testID="edit-book-loading" color={colors.buttonPrimaryText} />
            ) : (
              <Text style={[styles.submitButtonText, { color: colors.buttonPrimaryText }]}>
                Mettre à jour le livre
              </Text>
            )}
          </TouchableOpacity>

          {/* Bouton de rafraîchissement des données */}
          <TouchableOpacity
            onPress={loadBookDetails}
            style={{
              marginTop: spacing.md,
              paddingVertical: 12,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
              ↻ Actualiser les données
            </Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>

      <CategoryPickerModal
        visible={categoryModalVisible}
        onSelect={handleCategorySelect}
        onClose={() => setCategoryModalVisible(false)}
        selectedValue={selectedCategoryId}
      />
    </SafeAreaView>
  );
};

export default EditBookScreen;
