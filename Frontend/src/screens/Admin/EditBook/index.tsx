import { Picker } from '@react-native-picker/picker';
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
  Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { valibotResolver } from '@hookform/resolvers/valibot';

import { useBookStore } from '@store/useBookStore';
import { useCategoryStore } from '@store/useCategoryStore';
import { useAppTheme } from '@theme/useAppTheme';
import { createBookSchema, CreateBookFormType } from '../BookForm/schema';
import { styles } from '../BookForm/styles';
import CategoryPickerModal from '@components/CategoryPickerModal';
import FilePickerComponent from '@components/FilePicker';
import { apiClient } from '@api/client';

const EditBookScreen = ({ route, navigation }: any) => {
  const { bookId } = route.params;
  const { categories, fetchCategories } = useCategoryStore();
  const { theme } = useAppTheme();
  const { colors, spacing, radius } = theme;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [book, setBook] = useState<any>(null);
  const [selectedPdf, setSelectedPdf] = useState<{ uri: string; name: string } | null>(null);
  const [selectedCover, setSelectedCover] = useState<{ uri: string; name: string } | null>(null);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [yearModalVisible, setYearModalVisible] = useState(false);
  const [yearSearch, setYearSearch] = useState('');

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
      status: 'active',
    },
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const loadBookDetails = async () => {
    try {
      setLoading(true);
      setApiError(null);

      const response = await apiClient.get(`/library/books/${bookId}/`);
      const bookData = response.data;

      setBook(bookData);
      setSelectedCategoryId(bookData.category || null);

      reset({
        title: bookData.title || '',
        author: bookData.author || '',
        category: bookData.category || '',
        year: bookData.year || undefined,
        isbn: bookData.isbn || '',
        description: bookData.description || '',
        status: bookData.status || 'active',
      });
    } catch (error: any) {
      let errorMessage = 'Impossible de charger les données du livre.';
      if (error.response?.status === 401) {
        errorMessage = 'Session expirée. Veuillez vous reconnecter.';
        navigation.navigate('Login');
      }
      setApiError(errorMessage);
      Alert.alert('Erreur', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookDetails();
  }, [bookId]);

  const onSubmit = async (data: CreateBookFormType) => {
    setApiError(null);
    setSubmitting(true);

    try {
      const payload: any = {
        title: data.title.trim(),
        author: data.author.trim(),
        status: data.status || 'active',
      };
      
      if (data.category) payload.category = data.category.trim();
      if (data.year) payload.year = Number(data.year);
      if (data.isbn) payload.isbn = data.isbn.trim();
      if (data.description) payload.description = data.description.trim();

      const response = await apiClient.patch(`/library/books/${bookId}/`, payload);
      
      if (response.status >= 200 && response.status < 300) {
        const { updateBook, fetchBooks } = useBookStore.getState();
        await updateBook(bookId, payload);
        await fetchBooks();

        setSubmitting(false);
        setCategoryModalVisible(false);

        Alert.alert('✅ Succès', 'Le livre a été modifié avec succès.', [
          { 
            text: 'OK', 
            onPress: () => {
              navigation.goBack();
            }
          },
        ]);
      } else {
        setSubmitting(false);
        const errorMsg = response.data?.detail || `Erreur ${response.status}`;
        setApiError(errorMsg);
        Alert.alert('❌ Erreur', errorMsg);
      }
    } catch (error: any) {
      setSubmitting(false);
      
      let message = 'Impossible de modifier le livre.';
      
      if (error.response) {
        const status = error.response.status;
        if (status === 401) {
          message = 'Session expirée. Veuillez vous reconnecter.';
          navigation.navigate('Login');
        } else if (status === 404) {
          message = 'Livre non trouvé.';
        } else if (status >= 500) {
          message = 'Erreur serveur. Réessayez plus tard.';
        } else {
          message = error.response.data?.detail || error.message || message;
        }
      } else if (error.request) {
        message = 'Impossible de contacter le serveur.';
      }
      
      setApiError(message);
      Alert.alert('❌ Erreur', message);
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

  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear; year >= 1900; year--) {
      years.push(year);
    }
    return years;
  };

  const getFilteredYears = () => {
    const years = generateYearOptions();
    if (!yearSearch) return years;
    return years.filter(year => String(year).includes(yearSearch));
  };

  const handleYearSelect = (year: number) => {
    setValue('year', year);
    setYearModalVisible(false);
    setYearSearch('');
  };

  if (loading) {
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

            <View style={[styles.inputGroup, { marginBottom: spacing.md }]}>
              <Text style={[styles.label, { color: colors.textSecondary, marginBottom: spacing.xs }]}>
                Catégorie
              </Text>
              <Controller
                control={control}
                name="category"
                render={({ field: { onChange, onBlur, value } }) => (
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
                )}
              />
            </View>

            <View style={[styles.inputGroup, { marginBottom: spacing.md }]}>
              <Text style={[styles.label, { color: colors.textSecondary, marginBottom: spacing.xs }]}>
                Année
              </Text>
              <Controller
                control={control}
                name="year"
                render={({ field: { value } }) => (
                  <>
                    <TouchableOpacity
                      style={[
                        styles.input,
                        {
                          backgroundColor: colors.inputBackground,
                          borderColor: colors.inputBorder,
                          borderRadius: radius.md,
                          paddingHorizontal: spacing.md,
                          justifyContent: 'center',
                          height: 48,
                        },
                      ]}
                      onPress={() => setYearModalVisible(true)}
                    >
                      <Text
                        style={{
                          color: value ? colors.text : colors.placeholder,
                          fontSize: 16,
                        }}
                      >
                        {value || 'Sélectionner une année'}
                      </Text>
                    </TouchableOpacity>

                    <Modal
                      visible={yearModalVisible}
                      transparent={true}
                      animationType="slide"
                      onRequestClose={() => {
                        setYearModalVisible(false);
                        setYearSearch('');
                      }}
                    >
                      <View
                        style={{
                          flex: 1,
                          backgroundColor: 'rgba(0,0,0,0.5)',
                          justifyContent: 'flex-end',
                        }}
                      >
                        <View
                          style={{
                            backgroundColor: colors.background,
                            borderTopLeftRadius: radius.lg,
                            borderTopRightRadius: radius.lg,
                            padding: spacing.lg,
                            maxHeight: '70%',
                          }}
                        >
                          <View
                            style={{
                              flexDirection: 'row',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              marginBottom: spacing.md,
                            }}
                          >
                            <Text
                              style={{
                                fontSize: 18,
                                fontWeight: 'bold',
                                color: colors.text,
                              }}
                            >
                              Sélectionner une année
                            </Text>
                            <TouchableOpacity
                              onPress={() => {
                                setYearModalVisible(false);
                                setYearSearch('');
                              }}
                            >
                              <Text style={{ color: colors.danger, fontSize: 18 }}>✕</Text>
                            </TouchableOpacity>
                          </View>

                          <TextInput
                            style={{
                              backgroundColor: colors.inputBackground,
                              borderColor: colors.inputBorder,
                              borderWidth: 1,
                              borderRadius: radius.md,
                              paddingHorizontal: spacing.md,
                              paddingVertical: spacing.sm,
                              color: colors.text,
                              marginBottom: spacing.md,
                              fontSize: 16,
                            }}
                            placeholder="Rechercher une année..."
                            placeholderTextColor={colors.placeholder}
                            value={yearSearch}
                            onChangeText={setYearSearch}
                            keyboardType="numeric"
                          />

                          <FlatList
                            data={getFilteredYears()}
                            keyExtractor={(item) => String(item)}
                            showsVerticalScrollIndicator={true}
                            style={{ maxHeight: 400 }}
                            renderItem={({ item }) => (
                              <TouchableOpacity
                                style={{
                                  paddingVertical: spacing.md,
                                  paddingHorizontal: spacing.md,
                                  borderBottomWidth: 1,
                                  borderBottomColor: colors.border,
                                  backgroundColor: value === item ? colors.primary + '20' : 'transparent',
                                }}
                                onPress={() => handleYearSelect(item)}
                              >
                                <Text
                                  style={{
                                    color: value === item ? colors.primary : colors.text,
                                    fontWeight: value === item ? 'bold' : 'normal',
                                    fontSize: 16,
                                  }}
                                >
                                  {item}
                                  {value === item && ' ✓'}
                                </Text>
                              </TouchableOpacity>
                            )}
                            ListEmptyComponent={
                              <Text
                                style={{
                                  textAlign: 'center',
                                  color: colors.textSecondary,
                                  padding: spacing.lg,
                                }}
                              >
                                Aucune année trouvée
                              </Text>
                            }
                          />
                        </View>
                      </View>
                    </Modal>
                  </>
                )}
              />
            </View>

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

            <View style={[styles.inputGroup, { marginBottom: spacing.md }]}>
              <Text style={[styles.label, { color: colors.textSecondary, marginBottom: spacing.xs }]}>
                Statut
              </Text>
              <Controller
                control={control}
                name="status"
                render={({ field: { onChange, value } }) => (
                  <View style={{ flexDirection: 'row', gap: 12 }}>
                    <TouchableOpacity
                      style={[
                        {
                          flex: 1,
                          paddingVertical: 12,
                          borderRadius: radius.md,
                          borderWidth: 2,
                          alignItems: 'center',
                          backgroundColor: value === 'active' ? colors.success + '20' : colors.inputBackground,
                          borderColor: value === 'active' ? colors.success : colors.border,
                        },
                      ]}
                      onPress={() => onChange('active')}
                    >
                      <Text
                        style={{
                          color: value === 'active' ? colors.success : colors.textSecondary,
                          fontWeight: value === 'active' ? 'bold' : 'normal',
                        }}
                      >
                        ✅ Actif
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[
                        {
                          flex: 1,
                          paddingVertical: 12,
                          borderRadius: radius.md,
                          borderWidth: 2,
                          alignItems: 'center',
                          backgroundColor: value === 'archived' ? colors.danger + '20' : colors.inputBackground,
                          borderColor: value === 'archived' ? colors.danger : colors.border,
                        },
                      ]}
                      onPress={() => onChange('archived')}
                    >
                      <Text
                        style={{
                          color: value === 'archived' ? colors.danger : colors.textSecondary,
                          fontWeight: value === 'archived' ? 'bold' : 'normal',
                        }}
                      >
                        📦 Archivé
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              />
            </View>

            <FilePickerComponent
              selectedFile={selectedPdf}
              onFileSelected={setSelectedPdf}
              label="Fichier PDF"
              placeholder={book.pdf_file ? '📄 PDF existant - Choisir pour remplacer' : 'Choisir un fichier PDF'}
              testID="edit-book-pdf-picker"
              type="pdf"
            />

            <FilePickerComponent
              selectedFile={selectedCover}
              onFileSelected={setSelectedCover}
              label="Image de couverture"
              placeholder={book.cover_image ? '🖼️ Image existante - Choisir pour remplacer' : 'Choisir une image'}
              testID="edit-book-cover-picker"
              type="image"
            />

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
