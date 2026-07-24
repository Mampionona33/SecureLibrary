// components/SelectionModal/index.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  TouchableWithoutFeedback,
} from 'react-native';
import { useAppTheme } from '@theme/useAppTheme';

export interface SelectionItem {
  id: string;
  label: string;
  value?: any;
  [key: string]: any;
}

interface SelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (item: SelectionItem) => void;
  data: SelectionItem[] | any[];
  selectedId?: string | null;
  selectedValue?: any;
  title?: string;
  searchPlaceholder?: string;
  loading?: boolean;
  emptyMessage?: string;
  renderItem?: (item: any, isSelected: boolean) => React.ReactNode;
  keyExtractor?: (item: any, index: number) => string;
  labelKey?: string;
  valueKey?: string;
  // Pour les listes sans ID (ex: années)
  useIndexAsId?: boolean;
  displayKey?: string;
}

const SelectionModal: React.FC<SelectionModalProps> = ({
  visible,
  onClose,
  onSelect,
  data,
  selectedId = null,
  selectedValue = null,
  title = 'Sélectionner',
  searchPlaceholder = 'Rechercher...',
  loading = false,
  emptyMessage = 'Aucun élément trouvé',
  renderItem,
  keyExtractor,
  labelKey = 'label',
  valueKey = 'id',
  useIndexAsId = false,
  displayKey = 'label',
}) => {
  const { theme } = useAppTheme();
  const { colors, spacing, radius } = theme;
  const [search, setSearch] = useState('');

  // Normaliser les données
  const normalizedData = data.map((item, index) => {
    // Si c'est une chaîne simple (ex: année)
    if (typeof item === 'string' || typeof item === 'number') {
      return {
        id: useIndexAsId ? String(index) : String(item),
        label: String(item),
        value: item,
        [displayKey]: String(item),
      };
    }
    // Si c'est un objet avec les bons champs
    return {
      id: item.id || item[valueKey] || String(index),
      label: item.label || item[labelKey] || String(item),
      value: item.value || item,
      ...item,
    };
  });

  const getItemLabel = (item: any): string => {
    if (typeof item === 'string' || typeof item === 'number') return String(item);
    return item.label || item[labelKey] || item[displayKey] || String(item);
  };

  const getItemId = (item: any, index: number): string => {
    if (typeof item === 'string' || typeof item === 'number') {
      return useIndexAsId ? String(index) : String(item);
    }
    return item.id || item[valueKey] || String(index);
  };

  const isItemSelected = (item: any, index: number): boolean => {
    const itemId = getItemId(item, index);
    if (selectedId !== null && selectedId !== undefined) {
      return itemId === selectedId;
    }
    if (selectedValue !== null && selectedValue !== undefined) {
      return item.value === selectedValue || item === selectedValue;
    }
    return false;
  };

  const filteredData = normalizedData.filter((item) =>
    getItemLabel(item).toLowerCase().includes(search.toLowerCase())
  );

  const defaultKeyExtractor = (item: any, index: number) => getItemId(item, index);

  const defaultRenderItem = (item: any, isSelected: boolean) => (
    <View
      style={[
        styles.itemContainer,
        {
          paddingVertical: spacing.md,
          paddingHorizontal: spacing.md,
          borderBottomColor: colors.border,
          backgroundColor: isSelected ? colors.primary + '20' : 'transparent',
        },
      ]}
    >
      <Text
        style={{
          color: isSelected ? colors.primary : colors.text,
          fontWeight: isSelected ? 'bold' : 'normal',
          fontSize: 16,
        }}
      >
        {getItemLabel(item)}
        {isSelected && ' ✓'}
      </Text>
    </View>
  );

  const renderEmpty = () => (
    <View style={{ padding: spacing.lg, alignItems: 'center' }}>
      <Text style={{ color: colors.textSecondary, textAlign: 'center' }}>
        {emptyMessage}
      </Text>
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View
          style={[
            styles.overlay,
            {
              backgroundColor: 'rgba(0,0,0,0.5)',
            },
          ]}
        >
          <TouchableWithoutFeedback>
            <View
              style={[
                styles.modalContent,
                {
                  backgroundColor: colors.background,
                  borderTopLeftRadius: radius.lg,
                  borderTopRightRadius: radius.lg,
                  padding: spacing.lg,
                },
              ]}
            >
              {/* Header */}
              <View style={[styles.header, { marginBottom: spacing.md }]}>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: 'bold',
                    color: colors.text,
                  }}
                >
                  {title}
                </Text>
              </View>

              {/* Search Input */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: colors.inputBackground,
                  borderColor: colors.inputBorder,
                  borderWidth: 1,
                  borderRadius: radius.md,
                  marginBottom: spacing.md,
                }}
              >
                <TextInput
                  style={[
                    styles.searchInput,
                    {
                      flex: 1,
                      paddingHorizontal: spacing.md,
                      paddingVertical: spacing.sm,
                      color: colors.text,
                      fontSize: 16,
                    },
                  ]}
                  placeholder={searchPlaceholder}
                  placeholderTextColor={colors.placeholder}
                  value={search}
                  onChangeText={setSearch}
                />
                {search.length > 0 && (
                  <TouchableOpacity
                    onPress={() => setSearch('')}
                    style={{
                      paddingHorizontal: spacing.md,
                      paddingVertical: spacing.sm,
                    }}
                  >
                    <Text
                      style={{
                        color: colors.textSecondary,
                        fontSize: 18,
                        fontWeight: 'bold',
                      }}
                    >
                      ✕
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Loading */}
              {loading ? (
                <View style={{ padding: spacing.xl, alignItems: 'center' }}>
                  <ActivityIndicator size="large" color={colors.primary} />
                </View>
              ) : (
                <FlatList
                  data={filteredData}
                  keyExtractor={keyExtractor || defaultKeyExtractor}
                  showsVerticalScrollIndicator={true}
                  style={{ maxHeight: 400 }}
                  renderItem={({ item, index }) => {
                    const isSelected = isItemSelected(item, index);
                    return (
                      <TouchableOpacity
                        onPress={() => {
                          onSelect(item);
                          onClose();
                          setSearch('');
                        }}
                      >
                        {renderItem
                          ? renderItem(item, isSelected)
                          : defaultRenderItem(item, isSelected)}
                      </TouchableOpacity>
                    );
                  }}
                  ListEmptyComponent={renderEmpty}
                />
              )}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  searchInput: {
    minHeight: 40,
  },
  itemContainer: {
    borderBottomWidth: 1,
  },
});

export default SelectionModal;
