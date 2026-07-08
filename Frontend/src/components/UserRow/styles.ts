import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
  },
  email: {
    fontSize: 14,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    fontSize: 12,
    fontWeight: '500',
    paddingVertical: 2,
    overflow: 'hidden',
    textTransform: 'capitalize',
  },
  validateButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  validateButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
