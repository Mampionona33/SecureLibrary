import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    paddingHorizontal: 4,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 46,
  },
  icon: {
    fontSize: 16,
    marginRight: 8,
  },
  input: {
    flex: 1,
    color: '#1e293b',
    fontSize: 15,
    paddingVertical: 0, // Évite les décalages sur Android
  },
  clearButton: {
    padding: 4,
  },
  clearText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
