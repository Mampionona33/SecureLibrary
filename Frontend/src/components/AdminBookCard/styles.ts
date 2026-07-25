import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
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
    minHeight: 80,
  },
  coverContainer: {
    width: 60,
    height: 80,
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
    fontSize: 24,
  },
  bookInfo: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
    justifyContent: 'space-between',
  },
  bookTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 1,
  },
  bookRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bookAuthor: {
    fontSize: 12,
    flex: 1,
    marginRight: 6,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    flexShrink: 0,
  },
  statusBadgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: 'bold',
  },
  bookYear: {
    fontSize: 11,
  },
  arrowContainer: {
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  arrowText: {
    fontSize: 20,
    fontWeight: '300',
  },

  // ===== MODAL STYLES =====
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
    maxWidth: 320,
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: 0.3,
  },
  modalAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginVertical: 4,
    borderRadius: 10,
    borderBottomWidth: 1,
  },
  modalActionText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  modalCancel: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginTop: 8,
    borderTopWidth: 1,
    borderRadius: 10,
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
});
