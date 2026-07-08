import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { userService } from '@services/userService';
import { useUserStore } from '@store/useUserStore';
import { useAppTheme } from '@theme/useAppTheme'; // 🟢 Import du thème
import { styles } from './styles';

const UserEditScreen = ({ route, navigation }: any) => {
  const { userId } = route.params;
  const updateUserInStore = useUserStore((state) => state.updateUserInStore);
  const user = useUserStore((state) => state.users.find((u) => u.id === userId));

  // 🟢 Extraction dynamique du thème
  const { theme } = useAppTheme();
  const { colors, spacing, radius } = theme;

  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'staff' | 'reader'>('reader');
  const [status, setStatus] = useState<'active' | 'pending' | 'suspended'>('pending');
  const [allGroups, setAllGroups] = useState<any[]>([]);
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);

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
      
      setSaving(false);

      setTimeout(() => {
        Alert.alert('Succès', 'Le profil a été mis à jour avec succès.', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      }, 300);

    } catch (error: any) {
      setSaving(false);
      setTimeout(() => {
        Alert.alert('Erreur', error.message || 'Échec de la mise à jour.');
      }, 300);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={[styles.container, { padding: spacing.lg }]} keyboardShouldPersistTaps="handled">
        <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: spacing.lg }]}>
          Modifier les informations
        </Text>

        <View style={[
          styles.formCard, 
          { 
            backgroundColor: colors.surface, 
            borderColor: colors.border,
            borderRadius: radius.lg,
            padding: spacing.lg,
            marginBottom: spacing.xl
          }
        ]}>
          {/* Prénom */}
          <Text style={[styles.label, { color: colors.textSecondary, marginBottom: spacing.xs }]}>Prénom *</Text>
          <TextInput 
            style={[
              styles.input, 
              { 
                backgroundColor: colors.inputBackground, 
                borderColor: colors.inputBorder,
                color: colors.text,
                borderRadius: radius.md,
                padding: spacing.md,
                marginBottom: spacing.lg
              }
            ]} 
            value={firstName} 
            onChangeText={setFirstName} 
            placeholder="Prénom" 
            placeholderTextColor={colors.placeholder}
          />

          {/* Nom */}
          <Text style={[styles.label, { color: colors.textSecondary, marginBottom: spacing.xs }]}>Nom *</Text>
          <TextInput 
            style={[
              styles.input, 
              { 
                backgroundColor: colors.inputBackground, 
                borderColor: colors.inputBorder,
                color: colors.text,
                borderRadius: radius.md,
                padding: spacing.md,
                marginBottom: spacing.lg
              }
            ]} 
            value={lastName} 
            onChangeText={setLastName} 
            placeholder="Nom de famille" 
            placeholderTextColor={colors.placeholder}
          />

          {/* Email (Désactivé) */}
          <Text style={[styles.label, { color: colors.textSecondary, marginBottom: spacing.xs }]}>Adresse Email *</Text>
          <TextInput 
            style={[
              styles.input, 
              { 
                backgroundColor: colors.surfaceVariant, 
                borderColor: colors.border,
                color: colors.textMuted,
                borderRadius: radius.md,
                padding: spacing.md,
                marginBottom: spacing.lg
              }
            ]} 
            value={email} 
            editable={false} 
          />

          {/* Rôle */}
          <Text style={[styles.label, { color: colors.textSecondary, marginBottom: spacing.xs }]}>Rôle au sein de la bibliothèque</Text>
          <View style={[styles.pickerRow, { marginBottom: spacing.lg }]}>
            {(['reader', 'staff', 'admin'] as const).map((r) => {
              const isActive = role === r;
              return (
                <TouchableOpacity
                  key={r}
                  style={[
                    styles.pickerButton,
                    { 
                      backgroundColor: isActive ? colors.surfaceVariant : colors.inputBackground,
                      borderColor: isActive ? colors.primary : colors.inputBorder,
                      borderRadius: radius.md,
                      paddingVertical: spacing.sm,
                      marginHorizontal: spacing.xs
                    }
                  ]}
                  onPress={() => setRole(r)}
                >
                  <Text style={{ 
                    color: isActive ? colors.primary : colors.textSecondary, 
                    fontWeight: isActive ? '700' : '500',
                    fontSize: 13
                  }}>
                    {r === 'reader' ? 'Lecteur' : r === 'staff' ? 'Staff' : 'Admin'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Statut */}
          <Text style={[styles.label, { color: colors.textSecondary, marginBottom: spacing.xs }]}>Statut du compte</Text>
          <View style={[styles.pickerRow, { marginBottom: spacing.lg }]}>
            {(['active', 'pending', 'suspended'] as const).map((s) => {
              const isActive = status === s;
              const activeColor = s === 'active' ? colors.success : s === 'pending' ? colors.warning : colors.danger;
              return (
                <TouchableOpacity
                  key={s}
                  style={[
                    styles.pickerButton,
                    { 
                      backgroundColor: isActive ? colors.surfaceVariant : colors.inputBackground,
                      borderColor: isActive ? activeColor : colors.inputBorder,
                      borderRadius: radius.md,
                      paddingVertical: spacing.sm,
                      marginHorizontal: spacing.xs
                    }
                  ]}
                  onPress={() => setStatus(s)}
                >
                  <Text style={{ 
                    color: isActive ? activeColor : colors.textSecondary, 
                    fontWeight: isActive ? '700' : '500',
                    fontSize: 13
                  }}>
                    {s === 'active' ? 'Actif' : s === 'pending' ? 'Attente' : 'Bloqué'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Groupes */}
          <Text style={[styles.label, { color: colors.textSecondary, marginBottom: spacing.xs }]}>Assignation aux groupes</Text>
          <View style={styles.groupsContainer}>
            {allGroups.map((group) => {
              const isSelected = selectedGroupIds.includes(group.id);
              return (
                <TouchableOpacity
                  key={group.id}
                  style={[
                    styles.groupCheckboxRow,
                    {
                      backgroundColor: isSelected ? colors.surfaceVariant : colors.inputBackground,
                      borderColor: isSelected ? colors.primary : colors.inputBorder,
                      borderRadius: radius.md,
                      padding: spacing.sm,
                      marginBottom: spacing.xs
                    }
                  ]}
                  onPress={() => toggleGroupSelection(group.id)}
                >
                  <View style={[
                    styles.checkboxCircle, 
                    { borderColor: isSelected ? colors.primary : colors.border },
                    isSelected && { backgroundColor: colors.primary }
                  ]}>
                    {isSelected && <View style={[styles.checkboxInnerCircle, { backgroundColor: colors.buttonPrimaryText }]} />}
                  </View>
                  <View style={{ flex: 1, marginLeft: spacing.sm }}>
                    <Text style={{ 
                      color: isSelected ? colors.text : colors.textSecondary,
                      fontWeight: isSelected ? '600' : '400',
                      fontSize: 14
                    }}>
                      {group.name}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Bouton Enregistrer */}
        <TouchableOpacity 
          style={[
            styles.submitButton, 
            { 
              backgroundColor: colors.success, 
              borderRadius: radius.md,
              paddingVertical: spacing.md
            },
            saving && { opacity: 0.6 }
          ]} 
          onPress={handleUpdate}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text style={styles.submitButtonText}>Enregistrer</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default UserEditScreen;
