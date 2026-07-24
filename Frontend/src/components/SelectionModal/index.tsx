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
  [key: string]: any;
}

interface SelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (item: SelectionItem) => void;
  data: SelectionItem[];
  selectedId?: string | null;
  title?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  loading?: boolean;
  emptyMessage?: string;
  renderItem?: (item: SelectionItem, isSelected: boolean) => React.ReactNode;
  keyExtractor?: (item: SelectionItem) => string;
  labelKey?: string;
  valueKey?: string;
}

const SelectionModal: React.FC<SelectionModalProps> = ({
  visible,
  onClose,
  onSelect,
  data,
  selectedId = null,
  title = 'Sélectionner',
  placeholder = 'Sélectionner un élément',
  searchPlaceholder = 'Rechercher...',
  loading = false,
  emptyMessage = 'Aucun élément trouvé',
  renderItem,
  keyExtractor = (item) => item.id,
  labelKey = 'label',
  valueKey = 'id',
}) => {
  const { theme } = useAppTheme();
  const { colors, spacing, radius } = theme;
  const [search, setSearch] = useState('');

  const filteredData = data.filter((item) =>
    String(item[labelKey]).toLowerCase().includes(search.toLowerCase())
  );

  const defaultRenderItem = (item: SelectionItem, isSelected: boolean) => (
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
        {item[labelKey]}
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

              {/* Search Input avec ✕ pour effacer la recherche */}
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
                  keyExtractor={keyExtractor}
                  showsVerticalScrollIndicator={true}
                  style={{ maxHeight: 400 }}
                  renderItem={({ item }) => {
                    const isSelected = item[valueKey] === selectedId;
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
