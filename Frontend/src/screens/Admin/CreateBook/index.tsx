// screens/Admin/CreateBook/index.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { valibotResolver } from '@hookform/resolvers/valibot';

import { useBookStore } from '@store/useBookStore';
import { useCategoryStore } from '@store/useCategoryStore';
import { useAppTheme } from '@theme/useAppTheme';
import { createBookSchema, CreateBookFormType } from './schema';
import { styles } from './styles';
import CategoryPickerModal from '@components/CategoryPickerModal';

const CreateBookScreen = ({ navigation }: any) => {
  const { createBook, fetchBooks } = useBookStore();
  const { categories } = useCategoryStore();
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

  const onSubmit = async (data: CreateBookFormType) => {
    setApiError(null);
    setLoading(true);

    try {
      const payload: any = {
        title: data.title.trim(),
        author: data.author.trim(),
        category: data.category?.trim() || null,
        year: data.year ? Number(data.year) : null,
        isbn: data.isbn?.trim() || null,
        description: data.description?.trim() || null,
      };

      await createBook(payload);
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
      setLoading(false);
      const message = error.message || 'Impossible de créer le livre.';
      setApiError(message);
      Alert.alert('Erreur', message);
    }
  };

  const handleCategorySelect = (categoryId: string | null) => {
    setSelectedCategoryId(categoryId);
    // Mettre à jour le formulaire avec l'ID de la catégorie
    setValue('category', categoryId || '');
  };

  const getCategoryName = (id: string | null) => {
    if (!id) return 'Aucune';
    const category = categories.find((c) => c.id === id);
    return category ? category.name : 'Aucune';
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[styles.container, { padding: spacing.lg }]}
        keyboardShouldPersistTaps="handled"
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

          {/* Catégorie - MODIFIÉ AVEC MODAL */}
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
            {/* On cache le TextInput original pour utiliser le sélecteur */}
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

          {/* Optionnel : PDF et Cover (exemple simplifié) */}
          <View style={[styles.inputGroup, { marginBottom: spacing.md }]}>
            <Text style={[styles.label, { color: colors.textSecondary, marginBottom: spacing.xs }]}>
              Fichier PDF
            </Text>
            <TouchableOpacity
              testID="create-book-pdf-picker"
              style={[
                styles.filePickerButton,
                {
                  borderColor: colors.border,
                  borderRadius: radius.md,
                  backgroundColor: colors.inputBackground,
                },
              ]}
              onPress={() => {
                // Intégrer react-native-document-picker
                setSelectedPdf({ uri: 'fake.pdf', name: 'document.pdf' });
              }}
            >
              <Text style={[styles.filePickerText, { color: colors.textSecondary }]}>
                {selectedPdf ? selectedPdf.name : 'Choisir un fichier PDF'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.inputGroup, { marginBottom: spacing.md }]}>
            <Text style={[styles.label, { color: colors.textSecondary, marginBottom: spacing.xs }]}>
              Image de couverture
            </Text>
            <TouchableOpacity
              testID="create-book-cover-picker"
              style={[
                styles.filePickerButton,
                {
                  borderColor: colors.border,
                  borderRadius: radius.md,
                  backgroundColor: colors.inputBackground,
                },
              ]}
              onPress={() => {
                setSelectedCover({ uri: 'fake.jpg', name: 'cover.jpg' });
              }}
            >
              <Text style={[styles.filePickerText, { color: colors.textSecondary }]}>
                {selectedCover ? selectedCover.name : 'Choisir une image'}
              </Text>
            </TouchableOpacity>
          </View>
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

      {/* Modal de sélection de catégorie */}
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
