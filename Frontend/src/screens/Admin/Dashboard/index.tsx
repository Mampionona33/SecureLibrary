import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../../../context/AuthContext';

interface DashboardProps {
  title: string;
}

type Props = NativeStackScreenProps<any, any> & DashboardProps;

const DashboardScreen = ({ title, navigation }: Props) => {
  const { isStaff } = useAuth();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        <View style={styles.header}>
          <Text style={styles.title}>{title || 'Tableau de bord'}</Text>
          <Text style={styles.badgeRole}>{isStaff ? '⚡ Mode Administrateur' : '📖 Espace Membre'}</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>Secure</Text>
            <Text style={styles.statLabel}>Statut Connexion</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>Gratuit</Text>
            <Text style={styles.statLabel}>Accès Organisation</Text>
          </View>
        </View>

        {isStaff && (
          <>
            <Text style={styles.sectionTitle}>Panneau d'administration</Text>
            <View style={styles.grid}>
              <TouchableOpacity 
                style={[styles.cardAction, { backgroundColor: '#eff6ff' }]}
                onPress={() => navigation.navigate('ManageUsers')}
              >
                <Text style={styles.iconAction}>👥</Text>
                <Text style={styles.labelAction}>Gérer Membres</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={[styles.cardAction, { backgroundColor: '#f0fdf4' }]}>
                <Text style={styles.iconAction}>📚</Text>
                <Text style={styles.labelAction}>Gérer Livres</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={[styles.cardAction, { backgroundColor: '#fdf2f8' }]}>
                <Text style={styles.iconAction}>🗂️</Text>
                <Text style={styles.labelAction}>Gérer Groupes</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={[styles.cardAction, { backgroundColor: '#fff7ed' }]}>
                <Text style={styles.iconAction}>🛡️</Text>
                <Text style={styles.labelAction}>Gérer Autorisations</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        <Text style={styles.sectionTitle}>Espace de l'organisation</Text>
        <View style={styles.grid}>
          <TouchableOpacity style={[styles.cardAction, { backgroundColor: '#f0fdf4' }]}>
            <Text style={styles.iconAction}>📜</Text>
            <Text style={styles.labelAction}>Ressources & Chartes</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.cardAction, { backgroundColor: '#fef9c3' }]}>
            <Text style={styles.iconAction}>📖</Text>
            <Text style={styles.labelAction}>Guide de l'Appli</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.cardAction, { backgroundColor: '#eff6ff' }]}>
            <Text style={styles.iconAction}>📥</Text>
            <Text style={styles.labelAction}>Mes Téléchargements</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.cardAction, { backgroundColor: '#fdf4ff' }]}>
            <Text style={styles.iconAction}>⭐</Text>
            <Text style={styles.labelAction}>Favoris</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  scrollContainer: {
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  badgeRole: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4b5563',
    backgroundColor: '#e5e7eb',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 14,
    marginTop: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardAction: {
    width: '48%',
    padding: 20,
    borderRadius: 14,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  iconAction: {
    fontSize: 32,
    marginBottom: 8,
  },
  labelAction: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 14,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
});

export default DashboardScreen;
