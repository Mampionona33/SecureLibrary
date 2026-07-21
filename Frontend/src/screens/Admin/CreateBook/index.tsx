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
import { createBookSchema, CreateBookFormType } from '../BookForm/schema';
import { styles } from '../BookForm/styles';
import CategoryPickerModal from '@components/CategoryPickerModal';
import FilePickerComponent from '@components/FilePicker';
import RNFS from 'react-native-fs';

const CreateBookScreen = ({ navigation }: any) => {
  const { createBook, fetchBooks } = useBookStore();
  const { categories, fetchCategories, loading: categoriesLoading } = useCategoryStore();
  const { theme } = useAppTheme();
  const { colors, spacing, radius } = theme;

  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
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

  // ✅ Charger les catégories au montage
  useEffect(() => {
    fetchCategories();
  }, []);

  const onSubmit = async (data: CreateBookFormType) => {
    console.log('=== onSubmit START ===');

    setApiError(null);
    setLoading(true);

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
        console.log('Converting Cover...');
        const coverBase64 = await RNFS.readFile(selectedCover.uri, 'base64');
        formData.append('cover_image', {
          uri: selectedCover.uri,
          type: 'image/jpeg',
          name: selectedCover.name,
          data: coverBase64,
        } as any);
      }

      console.log('FormData prepared');
      await createBook(formData);
      await fetchBooks(true);

      setLoading(false);
      reset();
      setSelectedPdf(null);
      setSelectedCover(null);
      setSelectedCategoryId(null);

      Alert.alert('Succès', 'Le livre a été créé avec succès.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      console.log('=== ERROR ===');
      console.log('Error:', error.response?.data || error.message);
      
      setLoading(false);
      const message = error.response?.data?.non_field_errors?.[0] || error.message || 'Impossible de créer le livre.';
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
            testID="create-book-title"
            style={[styles.title, { color: colors.text, marginBottom: spacing.lg }]}
          >
            Nouveau Livre
          </Text>

          {apiError && (
            <View
              testID="create-book-api-error"
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
                    testID="create-book-title-input"
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
                  testID="create-book-title-error"
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
                    testID="create-book-author-input"
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
                  testID="create-book-author-error"
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
              <Controller
                control={control}
                name="category"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TouchableOpacity
                    testID="create-book-category-select"
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
                    testID="create-book-year-input"
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
                    testID="create-book-isbn-input"
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
                    testID="create-book-description-input"
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
              placeholder="Choisir un fichier PDF"
              testID="create-book-pdf-picker"
              type="pdf"
            />

            {/* Image de couverture */}
            <FilePickerComponent
              selectedFile={selectedCover}
              onFileSelected={setSelectedCover}
              label="Image de couverture"
              placeholder="Choisir une image"
              testID="create-book-cover-picker"
              type="image"
            />
          </View>

          <TouchableOpacity
            testID="create-book-submit"
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
              <ActivityIndicator testID="create-book-loading" color={colors.buttonPrimaryText} />
            ) : (
              <Text style={[styles.submitButtonText, { color: colors.buttonPrimaryText }]}>
                Ajouter le livre
              </Text>
            )}
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

export default CreateBookScreen;
