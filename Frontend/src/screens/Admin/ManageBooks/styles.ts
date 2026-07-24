import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  addButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
  },
  addButtonText: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 8,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 6,
  },
  filterButtonActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  searchInput: {
    height: 44,
    paddingHorizontal: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderRadius: 8,
  },
  listContainer: {
    paddingBottom: 20,
  },
  bookCard: {
    flexDirection: 'row',
    marginBottom: 10,
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    minHeight: 80, // ✅ Réduit
  },
  coverContainer: {
    width: 60, // ✅ Réduit
    height: 80, // ✅ Réduit
    flexShrink: 0,
    backgroundColor: '#f0f0f0',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverPlaceholderText: {
    fontSize: 24, // ✅ Réduit
  },
  bookInfo: {
    flex: 1,
    paddingVertical: 8, // ✅ Réduit
    paddingHorizontal: 10, // ✅ Réduit
    justifyContent: 'space-between',
  },
  bookTitle: {
    fontSize: 14, // ✅ Réduit
    fontWeight: '600',
    marginBottom: 1,
  },
  bookRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bookAuthor: {
    fontSize: 12, // ✅ Réduit
    flex: 1,
    marginRight: 6,
  },
  statusBadge: {
    paddingHorizontal: 6, // ✅ Réduit
    paddingVertical: 1, // ✅ Réduit
    borderRadius: 4,
    flexShrink: 0,
  },
  statusBadgeText: {
    color: '#fff',
    fontSize: 9, // ✅ Réduit
    fontWeight: 'bold',
  },
  bookYear: {
    fontSize: 11, // ✅ Réduit
  },
  arrowContainer: {
    justifyContent: 'center',
    paddingHorizontal: 10, // ✅ Réduit
  },
  arrowText: {
    fontSize: 20, // ✅ Réduit
    fontWeight: '300',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
  },
});
