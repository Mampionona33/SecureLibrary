import React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { onlineManager } from '@tanstack/react-query';
import { Alert, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export const useDevTools = () => {
  const queryClient = useQueryClient();

  const clearCache = () => {
    queryClient.clear();
    console.log('🗑️ Cache vidé');
  };

  const toggleNetwork = () => {
    const isOnline = onlineManager.isOnline();
    onlineManager.setOnline(!isOnline);
    console.log(`🌐 Réseau ${!isOnline ? '✅ activé' : '❌ désactivé'}`);
  };

  const showQueries = () => {
    const queries = queryClient.getQueryCache().getAll();
    console.log('📊 Requêtes actives:', queries.length);
    queries.forEach(q => {
      console.log(`  - ${q.queryKey[0]}: ${q.state.status}`);
    });
  };

  return { clearCache, toggleNetwork, showQueries };
};

// Composant DevTools personnalisé
export const DevToolsButton = () => {
  const { clearCache, toggleNetwork, showQueries } = useDevTools();

  if (!__DEV__) return null;

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={toggleNetwork}>
        <Text style={styles.buttonText}>📶</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={clearCache}>
        <Text style={styles.buttonText}>🗑️</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={showQueries}>
        <Text style={styles.buttonText}>📊</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    zIndex: 999,
    flexDirection: 'row',
    gap: 10,
  },
  button: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 10,
    borderRadius: 25,
    marginLeft: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
});
