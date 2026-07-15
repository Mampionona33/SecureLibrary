// screens/Home/index.tsx
import React from 'react';
import { View, Text, Button } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@navigation/types';
import { useAuth } from '@context/AuthContext';
import { useAppTheme } from '@theme/useAppTheme';
import { styles } from './styles';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const HomeScreen = ({ navigation }: Props) => {
  const { logout } = useAuth();
  const { theme } = useAppTheme();
  const { colors } = theme;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text testID="home-title" style={[styles.title, { color: colors.text }]}>
        Page d'Accueil
      </Text>
      <Text testID="home-subtitle" style={[styles.subtitle, { color: colors.textSecondary }]}>
        Bienvenue !
      </Text>
      
      <Button 
        testID="home-logout-button"
        title="Se déconnecter" 
        color="red"
        onPress={logout} 
      />
    </View>
  );
};

export default HomeScreen;
