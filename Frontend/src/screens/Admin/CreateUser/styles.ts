import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flexGrow: 1 },
  title: { fontSize: 24, fontWeight: 'bold' },
  formCard: {
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  inputGroup: { width: '100%' },
  label: { fontSize: 14, fontWeight: '600' },
  input: {
    borderWidth: 1,
    height: 44,
    fontSize: 15,
  },
  fieldErrorText: {
    fontSize: 13,
    fontWeight: '500',
  },
  errorBanner: {
    borderLeftWidth: 4,
  },
  errorBannerText: {
    fontSize: 14,
    fontWeight: '500',
  },
  pickerContainer: { flexDirection: 'row' },
  pickerButton: {
    flex: 1,
    alignItems: 'center',
    borderWidth: 1,
  },
  pickerButtonText: { fontSize: 14, fontWeight: '600' },
  submitButton: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonText: { fontSize: 16, fontWeight: 'bold' },
});
