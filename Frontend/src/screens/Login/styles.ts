import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoIcon: {
    fontSize: 48,
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: '#1f2937',
  },
  titleHighlight: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1e3a8a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 6,
    marginLeft: 4,
    marginTop: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 50,
  },
  inputErrorBorder: {
    borderColor: '#ef4444',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  input: {
    flex: 1,
    height: '100%',
    color: '#111827',
    fontSize: 16,
  },
  toggleButton: {
    padding: 8,
  },
  toggleText: {
    color: '#1e3a8a',
    fontSize: 14,
    fontWeight: '600',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: 8,
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: '#1e3a8a',
    fontSize: 14,
    fontWeight: '500',
  },
  loginButton: {
    backgroundColor: '#1e3a8a',
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#1e3a8a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  loginButtonDisabled: {
    backgroundColor: '#9ca3af',
    shadowOpacity: 0,
    elevation: 0,
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#d1d5db',
  },
  dividerText: {
    marginHorizontal: 10,
    color: '#6b7280',
    fontSize: 12,
  },
  biometricButton: {
    flexDirection: 'row',
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e5e7eb',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  biometricIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  biometricText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
});
