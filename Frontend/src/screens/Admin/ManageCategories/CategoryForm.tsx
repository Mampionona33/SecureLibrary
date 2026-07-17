import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useAppTheme } from '@theme/useAppTheme';
import { styles } from './styles';

interface CategoryFormProps {
  initialName?: string;
  initialDescription?: string;
  onSubmit: (data: { name: string; description: string }) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  title?: string;
  submitLabel?: string;
}

const CategoryForm = ({
  initialName = '',
  initialDescription = '',
  onSubmit,
  onCancel,
  isSubmitting = false,
  title = 'Nouvelle Catégorie',
  submitLabel = 'Ajouter',
}: CategoryFormProps) => {
  const { theme } = useAppTheme();
  const { colors, spacing, radius } = theme;

  const [name, setName] = React.useState(initialName);
  const [description, setDescription] = React.useState(initialDescription);

  const handleSubmit = () => {
    if (!name.trim()) {
      // Gérer l'erreur (Alert dans le parent)
      return;
    }
    onSubmit({ name: name.trim(), description: description.trim() });
  };

  return (
    <>
      <Text style={[styles.modalTitle, { color: colors.text }]}>{title}</Text>

      <TextInput
        testID="category-form-name"
        style={[
          styles.modalInput,
          {
            borderColor: colors.border,
            color: colors.text,
            backgroundColor: colors.inputBackground,
            borderRadius: radius.md,
            paddingHorizontal: spacing.md,
            marginBottom: spacing.md,
          },
        ]}
        placeholder="Nom de la catégorie"
        placeholderTextColor={colors.placeholder}
        value={name}
        onChangeText={setName}
      />

      <TextInput
        testID="category-form-description"
        style={[
          styles.modalInput,
          styles.textArea, // Ajouter un style pour multiligne
          {
            borderColor: colors.border,
            color: colors.text,
            backgroundColor: colors.inputBackground,
            borderRadius: radius.md,
            paddingHorizontal: spacing.md,
            paddingTop: spacing.md,
            marginBottom: spacing.md,
            minHeight: 80,
            textAlignVertical: 'top',
          },
        ]}
        placeholder="Description (optionnelle)"
        placeholderTextColor={colors.placeholder}
        multiline
        numberOfLines={4}
        value={description}
        onChangeText={setDescription}
      />

      <View style={styles.modalActions}>
        <TouchableOpacity
          testID="category-form-cancel"
          style={[styles.modalButton, styles.modalCancel, { borderColor: colors.border }]}
          onPress={onCancel}
        >
          <Text style={[styles.modalCancelText, { color: colors.textSecondary }]}>Annuler</Text>
        </TouchableOpacity>
        <TouchableOpacity
          testID="category-form-submit"
          style={[styles.modalButton, { backgroundColor: colors.buttonPrimary }]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color={colors.buttonPrimaryText} />
          ) : (
            <Text style={[styles.modalButtonText, { color: colors.buttonPrimaryText }]}>
              {submitLabel}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </>
  );
};

export default CategoryForm;
