import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import { API_URL } from '@env';
import { styles } from './styles';
import UserRow from './UserRow';

const ManageUsersScreen = ({ navigation }: any) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'active' | 'suspended'>('all');

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_URL}/users/`);
      setUsers(response.data);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de récupérer la liste des membres.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchUsers();
  };

  const handleValidateUser = async (userId: string, name: string) => {
    Alert.alert(
      'Validation',
      `Approuver l'accès de ${name} à l'organisation ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Approuver',
          onPress: async () => {
            try {
              await axios.patch(`${API_URL}/users/${userId}/`, { status: 'active' });
              Alert.alert('Succès', 'Le membre a été approuvé.');
              fetchUsers();
            } catch (error) {
              Alert.alert('Erreur', 'Impossible d’approuver ce membre.');
            }
          },
        },
      ]
    );
  };

  const filteredUsers = users.filter((user: any) => {
    if (activeTab === 'all') return true;
    return user.status === activeTab;
  });

  const getCount = (status: 'all' | 'pending' | 'active' | 'suspended') => {
    if (status === 'all') return users.length;
    return users.filter((u: any) => u.status === status).length;
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
            <Text style={styles.addButtonText}>+ Créer Membre</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.scrollTabWrapper}>
          <View style={styles.tabContainer}>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'all' && styles.activeTab]} 
              onPress={() => setActiveTab('all')}
            >
              <Text style={activeTab === 'all' ? styles.activeTabText : styles.tabText}>
                Tous ({getCount('all')})
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'pending' && styles.activeTab]} 
              onPress={() => setActiveTab('pending')}
            >
              <Text style={activeTab === 'pending' ? styles.activeTabText : styles.tabText}>
                Attente ({getCount('pending')})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.tab, activeTab === 'active' && styles.activeTab]} 
              onPress={() => setActiveTab('active')}
            >
              <Text style={activeTab === 'active' ? styles.activeTabText : styles.tabText}>
                Actif ({getCount('active')})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.tab, activeTab === 'suspended' && styles.activeTab]} 
              onPress={() => setActiveTab('suspended')}
            >
              <Text style={activeTab === 'suspended' ? styles.activeTabText : styles.tabText}>
                Bloqué ({getCount('suspended')})
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#2563eb" />
          </View>
        ) : (
          <FlatList
            data={filteredUsers}
            keyExtractor={(item: any) => item.id.toString()}
            renderItem={({ item }: any) => (
              <UserRow 
                user={item} 
                onPress={() => navigation.navigate('UserDetail', { userId: item.id })}
                onValidate={
                  item.status === 'pending' 
                    ? () => handleValidateUser(item.id, `${item.firstName} ${item.lastName}`) 
                    : undefined
                }
              />
            )}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Aucun membre trouvé dans cette catégorie.</Text>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default ManageUsersScreen;
