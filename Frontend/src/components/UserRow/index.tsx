import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { UserResponse } from '@types/user';
import { useAppTheme } from '@theme/useAppTheme'; // 🟢 Importation du thème
import { styles } from './styles';

interface UserRowProps {
  user: UserResponse;
  onPress: () => void;
  onValidate?: () => void;
}

const UserRow = ({ user, onPress, onValidate }: UserRowProps) => {
  // 🟢 Extraction dynamique du thème
  const { theme } = useAppTheme();
  const { colors, spacing, radius } = theme;

  // Gestion des couleurs dynamique selon le statut
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return colors.success;
      case 'pending':
        return colors.warning;
      case 'suspended':
        return colors.danger;
      default:
        return colors.textMuted;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Actif';
      case 'pending':
        return 'En attente';
      case 'suspended':
        return 'Bloqué';
      default:
        return status;
    }
  };

  const statusColor = getStatusColor(user.status);

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderRadius: radius.md,
          padding: spacing.md,
          marginBottom: spacing.sm,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.infoContainer, { marginRight: spacing.sm }]}>
        <Text
          style={[
            styles.name,
            { color: colors.text, marginBottom: spacing.xs / 2 },
          ]}
        >
          {user.firstName} {user.lastName}
        </Text>
        <Text
          style={[
            styles.email,
            { color: colors.textSecondary, marginBottom: spacing.xs },
          ]}
        >
          {user.email}
        </Text>

        <View style={styles.badgeRow}>
          {/* Badge de Rôle */}
          <Text
            style={[
              styles.badge,
              {
                backgroundColor: colors.surfaceVariant,
                color: colors.textSecondary,
                borderRadius: radius.full,
                paddingHorizontal: spacing.sm,
                marginRight: spacing.xs,
              },
            ]}
          >
            {user.role}
          </Text>

          {/* Badge de Statut (Couleur dynamique adaptative) */}
          <Text
            style={[
              styles.badge,
              {
                backgroundColor: statusColor + '20', // Opacité légère pour le fond
                color: statusColor, // Texte en couleur vive
                borderRadius: radius.full,
                paddingHorizontal: spacing.sm,
              },
            ]}
          >
            {getStatusLabel(user.status)}
          </Text>
        </View>
      </View>

      {/* Bouton Approuver */}
      {onValidate && (
        <TouchableOpacity
          style={[
            styles.validateButton,
            {
              backgroundColor: colors.success,
              borderRadius: radius.sm,
              paddingVertical: spacing.xs * 1.5,
              paddingHorizontal: spacing.md,
            },
          ]}
          onPress={onValidate}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.validateButtonText,
              { color: colors.buttonPrimaryText },
            ]}
          >
            Approuver
          </Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

export default UserRow;
