import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc', // Slate 50
  },
  container: {
    padding: 20,
    backgroundColor: '#f8fafc',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b', // Slate 800
    marginBottom: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444', // Red 500
    fontWeight: '500',
  },
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9', // Slate 100
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b', // Slate 500
    flex: 1,
  },
  value: {
    fontSize: 15,
    fontWeight: '500',
    color: '#334155', // Slate 700
    flex: 2,
    textAlign: 'right',
  },
  badge: {
    fontSize: 13,
    fontWeight: '600',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    overflow: 'hidden',
    textAlign: 'center',
  },
  // --- Styles des Badges de Rôles ---
  role_admin: {
    backgroundColor: '#fee2e2', // Red 100
    color: '#991b1b', // Red 800
  },
  role_staff: {
    backgroundColor: '#e0e7ff', // Indigo 100
    color: '#3730a3', // Indigo 800
  },
  role_reader: {
    backgroundColor: '#f1f5f9', // Slate 100
    color: '#475569', // Slate 600
  },
  // --- Styles des Badges de Statuts ---
  status_active: {
    backgroundColor: '#dcfce7', // Green 100
    color: '#166534', // Green 800
  },
  status_pending: {
    backgroundColor: '#fef9c3', // Yellow 100
    color: '#854d0e', // Yellow 800
  },
  status_suspended: {
    backgroundColor: '#ffedd5', // Orange 100
    color: '#9a3412', // Orange 800
  },
  // --- Bouton Modifier ---
  editButton: {
    backgroundColor: '#2563eb', // Blue 600
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});
