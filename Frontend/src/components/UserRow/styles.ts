import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  infoContainer: {
    flex: 1,
    marginRight: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  email: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    fontSize: 12,
    fontWeight: '500',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 6,
    textTransform: 'capitalize',
  },
  roleBadge: {
    backgroundColor: '#f3f4f6',
    color: '#4b5563',
  },
  statusActive: {
    backgroundColor: '#dcfce7',
    color: '#15803d',
  },
  statusPending: {
    backgroundColor: '#fef9c3',
    color: '#a16207',
  },
  statusSuspended: {
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
  },
  statusDefault: {
    backgroundColor: '#e5e7eb',
    color: '#374151',
  },
  validateButton: {
    backgroundColor: '#10b981',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  validateButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});
