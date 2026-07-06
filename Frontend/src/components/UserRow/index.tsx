import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { UserResponse } from '@types/user';
import { styles } from './styles';

interface UserRowProps {
  user: UserResponse;
  onPress: () => void;
  onValidate?: () => void;
}

const UserRow = ({ user, onPress, onValidate }: UserRowProps) => {
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'active':
        return styles.statusActive;
      case 'pending':
        return styles.statusPending;
      case 'suspended':
        return styles.statusSuspended;
      default:
        return styles.statusDefault;
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

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.infoContainer}>
        <Text style={styles.name}>
          {user.firstName} {user.lastName}
        </Text>
        <Text style={styles.email}>{user.email}</Text>
        <View style={styles.badgeRow}>
          <Text style={[styles.badge, styles.roleBadge]}>{user.role}</Text>
          <Text style={[styles.badge, getStatusStyle(user.status)]}>
            {getStatusLabel(user.status)}
          </Text>
        </View>
      </View>

      {onValidate && (
        <TouchableOpacity style={styles.validateButton} onPress={onValidate} activeOpacity={0.8}>
          <Text style={styles.validateButtonText}>Approuver</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

export default UserRow;
