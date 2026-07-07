import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc', // Fond gris très clair (slate-50)
  },
  container: {
    padding: 20,
    paddingTop: 30,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#0f172a', // Texte presque noir (slate-900)
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: '#64748b', // Texte gris (slate-500)
    marginBottom: 35,
  },
  grid: {
    gap: 16, // Espace constant entre les cartes
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0', // Bordure légère (slate-200)
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2, // Ombre légère sur Android
  },
  cardIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b', // Slate-800
    marginBottom: 6,
  },
  cardDescription: {
    fontSize: 13,
    color: '#64748b', // Slate-500
    lineHeight: 18,
  },
});
