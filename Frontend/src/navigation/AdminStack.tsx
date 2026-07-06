import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TouchableOpacity, Text } from 'react-native';

// NOUVEAU : Importation du hook de notre tiroir personnalisé
import { useCustomDrawer } from './DrawerNavigator';

// Importation des écrans co-localisés Admin
import AdminDashboardScreen from '../screens/Admin/Dashboard';
import ManageUsersScreen from '../screens/Admin/ManageUsers';
import ManageCategoriesScreen from '../screens/Admin/ManageCategories';
import ManageBooksScreen from '../screens/Admin/ManageBooks';

const Stack = createNativeStackNavigator();

const AdminStack = () => {
  // On récupère la fonction d'ouverture/fermeture de notre rideau animé
  const { toggleDrawer } = useCustomDrawer();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: '#1e293b' }, // Couleur ardoise/sombre pour l'admin
        headerTintColor: '#ffffff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen 
        name="AdminDashboard" 
        component={AdminDashboardScreen} 
        options={{ 
          title: 'Console Admin',
          // ☰ Ouvre/ferme notre tiroir léger en pur React Native
          headerLeft: () => (
            <TouchableOpacity 
              onPress={toggleDrawer}
              style={{ marginRight: 15 }}
            >
              <Text style={{ color: '#ffffff', fontSize: 24, fontWeight: 'bold' }}>☰</Text>
            </TouchableOpacity>
          ),
        }}
      />
      <Stack.Screen 
        name="ManageUsers" 
        component={ManageUsersScreen} 
        options={{ title: 'Validation Utilisateurs' }}
      />
      <Stack.Screen 
        name="ManageCategories" 
        component={ManageCategoriesScreen} 
        options={{ title: 'Gestion Catégories' }}
      />
      <Stack.Screen 
        name="ManageBooks" 
        component={ManageBooksScreen} 
        options={{ title: 'Gestion des Livres' }}
      />
    </Stack.Navigator>
  );
};

export default AdminStack;
