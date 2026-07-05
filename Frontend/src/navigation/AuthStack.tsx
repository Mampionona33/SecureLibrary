import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/Auth/Login'; // 🟢 SANS ACCOLADES
import RegisterScreen from '../screens/Auth/Register'; // 🟢 SANS ACCOLADES
import PendingApprovalScreen from '../screens/Auth/PendingApproval'; // 🟢 SANS ACCOLADES
import { AuthStackParamList } from './types';

const Stack = createNativeStackNavigator<AuthStackParamList>();

const AuthStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="PendingApproval" component={PendingApprovalScreen} />
    </Stack.Navigator>
  );
};

export default AuthStack;
