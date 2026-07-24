import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  deleteButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  deleteButtonText: {
    fontSize: 20,
    color: '#fff',
  },
  formCard: {
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderRadius: 12,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  categorySelectorText: {
    fontSize: 16,
  },
  submitButton: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 48,
    marginTop: 8,
    borderRadius: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  errorBanner: {
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderRadius: 8,
  },
  errorBannerText: {
    fontSize: 14,
  },
  fieldErrorText: {
    fontSize: 12,
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  statusButton: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 2,
    borderRadius: 8,
    alignItems: 'center',
  },
  statusButtonText: {
    fontWeight: '500',
  },
  metadataContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  metadataText: {
    fontSize: 12,
  },
  refreshButton: {
    marginTop: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  refreshButtonText: {
    fontSize: 14,
  },
  filePickerContainer: {
    marginBottom: 16,
  },
  filePickerLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  filePickerButton: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    minHeight: 50,
    justifyContent: 'center',
  },
  filePickerText: {
    fontSize: 16,
  },
  filePickerPlaceholder: {
    color: '#999',
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filePreviewImage: {
    width: 40,
    height: 56,
    borderRadius: 4,
    marginRight: 12,
  },
  fileName: {
    flex: 1,
    fontSize: 14,
  },
  removeButton: {
    padding: 4,
    marginLeft: 8,
  },
  removeButtonText: {
    color: 'red',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
