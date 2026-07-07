import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from './styles';

const AdminDashboardScreen = ({ navigation }: any) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Console Administration</Text>
        <Text style={styles.subtitle}>Gestion de la bibliothèque sécurisée</Text>

        <View style={styles.grid}>
          <TouchableOpacity 
            style={styles.card} 
            onPress={() => navigation.navigate('ManageUsers')}
          >
            <Text style={styles.cardIcon}>👥</Text>
            <Text style={styles.cardTitle}>Validation Membres</Text>
            <Text style={styles.cardDescription}>Approuver, modifier ou suspendre des utilisateurs</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.card} 
            onPress={() => navigation.navigate('ManageBooks')}
          >
            <Text style={styles.cardIcon}>📚</Text>
            <Text style={styles.cardTitle}>Gestion Livres</Text>
            <Text style={styles.cardDescription}>Ajouter et chiffrer des fichiers PDF</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.card} 
            onPress={() => navigation.navigate('ManageCategories')}
          >
            <Text style={styles.cardIcon}>🏷️</Text>
            <Text style={styles.cardTitle}>Catégories</Text>
            <Text style={styles.cardDescription}>Organiser les rayons de la bibliothèque</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AdminDashboardScreen;
