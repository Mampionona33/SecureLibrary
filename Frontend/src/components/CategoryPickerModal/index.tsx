import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useCategoryStore } from '@store/useCategoryStore';
import { useAppTheme } from '@theme/useAppTheme';
import { styles } from './styles';

interface CategoryPickerModalProps {
  visible: boolean;
  onSelect: (categoryId: string | null) => void;
  onClose: () => void;
  selectedValue: string | null;
}

const CategoryPickerModal = ({
  visible,
  onSelect,
  onClose,
  selectedValue,
}: CategoryPickerModalProps) => {
  const { categories, loading, fetchCategories } = useCategoryStore();
  const { theme } = useAppTheme();
  const { colors, spacing } = theme;

  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (visible) {
      fetchCategories();
    }
  }, [visible]);

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    const q = searchQuery.trim().toLowerCase();
    return categories.filter((cat) =>
      cat.name.toLowerCase().includes(q)
    );
  }, [categories, searchQuery]);

  const handleSelect = (id: string) => {
    onSelect(id);
    onClose();
  };

  const handleClear = () => {
    onSelect(null);
    onClose();
  };

  const renderItem = ({ item }: { item: any }) => {
    const isSelected = selectedValue === item.id;
    return (
      <TouchableOpacity
        testID={`category-item-${item.id}`}
        style={[styles.categoryItem, { borderBottomColor: colors.border }]}
        onPress={() => handleSelect(item.id)}
      >
        <Text style={[styles.categoryName, { color: colors.text }]}>
          {item.name}
        </Text>
        {isSelected && (
          <Text style={[styles.categoryCheck, { color: colors.primary }]}>✓</Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
        <View
          style={[
            styles.modalContainer,
            {
              backgroundColor: colors.surface,
            },
          ]}
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>
              Sélectionner une catégorie
            </Text>
            <TouchableOpacity
              testID="category-modal-close"
              style={styles.closeButton}
              onPress={onClose}
            >
              <Text style={[styles.closeButtonText, { color: colors.textMuted }]}>✕</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            testID="category-search"
            style={[
              styles.searchInput,
              {
                backgroundColor: colors.inputBackground,
                borderColor: colors.inputBorder,
                color: colors.text,
              },
            ]}
            placeholder="Rechercher une catégorie..."
            placeholderTextColor={colors.placeholder}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />

          <TouchableOpacity
            testID="category-clear"
            style={{ paddingVertical: 8, marginBottom: 8 }}
            onPress={handleClear}
          >
            <Text style={{ color: colors.primary, fontSize: 14 }}>
              Aucune catégorie
            </Text>
          </TouchableOpacity>

          {loading ? (
            <ActivityIndicator
              testID="category-loader"
              style={styles.loader}
              size="large"
              color={colors.primary}
            />
          ) : filteredCategories.length === 0 ? (
            <Text
              testID="category-empty"
              style={[styles.emptyText, { color: colors.textMuted }]}
            >
              Aucune catégorie disponible
            </Text>
          ) : (
            <FlatList
              data={filteredCategories}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              contentContainerStyle={styles.listContainer}
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

export default CategoryPickerModal;
