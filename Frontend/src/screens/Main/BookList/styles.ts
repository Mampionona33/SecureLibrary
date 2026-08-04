import { StyleSheet } from 'react-native';
import { Theme } from '@theme/types';

// ✅ Fonction qui prend le thème en paramètre
export const createStyles = (theme: Theme) => {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 4,
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: '700',
      color: theme.colors.text,
      letterSpacing: -0.5,
    },
    headerSubtitle: {
      fontSize: 15,
      color: theme.colors.textSecondary,
      marginTop: 2,
      fontWeight: '400',
    },
    filterContainer: {
      flexDirection: 'row',
      paddingHorizontal: 20,
      paddingVertical: 8,
      gap: 8,
    },
    filterChip: {
      paddingHorizontal: 16,
      paddingVertical: 6,
      borderRadius: 20,
      backgroundColor: theme.colors.surfaceVariant,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    filterChipActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    filterChipText: {
      fontSize: 13,
      fontWeight: '500',
      color: theme.colors.textSecondary,
    },
    filterChipTextActive: {
      color: theme.colors.textInverse,
    },
    categoriesWrapper: {
      height: 36,
      justifyContent: 'center',
    },
    categoriesContainer: {
      paddingHorizontal: 20,
      paddingVertical: 2,
      gap: 4,
      alignItems: 'center',
    },
    categoryChip: {
      paddingHorizontal: 14,
      paddingVertical: 4,
      borderRadius: 14,
      backgroundColor: theme.colors.surfaceVariant,
      marginRight: 4,
      borderWidth: 1,
      borderColor: theme.colors.border,
      justifyContent: 'center',
      alignItems: 'center',
      height: 28,
    },
    categoryChipActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    categoryChipText: {
      fontSize: 11,
      fontWeight: '500',
      color: theme.colors.textSecondary,
      textAlign: 'center',
      includeFontPadding: false,
    },
    categoryChipTextActive: {
      color: theme.colors.textInverse,
    },
    countContainer: {
      paddingHorizontal: 20,
      paddingVertical: 0,
    },
    countText: {
      fontSize: 11,
      color: theme.colors.textMuted,
      fontWeight: '400',
    },
    listContainer: {
      paddingHorizontal: 20,
      paddingBottom: 20,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      marginTop: 12,
      fontSize: 16,
      color: theme.colors.textSecondary,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingTop: 60,
    },
    emptyEmoji: {
      fontSize: 48,
      marginBottom: 12,
    },
    emptyText: {
      fontSize: 16,
      color: theme.colors.textMuted,
      textAlign: 'center',
    },
  });
};
