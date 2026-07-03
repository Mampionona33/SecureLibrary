import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@navigation/types';

// 1. On importe le hook du contexte
import { useAuth } from '@context/AuthContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const HomeScreen = ({ navigation }: Props) => {
  // 2. On récupère la fonction de déconnexion globale
  const { logout } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Page d'Accueil</Text>
      <Text style={styles.subtitle}>Bienvenue !</Text>
      
      <Button 
        title="Se déconnecter" 
        color="red"
        // 3. On appelle simplement la fonction du contexte
        onPress={logout} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 30,
  }
});

export default HomeScreen;
