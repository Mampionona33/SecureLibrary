import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '@theme/useAppTheme';
import { styles } from './styles';

const AdminDashboardScreen = ({ navigation }: any) => {
  const { theme } = useAppTheme();
  const { colors, spacing, radius } = theme;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={[styles.container, { padding: spacing.lg }]}>
        <Text 
          testID="admin-dashboard-title"
          style={[styles.title, { color: colors.text, marginBottom: spacing.xs }]}
        >
          Console Administration
        </Text>
        <Text 
          testID="admin-dashboard-subtitle"
          style={[styles.subtitle, { color: colors.textSecondary, marginBottom: spacing.xl }]}
        >
          Gestion de la bibliothèque sécurisée
        </Text>

        <View style={[styles.grid, { gap: spacing.md }]}>
          {/* Carte Validation Membres */}
          <TouchableOpacity 
            testID="admin-card-manage-users"
            style={[
              styles.card, 
              { 
                backgroundColor: colors.surface, 
                borderColor: colors.border,
                borderRadius: radius.lg,
                padding: spacing.lg,
              }
            ]} 
            onPress={() => navigation.navigate('ManageUsers')}
          >
            <Text style={[styles.cardIcon, { marginBottom: spacing.sm }]}>👥</Text>
            <Text 
              testID="admin-card-manage-users-title"
              style={[styles.cardTitle, { color: colors.text, marginBottom: spacing.xs }]}
            >
              Validation Membres
            </Text>
            <Text 
              testID="admin-card-manage-users-description"
              style={[styles.cardDescription, { color: colors.textSecondary }]}
            >
              Approuver, modifier ou suspendre des utilisateurs
            </Text>
          </TouchableOpacity>

          {/* Carte Gestion Livres */}
          <TouchableOpacity 
            testID="admin-card-manage-books"
            style={[
              styles.card, 
              { 
                backgroundColor: colors.surface, 
                borderColor: colors.border,
                borderRadius: radius.lg,
                padding: spacing.lg,
              }
            ]} 
            onPress={() => navigation.navigate('ManageBooks')}
          >
            <Text style={[styles.cardIcon, { marginBottom: spacing.sm }]}>📚</Text>
            <Text 
              testID="admin-card-manage-books-title"
              style={[styles.cardTitle, { color: colors.text, marginBottom: spacing.xs }]}
            >
              Gestion Livres
            </Text>
            <Text 
              testID="admin-card-manage-books-description"
              style={[styles.cardDescription, { color: colors.textSecondary }]}
            >
              Ajouter et chiffrer des fichiers PDF
            </Text>
          </TouchableOpacity>

          {/* Carte Catégories */}
          <TouchableOpacity 
            testID="admin-card-manage-categories"
            style={[
              styles.card, 
              { 
                backgroundColor: colors.surface, 
                borderColor: colors.border,
                borderRadius: radius.lg,
                padding: spacing.lg,
              }
            ]} 
            onPress={() => navigation.navigate('ManageCategories')}
          >
            <Text style={[styles.cardIcon, { marginBottom: spacing.sm }]}>🏷️</Text>
            <Text 
              testID="admin-card-manage-categories-title"
              style={[styles.cardTitle, { color: colors.text, marginBottom: spacing.xs }]}
            >
              Catégories
            </Text>
            <Text 
              testID="admin-card-manage-categories-description"
              style={[styles.cardDescription, { color: colors.textSecondary }]}
            >
              Organiser les rayons de la bibliothèque
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AdminDashboardScreen;
