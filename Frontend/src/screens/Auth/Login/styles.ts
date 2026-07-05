import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0f172a', // Fond ardoise foncé (thème sécurité)
  },
  container: {
    flexGrow: 1, // Permet au ScrollView de centrer le contenu verticalement
    justifyContent: 'center',
    padding: 24,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoIcon: {
    fontSize: 64,
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 8,
  },
  formContainer: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94a3b8',
    marginBottom: 8,
    marginTop: 16,
  },
  inputContainer: {
    flexDirection: 'row', // Aligne le TextInput et le bouton "Voir" sur la même ligne
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 50,
  },
  input: {
    flex: 1, // Le champ texte prend tout l'espace disponible
    color: '#ffffff',
    fontSize: 16,
    height: '100%',
  },
  inputErrorBorder: {
    borderColor: '#ef4444', // Bordure rouge en cas d'erreur
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
  },
  toggleButton: {
    padding: 8,
  },
  toggleText: {
    color: '#3b82f6', // Bleu pour le bouton Voir/Cacher
    fontSize: 14,
    fontWeight: '600',
  },
  // 🟢 STYLE DU BOUTON "SE CONNECTER"
  submitButton: {
    backgroundColor: '#3b82f6', // Bleu principal moderne
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // 🟢 STYLE DU BLOC "PAS ENCORE DE COMPTE ? S'INSCRIRE"
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  footerText: {
    color: '#94a3b8',
    fontSize: 14,
  },
  footerLink: {
    color: '#3b82f6', // Lien en bleu
    fontSize: 14,
    fontWeight: 'bold',
    textDecorationLine: 'underline', // Souligné pour faire "lien"
  },
});
