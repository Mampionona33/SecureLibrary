import React from 'react';
import { View, TextInput, TouchableOpacity, Text } from 'react-native';
import { useAppTheme } from '@theme/useAppTheme'; // 🟢 Importation du thème
import { styles } from './styles';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export function SearchBar({
  value,
  onChangeText,
  placeholder = 'Rechercher...',
}: SearchBarProps) {
  // 🟢 Extraction dynamique du thème
  const { theme } = useAppTheme();
  const { colors, spacing, radius } = theme;

  return (
    <View style={[styles.container, { marginVertical: spacing.sm }]}>
      <View
        style={[
          styles.searchWrapper,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderRadius: radius.md,
            paddingHorizontal: spacing.sm,
          },
        ]}
      >
        <Text style={styles.icon}>🔍</Text>

        <TextInput
          style={[styles.input, { color: colors.text }]}
          placeholder={placeholder}
          placeholderTextColor={colors.placeholder}
          value={value}
          onChangeText={onChangeText}
          autoCorrect={false}
          autoCapitalize="none"
        />

        {value.length > 0 && (
          <TouchableOpacity
            onPress={() => onChangeText('')}
            style={[styles.clearButton, { padding: spacing.xs }]}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} // Zone de clic améliorée
          >
            <Text style={[styles.clearText, { color: colors.textMuted }]}>✕</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
