import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Importation des écrans co-localisés Admin
import AdminDashboardScreen from '../screens/Admin/Dashboard';
import ManageUsersScreen from '../screens/Admin/ManageUsers';
import ManageCategoriesScreen from '../screens/Admin/ManageCategories';
import ManageBooksScreen from '../screens/Admin/ManageBooks';

const Stack = createNativeStackNavigator();

const AdminStack = () => {
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
        options={{ title: 'Console Admin' }}
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
