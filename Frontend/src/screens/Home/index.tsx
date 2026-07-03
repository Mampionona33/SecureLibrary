// src/screens/Home/index.tsx
import React from 'react';
import { View, Text, Button } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@navigation/types';

// 1. On importe le hook du contexte
import { useAuth } from '@context/AuthContext';

// 2. On importe nos styles isolés
import { styles } from './styles';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const HomeScreen = ({ navigation }: Props) => {
  // On récupère la fonction de déconnexion globale
  const { logout } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Page d'Accueil</Text>
      <Text style={styles.subtitle}>Bienvenue !</Text>
      
      <Button 
        title="Se déconnecter" 
        color="red"
        onPress={logout} 
      />
    </View>
  );
};

export default HomeScreen;
