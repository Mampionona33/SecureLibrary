// screens/Admin/BookForm/index.tsx
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
import RNBlobUtil from 'react-native-blob-util';

import { useBookStore } from '@store/useBookStore';
import { useCategoryStore } from '@store/useCategoryStore';
import { useAppTheme } from '@theme/useAppTheme';
import { createBookSchema, CreateBookFormType } from './schema';
import { styles } from './styles';
import SelectionModal, { SelectionItem } from '@components/SelectionModal';
import FilePickerComponent from '@components/FilePicker';
import { encryptFile } from '@utils/cryptoUtils';
import { apiClient } from '@api/client';

interface BookFormProps {
  navigation: any;
  bookId?: string;
  submitLabel?: string;
  onSuccessMsg?: string;
  isEditing?: boolean;
}

const BookForm: React.FC<BookFormProps> = ({
  navigation,
  bookId,
  submitLabel = 'Enregistrer',
  onSuccessMsg = 'Opération réussie.',
  isEditing = false,
}) => {
  const { createBook, updateBook, fetchBooks } = useBookStore();
  const { categories, fetchCategories } = useCategoryStore();
  const { theme } = useAppTheme();
  const { colors, spacing, radius } = theme;

  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [selectedPdf, setSelectedPdf] = useState<{ uri: string; name: string } | null>(null);
  const [selectedCover, setSelectedCover] = useState<{ uri: string; name: string } | null>(null);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [yearModalVisible, setYearModalVisible] = useState(false);
  const [selectedYear, setSelectedYear] = useState<number | undefined>(undefined);

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

  useEffect(() => {
    if (isEditing && bookId) {
      loadBookData();
    }
  }, [bookId, isEditing]);

  // ✅ Générer les années de 1900 à aujourd'hui
  const generateYears = (): number[] => {
    const currentYear = new Date().getFullYear();
    const years: number[] = [];
    for (let year = currentYear; year >= 1900; year--) {
      years.push(year);
    }
    return years;
  };

  const loadBookData = async () => {
    try {
      setLoading(true);
      setApiError(null);
      const response = await apiClient.get(`/library/books/${bookId}/`);
      const bookData = response.data;
      setSelectedCategoryId(bookData.category || null);
      setSelectedYear(bookData.year || undefined);
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

  const onSubmit = async (data: CreateBookFormType) => {
    setApiError(null);
    setLoading(true);

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

      if (selectedPdf) {
        const encryptedPath = await encryptFile(selectedPdf.uri);
        const base64 = await RNBlobUtil.fs.readFile(encryptedPath, 'base64');
        payload.pdf_file_encrypted = base64;
        await RNBlobUtil.fs.unlink(encryptedPath);
      }

      if (selectedCover) {
        const coverBase64 = await RNBlobUtil.fs.readFile(selectedCover.uri, 'base64');
        payload.cover_image_base64 = coverBase64;
      }

      if (isEditing && bookId) {
        await updateBook(bookId, payload);
      } else {
        await createBook(payload);
      }

      await fetchBooks(true);
      setLoading(false);
      setSelectedPdf(null);
      setSelectedCover(null);

      Alert.alert('Succès', onSuccessMsg, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      setLoading(false);
      const message = error.response?.data?.detail || error.message || 'Une erreur est survenue.';
      setApiError(message);
      Alert.alert('Erreur', message);
    }
  };

  const handleCategorySelect = (category: SelectionItem) => {
    const categoryId = category.id;
    setSelectedCategoryId(categoryId);
    setValue('category', categoryId);
  };

  const handleYearSelect = (item: SelectionItem) => {
    const year = item.value;
    setSelectedYear(year);
    setValue('year', year);
  };

  const getCategoryName = (id: string | null) => {
    if (!id) return 'Aucune';
    const category = categories.find((c) => c.id === id);
    return category ? category.name : 'Aucune';
  };

  const categoryItems: SelectionItem[] = categories.map((cat) => ({
    id: cat.id,
    label: cat.name,
    ...cat,
  }));

  // ✅ Années en SelectionItem
  const yearItems: SelectionItem[] = generateYears().map((year) => ({
    id: String(year),
    label: String(year),
    value: year,
  }));

  if (loading && isEditing) {
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
          <Text
            testID={isEditing ? "edit-book-title" : "create-book-title"}
            style={[styles.title, { color: colors.text, marginBottom: spacing.lg }]}
          >
            {isEditing ? 'Modifier le livre' : 'Nouveau Livre'}
          </Text>

          {apiError && (
            <View
              testID={isEditing ? "edit-book-api-error" : "create-book-api-error"}
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
                    testID={isEditing ? "edit-book-title-input" : "create-book-title-input"}
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
                  testID={isEditing ? "edit-book-title-error" : "create-book-title-error"}
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
                    testID={isEditing ? "edit-book-author-input" : "create-book-author-input"}
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
                  testID={isEditing ? "edit-book-author-error" : "create-book-author-error"}
                  style={[styles.fieldErrorText, { color: colors.danger, marginTop: spacing.xs }]}
                >
                  {errors.author.message}
                </Text>
              )}
            </View>

            {/* Catégorie avec SelectionModal */}
            <View style={[styles.inputGroup, { marginBottom: spacing.md }]}>
              <Text style={[styles.label, { color: colors.textSecondary, marginBottom: spacing.xs }]}>
                Catégorie
              </Text>
              <TouchableOpacity
                testID={isEditing ? "edit-book-category-select" : "create-book-category-select"}
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

            {/* Année avec SelectionModal */}
            <View style={[styles.inputGroup, { marginBottom: spacing.md }]}>
              <Text style={[styles.label, { color: colors.textSecondary, marginBottom: spacing.xs }]}>
                Année
              </Text>
              <TouchableOpacity
                testID={isEditing ? "edit-book-year-select" : "create-book-year-select"}
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
                  style={[
                    styles.categorySelectorText,
                    { color: selectedYear ? colors.text : colors.placeholder },
                  ]}
                >
                  {selectedYear ? String(selectedYear) : 'Sélectionner une année'}
                </Text>
              </TouchableOpacity>
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
                    testID={isEditing ? "edit-book-isbn-input" : "create-book-isbn-input"}
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
                    testID={isEditing ? "edit-book-description-input" : "create-book-description-input"}
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

            {/* Statut (uniquement pour l'édition) */}
            {isEditing && (
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
            )}

            {/* Fichiers */}
            <FilePickerComponent
              selectedFile={selectedPdf}
              onFileSelected={setSelectedPdf}
              label="Fichier PDF"
              placeholder={isEditing ? '📄 PDF existant - Choisir pour remplacer' : 'Choisir un fichier PDF'}
              testID={isEditing ? "edit-book-pdf-picker" : "create-book-pdf-picker"}
              type="pdf"
            />

            <FilePickerComponent
              selectedFile={selectedCover}
              onFileSelected={setSelectedCover}
              label="Image de couverture"
              placeholder={isEditing ? '🖼️ Image existante - Choisir pour remplacer' : 'Choisir une image'}
              testID={isEditing ? "edit-book-cover-picker" : "create-book-cover-picker"}
              type="image"
            />
          </View>

          {/* Bouton Submit */}
          <TouchableOpacity
            testID={isEditing ? "edit-book-submit" : "create-book-submit"}
            style={[
              styles.submitButton,
              {
                backgroundColor: colors.buttonPrimary,
                borderRadius: radius.md,
                height: 48,
              },
              loading && { backgroundColor: colors.disabled },
            ]}
            onPress={handleSubmit(onSubmit)}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator
                testID={isEditing ? "edit-book-loading" : "create-book-loading"}
                color={colors.buttonPrimaryText}
              />
            ) : (
              <Text style={[styles.submitButtonText, { color: colors.buttonPrimaryText }]}>
                {submitLabel}
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modal Catégorie */}
      <SelectionModal
        visible={categoryModalVisible}
        onClose={() => setCategoryModalVisible(false)}
        onSelect={handleCategorySelect}
        data={categoryItems}
        selectedId={selectedCategoryId}
        title="Sélectionner une catégorie"
        searchPlaceholder="Rechercher une catégorie..."
        emptyMessage="Aucune catégorie trouvée"
        labelKey="label"
        valueKey="id"
      />

      {/* Modal Année */}
      <SelectionModal
        visible={yearModalVisible}
        onClose={() => setYearModalVisible(false)}
        onSelect={handleYearSelect}
        data={yearItems}
        selectedId={selectedYear ? String(selectedYear) : null}
        title="Sélectionner une année"
        searchPlaceholder="Rechercher une année..."
        emptyMessage="Aucune année trouvée"
        labelKey="label"
        valueKey="value"
      />
    </SafeAreaView>
  );
};

export default BookForm;
