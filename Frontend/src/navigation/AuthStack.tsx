import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '@context/AuthContext';
import { AuthStackParamList } from './types';

import LoginScreen from '@screens/Auth/Login';
import RegisterScreen from '@screens/Auth/Register';
import PendingApprovalScreen from '@screens/Auth/PendingApproval';

const Stack = createNativeStackNavigator<AuthStackParamList>();

const AuthStack = () => {
  const { isPendingApproval } = useAuth();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isPendingApproval ? (
        <Stack.Screen name="PendingApproval" component={PendingApprovalScreen} />
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default AuthStack;
