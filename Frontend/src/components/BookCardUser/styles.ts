import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  bookCard: {
    flexDirection: 'row',
    marginBottom: 12,
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    minHeight: 110,
  },
  coverContainer: {
    width: 80,
    height: 110,
    flexShrink: 0,
    backgroundColor: '#f0f0f0',
    position: 'relative',
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
    fontSize: 32,
  },
  // ✅ Badges de statut de téléchargement
  downloadBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  downloadBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  downloadRequiredBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  downloadRequiredText: {
    fontSize: 9,
    fontWeight: '600',
  },
  bookInfo: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    justifyContent: 'space-between',
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  bookAuthor: {
    fontSize: 14,
    marginBottom: 4,
  },
  bookMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  bookYear: {
    fontSize: 12,
  },
  categoryTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  categoryTagText: {
    fontSize: 10,
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  arrowContainer: {
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  arrowText: {
    fontSize: 24,
    fontWeight: '300',
  },
});
