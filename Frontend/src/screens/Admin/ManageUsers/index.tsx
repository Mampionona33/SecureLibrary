import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

import { useUserStore } from '@store/useUserStore';
import { UserResponse } from '@types/user';
import { useAppTheme } from '@theme/useAppTheme'; // 🟢 Importation du thème

import { styles } from './styles';
import UserRow from '@components/UserRow';
import { SearchBar } from '@components/SearchBar';

const ManageUsersScreen = ({ navigation }: any) => {
  const {
    users,
    loading,
    refreshing,
    fetchUsers,
    validateUserInStore,
  } = useUserStore();

  // 🟢 Extraction dynamique des variables du thème
  const { theme } = useAppTheme();
  const { colors, spacing, radius } = theme;

  const [activeTab, setActiveTab] = useState<
    'all' | 'pending' | 'active' | 'suspended'
  >('all');

  const [query, setQuery] = useState('');

  useFocusEffect(
    useCallback(() => {
      fetchUsers();
    }, [fetchUsers])
  );

  const handleRefresh = () => {
    fetchUsers(true);
  };

  const handleValidateUser = async (
    userId: string,
    name: string
  ) => {
    Alert.alert(
      'Validation',
      `Approuver l'accès de ${name} à l'organisation ?`,
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Approuver',
          onPress: async () => {
            try {
              await validateUserInStore(userId);
              Alert.alert(
                'Succès',
                'Le membre a été approuvé.'
              );
            } catch (error: any) {
              Alert.alert(
                'Erreur',
                error.message ||
                  'Impossible d’approuver ce membre.'
              );
            }
          },
        },
      ]
    );
  };

  const displayedUsers = useMemo(() => {
    const formattedQuery = query.trim().toLowerCase();

    return users.filter((user: UserResponse) => {
      const matchesSearch =
        formattedQuery === '' ||
        user.firstName.toLowerCase().includes(formattedQuery) ||
        user.lastName.toLowerCase().includes(formattedQuery) ||
        user.email.toLowerCase().includes(formattedQuery);

      const matchesTab =
        activeTab === 'all' || user.status === activeTab;

      return matchesSearch && matchesTab;
    });
  }, [users, query, activeTab]);

  const getCount = (
    status: 'all' | 'pending' | 'active' | 'suspended'
  ) => {
    if (status === 'all') {
      return users.length;
    }

    return users.filter(
      (u: UserResponse) => u.status === status
    ).length;
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={[styles.container, { padding: spacing.lg }]}>
        
        {/* En-tête avec bouton d'ajout */}
        <View style={[styles.headerRow, { marginBottom: spacing.lg }]}>
          <Text style={[styles.title, { color: colors.text }]}>Membres</Text>

          <TouchableOpacity
            style={[
              styles.addButton,
              {
                backgroundColor: colors.buttonPrimary,
                borderRadius: radius.md,
                paddingVertical: spacing.sm,
                paddingHorizontal: spacing.md,
              },
            ]}
            onPress={() => navigation.navigate('CreateUser')}
          >
            <Text style={[styles.addButtonText, { color: colors.buttonPrimaryText }]}>
              + Créer Membre
            </Text>
          </TouchableOpacity>
        </View>

        {/* Barre d'onglets personnalisée */}
        <View style={[styles.scrollTabWrapper, { marginBottom: spacing.md }]}>
          <View
            style={[
              styles.tabContainer,
              {
                backgroundColor: colors.surfaceVariant,
                borderRadius: radius.md,
                padding: spacing.xs,
              },
            ]}
          >
            {(['all', 'pending', 'active', 'suspended'] as const).map((tabKey) => {
              const labels = {
                all: 'Tous',
                pending: 'Attente',
                active: 'Actif',
                suspended: 'Bloqué',
              };

              const isActive = activeTab === tabKey;

              return (
                <TouchableOpacity
                  key={tabKey}
                  style={[
                    styles.tab,
                    { borderRadius: radius.sm },
                    isActive && [
                      styles.activeTab,
                      { backgroundColor: colors.surface },
                    ],
                  ]}
                  onPress={() => setActiveTab(tabKey)}
                >
                  <Text
                    style={
                      isActive
                        ? [styles.activeTabText, { color: colors.text }]
                        : [styles.tabText, { color: colors.textMuted }]
                    }
                  >
                    {labels[tabKey]} ({getCount(tabKey)})
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Barre de recherche */}
        <SearchBar
          value={query}
          onChangeText={setQuery}
          placeholder="Rechercher par nom, prénom ou email..."
        />

        {/* Liste ou Loader */}
        {loading && users.length === 0 ? (
          <View style={styles.center}>
            <ActivityIndicator
              size="large"
              color={colors.primary}
            />
          </View>
        ) : (
          <FlatList
            data={displayedUsers}
            keyExtractor={(item: UserResponse) =>
              item.id.toString()
            }
            renderItem={({ item }) => (
              <UserRow
                user={item}
                onPress={() =>
                  navigation.navigate('UserEdit', {
                    userId: item.id,
                  })
                }
                onValidate={
                  item.status === 'pending'
                    ? () =>
                        handleValidateUser(
                          item.id,
                          `${item.firstName} ${item.lastName}`
                        )
                    : undefined
                }
              />
            )}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            ListEmptyComponent={
              <View style={[styles.emptyContainer, { padding: spacing.xl }]}>
                <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                  Aucun membre trouvé.
                </Text>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default ManageUsersScreen;
