import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#64748b',
    marginTop: 2,
    fontWeight: '400',
  },
  // ✅ Catégories très compactes avec centrage vertical
  categoriesWrapper: {
    height: 36,
    justifyContent: 'center',
  },
  categoriesContainer: {
    paddingHorizontal: 20,
    paddingVertical: 2,
    gap: 4,
    alignItems: 'center', // ✅ Centrage vertical
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 14,
    backgroundColor: '#f1f5f9',
    marginRight: 4,
    borderWidth: 1,
    borderColor: 'transparent',
    justifyContent: 'center', // ✅ Centrage vertical
    alignItems: 'center', // ✅ Centrage horizontal
    height: 28, // ✅ Hauteur fixe pour uniformité
  },
  categoryChipActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  categoryChipText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748b',
    textAlign: 'center',
    includeFontPadding: false, // ✅ Évite le padding supplémentaire
  },
  categoryChipTextActive: {
    color: '#ffffff',
  },
  countContainer: {
    paddingHorizontal: 20,
    paddingVertical: 0,
  },
  countText: {
    fontSize: 11,
    color: '#94a3b8',
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
    color: '#64748b',
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
    color: '#94a3b8',
    textAlign: 'center',
  },
});
