import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { userService } from '@services/userService';
import { useUserStore } from '@store/useUserStore';
import { styles } from './styles';

const UserEditScreen = ({ route, navigation }: any) => {
  const { userId } = route.params;
  const updateUserInStore = useUserStore((state) => state.updateUserInStore);
  const user = useUserStore((state) => state.users.find((u) => u.id === userId));

  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'staff' | 'reader'>('reader');
  const [status, setStatus] = useState<'active' | 'pending' | 'suspended'>('pending');
  const [allGroups, setAllGroups] = useState<any[]>([]);
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);

  console.log("Mount user edit page");

  useEffect(() => {
    const initData = async () => {
      try {
        const groupsData = await userService.getAllGroups();
        setAllGroups(groupsData);

        if (user) {
          setFirstName(user.firstName || '');
          setLastName(user.lastName || '');
          setEmail(user.email);
          setRole(user.role as any);
          setStatus(user.status as any);

          if (user.groups_list) {
            setSelectedGroupIds(user.groups_list.map((g: any) => g.id));
          }
        } else {
          const data = await userService.getUserById(userId);
          setFirstName(data.firstName || '');
          setLastName(data.lastName || '');
          setEmail(data.email);
          setRole(data.role as any);
          setStatus(data.status as any);

          if (data.groups_list) {
            setSelectedGroupIds(data.groups_list.map((g: any) => g.id));
          }
        }
      } catch (error: any) {
        Alert.alert('Erreur', 'Impossible de charger le membre.');
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, [userId, user]);

  const toggleGroupSelection = (groupId: string) => {
    if (selectedGroupIds.includes(groupId)) {
      setSelectedGroupIds(selectedGroupIds.filter((id) => id !== groupId));
    } else {
      setSelectedGroupIds([...selectedGroupIds, groupId]);
    }
  };

  const handleUpdate = async () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires.');
      return;
    }

    try {
      setSaving(true);
      
      const payload = {
        firstName,
        lastName,
        role,
        status,
        group_ids: selectedGroupIds,
      };
      
      await updateUserInStore(userId, payload); 
      await useUserStore.getState().fetchUsers();
      
      Alert.alert('Succès', 'Le profil a été mis à jour avec succès.', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Échec de la mise à jour.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.sectionTitle}>Modifier les informations</Text>

        <View style={styles.formCard}>
          <Text style={styles.label}>Prénom *</Text>
          <TextInput style={styles.input} value={firstName} onChangeText={setFirstName} placeholder="Prénom" />

          <Text style={styles.label}>Nom *</Text>
          <TextInput style={styles.input} value={lastName} onChangeText={setLastName} placeholder="Nom de famille" />

          <Text style={styles.label}>Adresse Email *</Text>
          <TextInput style={[styles.input, styles.disabledInput]} value={email} editable={false} />

          <Text style={styles.label}>Rôle au sein de la bibliothèque</Text>
          <View style={styles.pickerRow}>
            {(['reader', 'staff', 'admin'] as const).map((r) => (
              <TouchableOpacity
                key={r}
                style={[styles.pickerButton, role === r && styles.pickerButtonActive]}
                onPress={() => setRole(r)}
              >
                <Text style={[styles.pickerText, role === r && styles.pickerTextActive]}>
                  {r === 'reader' ? 'Lecteur' : r === 'staff' ? 'Staff' : 'Admin'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Statut du compte</Text>
          <View style={styles.pickerRow}>
            {(['active', 'pending', 'suspended'] as const).map((s) => (
              <TouchableOpacity
                key={s}
                style={[styles.pickerButton, status === s && styles.pickerButtonActive]}
                onPress={() => setStatus(s)}
              >
                <Text style={[styles.pickerText, status === s && styles.pickerTextActive]}>
                  {s === 'active' ? 'Actif' : s === 'pending' ? 'Attente' : 'Bloqué'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Assignation aux groupes</Text>
          <View style={styles.groupsContainer}>
            {allGroups.map((group) => {
              const isSelected = selectedGroupIds.includes(group.id);
              return (
                <TouchableOpacity
                  key={group.id}
                  style={[styles.groupCheckboxRow, isSelected && styles.groupCheckboxRowActive]}
                  onPress={() => toggleGroupSelection(group.id)}
                >
                  <View style={[styles.checkboxCircle, isSelected && styles.checkboxCircleChecked]}>
                    {isSelected && <View style={styles.checkboxInnerCircle} />}
                  </View>
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={[styles.groupNameText, isSelected && styles.groupNameTextActive]}>{group.name}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.submitButton, saving && styles.disabledButton]} 
          onPress={handleUpdate}
          disabled={saving}
        >
          {saving ? <ActivityIndicator size="small" color="#ffffff" /> : <Text style={styles.submitButtonText}>Enregistrer</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default UserEditScreen;
