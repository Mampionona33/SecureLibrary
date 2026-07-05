import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Importation des écrans co-localisés
import BookListScreen from '../screens/Main/BookList';
import BookReaderScreen from '../screens/Main/BookReader';

const Stack = createNativeStackNavigator();

const MainStack = () => {
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
        options={{ title: 'Ma Bibliothèque chiffrée' }}
      />
      <Stack.Screen 
        name="BookReader" 
        component={BookReaderScreen} 
        options={{ title: 'Lecture Sécurisée', headerShown: false }} // Plein écran pour le PDF
      />
    </Stack.Navigator>
  );
};

export default MainStack;
