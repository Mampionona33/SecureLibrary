import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '@theme/useAppTheme'; // 🟢 Import du thème
import { styles } from './styles';

const AdminDashboardScreen = ({ navigation }: any) => {
  // 🟢 Extraction dynamique du thème
  const { theme } = useAppTheme();
  const { colors, spacing, radius } = theme;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={[styles.container, { padding: spacing.lg }]}>
        <Text style={[styles.title, { color: colors.text, marginBottom: spacing.xs }]}>
          Console Administration
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary, marginBottom: spacing.xl }]}>
          Gestion de la bibliothèque sécurisée
        </Text>

        <View style={[styles.grid, { gap: spacing.md }]}>
          {/* Carte Validation Membres */}
          <TouchableOpacity 
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
            <Text style={[styles.cardTitle, { color: colors.text, marginBottom: spacing.xs }]}>
              Validation Membres
            </Text>
            <Text style={[styles.cardDescription, { color: colors.textSecondary }]}>
              Approuver, modifier ou suspendre des utilisateurs
            </Text>
          </TouchableOpacity>

          {/* Carte Gestion Livres */}
          <TouchableOpacity 
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
            <Text style={[styles.cardTitle, { color: colors.text, marginBottom: spacing.xs }]}>
              Gestion Livres
            </Text>
            <Text style={[styles.cardDescription, { color: colors.textSecondary }]}>
              Ajouter et chiffrer des fichiers PDF
            </Text>
          </TouchableOpacity>

          {/* Carte Catégories */}
          <TouchableOpacity 
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
            <Text style={[styles.cardTitle, { color: colors.text, marginBottom: spacing.xs }]}>
              Catégories
            </Text>
            <Text style={[styles.cardDescription, { color: colors.textSecondary }]}>
              Organiser les rayons de la bibliothèque
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AdminDashboardScreen;
