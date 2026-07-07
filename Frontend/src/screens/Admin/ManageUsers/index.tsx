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
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Membres</Text>

          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('CreateUser')}
          >
            <Text style={styles.addButtonText}>
              + Créer Membre
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.scrollTabWrapper}>
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'all' && styles.activeTab,
              ]}
              onPress={() => setActiveTab('all')}
            >
              <Text
                style={
                  activeTab === 'all'
                    ? styles.activeTabText
                    : styles.tabText
                }
              >
                Tous ({getCount('all')})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'pending' && styles.activeTab,
              ]}
              onPress={() => setActiveTab('pending')}
            >
              <Text
                style={
                  activeTab === 'pending'
                    ? styles.activeTabText
                    : styles.tabText
                }
              >
                Attente ({getCount('pending')})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'active' && styles.activeTab,
              ]}
              onPress={() => setActiveTab('active')}
            >
              <Text
                style={
                  activeTab === 'active'
                    ? styles.activeTabText
                    : styles.tabText
                }
              >
                Actif ({getCount('active')})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'suspended' &&
                  styles.activeTab,
              ]}
              onPress={() => setActiveTab('suspended')}
            >
              <Text
                style={
                  activeTab === 'suspended'
                    ? styles.activeTabText
                    : styles.tabText
                }
              >
                Bloqué ({getCount('suspended')})
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <SearchBar
          value={query}
          onChangeText={setQuery}
          placeholder="Rechercher par nom, prénom ou email..."
        />

        {loading && users.length === 0 ? (
          <View style={styles.center}>
            <ActivityIndicator
              size="large"
              color="#2563eb"
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
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
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
