import React from 'react';
import AppNavigator from '@navigation/AppNavigator';
import { AuthProvider } from '@context/AuthContext';

const App = () => {
  return (
    // Le Provider diffuse l'état de connexion à toute l'application
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
};

export default App;
