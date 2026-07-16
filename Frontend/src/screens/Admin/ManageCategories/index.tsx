import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCategoryStore } from '@store/useCategoryStore';
import { useAppTheme } from '@theme/useAppTheme';
import { SearchBar } from '@components/SearchBar';
import { styles } from './styles';

const ManageCategoriesScreen = ({ navigation }: any) => {
  const { categories, loading, fetchCategories, createCategory, updateCategory, deleteCategory } =
    useCategoryStore();
  const { theme } = useAppTheme();
  const { colors, spacing, radius } = theme;

  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [categoryName, setCategoryName] = useState('');
  const [categoryDescription, setCategoryDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    fetchCategories();
  }, []);

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    return categories.filter((cat) =>
      cat.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
    );
  }, [categories, searchQuery]);

  const handleAdd = () => {
    setEditingCategory(null);
    setCategoryName('');
    setCategoryDescription('');
    setModalVisible(true);
  };

  const handleEdit = (category: any) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setCategoryDescription(category.description || '');
    setModalVisible(true);
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert(
      'Confirmer la suppression',
      `Voulez-vous vraiment supprimer la catégorie "${name}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCategory(id);
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de supprimer la catégorie.');
            }
          },
        },
      ]
    );
  };

  const handleSubmit = async () => {
    if (!categoryName.trim()) {
      Alert.alert('Erreur', 'Le nom de la catégorie est requis.');
      return;
    }

    setIsSubmitting(true);
    try {
      const data = {
        name: categoryName.trim(),
        description: categoryDescription.trim() || undefined,
        parent_id: null,
      };
      if (editingCategory) {
        await updateCategory(editingCategory.id, data);
      } else {
        await createCategory(data);
      }
      setModalVisible(false);
      setCategoryName('');
      setCategoryDescription('');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'enregistrer la catégorie.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <View testID={`category-item-${item.id}`} style={[styles.categoryItem, { borderBottomColor: colors.border }]}>
      <View style={styles.categoryInfo}>
        <Text testID={`category-name-${item.id}`} style={[styles.categoryName, { color: colors.text }]}>
          {item.name}
        </Text>
        {item.description ? (
          <Text style={[styles.categoryDescription, { color: colors.textSecondary }]}>{item.description}</Text>
        ) : null}
      </View>
      <View style={styles.categoryActions}>
        <TouchableOpacity
          testID={`category-edit-${item.id}`}
          style={[styles.editButton, { backgroundColor: colors.primary }]}
          onPress={() => handleEdit(item)}
        >
          <Text style={styles.editButtonText}>✏️</Text>
        </TouchableOpacity>
        <TouchableOpacity
          testID={`category-delete-${item.id}`}
          style={[styles.deleteButton, { backgroundColor: colors.danger }]}
          onPress={() => handleDelete(item.id, item.name)}
        >
          <Text style={styles.deleteButtonText}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={[styles.container, { padding: spacing.lg }]}>
        <View style={styles.header}>
          <Text testID="manage-categories-title" style={[styles.title, { color: colors.text }]}>
            Gérer les Catégories
          </Text>
          <TouchableOpacity
            testID="manage-categories-add"
            style={[styles.addButton, { backgroundColor: colors.buttonPrimary, borderRadius: radius.md }]}
            onPress={handleAdd}
          >
            <Text style={[styles.addButtonText, { color: colors.buttonPrimaryText }]}>+</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Rechercher une catégorie..."
          />
        </View>

        {loading ? (
          <ActivityIndicator style={styles.loader} size="large" color={colors.primary} />
        ) : (
          <FlatList
            data={filteredCategories}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={
              <Text testID="categories-empty" style={[styles.emptyText, { color: colors.textMuted }]}>
                Aucune catégorie
              </Text>
            }
          />
        )}
      </View>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface, borderRadius: radius.lg }]}>
            <Text testID="category-modal-title" style={[styles.modalTitle, { color: colors.text }]}>
              {editingCategory ? 'Modifier la Catégorie' : 'Nouvelle Catégorie'}
            </Text>
            <TextInput
              testID="category-modal-name"
              style={[styles.modalInput, { borderColor: colors.border, color: colors.text }]}
              placeholder="Nom de la catégorie"
              placeholderTextColor={colors.placeholder}
              value={categoryName}
              onChangeText={setCategoryName}
            />
            <TextInput
              style={[styles.modalInput, { borderColor: colors.border, color: colors.text }]}
              placeholder="Description (optionnelle)"
              placeholderTextColor={colors.placeholder}
              value={categoryDescription}
              onChangeText={setCategoryDescription}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                testID="category-modal-cancel"
                style={[styles.modalButton, styles.modalCancel, { borderColor: colors.border }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={[styles.modalCancelText, { color: colors.textSecondary }]}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                testID="category-modal-submit"
                style={[styles.modalButton, { backgroundColor: colors.buttonPrimary }]}
                onPress={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color={colors.buttonPrimaryText} />
                ) : (
                  <Text style={[styles.modalButtonText, { color: colors.buttonPrimaryText }]}>
                    {editingCategory ? 'Mettre à jour' : 'Ajouter'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default ManageCategoriesScreen;
