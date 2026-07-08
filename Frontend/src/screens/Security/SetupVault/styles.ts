import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
  },
  icon: {
    fontSize: 48,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  inputContainer: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    fontSize: 20,
    letterSpacing: 8,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 12,
  },
  submitButton: {
    alignItems: 'center',
    width: '100%',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
