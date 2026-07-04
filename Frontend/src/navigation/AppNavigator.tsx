import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from '@screens/Auth/Login';
import HomeScreen from '@screens/Home';
import { RootStackParamList } from './types';

// Importation de notre Hook de contexte
import { useAuth } from '@context/AuthContext';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  // On récupère l'état global
  const { isAuthenticated, isLoading } = useAuth();

  // Écran de chargement pendant que l'app vérifie le token au démarrage
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#1e3a8a" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          // 🟢 Écrans accessibles UNIQUEMENT si connecté (Zone Sécurisée)
          <Stack.Screen name="Home" component={HomeScreen} />
        ) : (
          // 🔴 Écrans accessibles UNIQUEMENT si déconnecté (Zone Publique)
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
