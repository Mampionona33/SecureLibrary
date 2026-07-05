import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TouchableOpacity, Text } from 'react-native';

// NOUVEAU : Importation du hook de notre tiroir personnalisé léger
import { useCustomDrawer } from './DrawerNavigator';

// Importation des écrans co-localisés
import BookListScreen from '../screens/Main/BookList';
import BookReaderScreen from '../screens/Main/BookReader';

const Stack = createNativeStackNavigator();

const MainStack = () => {
  // On récupère la fonction de contrôle de notre tiroir
  const { toggleDrawer } = useCustomDrawer();

  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: true,
        headerStyle: { backgroundColor: '#3b82f6' },
        headerTintColor: '#ffffff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen 
        name="BookList" 
        component={BookListScreen} 
        options={{ 
          title: 'Ma Bibliothèque chiffrée',
          // ☰ Déclenche l'animation de gauche à droite
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
        name="BookReader" 
        component={BookReaderScreen} 
        options={{ title: 'Lecture Sécurisée', headerShown: false }} // Plein écran sans interférence
      />
    </Stack.Navigator>
  );
};

export default MainStack;
