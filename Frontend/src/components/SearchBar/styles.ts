import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 4,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    height: 46,
  },
  icon: {
    fontSize: 16,
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 0, // Évite les décalages d'alignement sur Android
  },
  clearButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});
