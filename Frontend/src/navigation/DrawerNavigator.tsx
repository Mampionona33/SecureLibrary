import React, { createContext, useContext, useState, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  Animated, 
  Dimensions, 
  TouchableWithoutFeedback 
} from 'react-native';
import { useAuth } from '@context/AuthContext';
import MainStack from './MainStack';
import AdminStack from './AdminStack';

const { width } = Dimensions.get('window');
const DRAWER_WIDTH = width * 0.75; // Le tiroir prend 75% de l'écran

// Création d'un mini-context local pour ouvrir le tiroir depuis n'importe où
const CustomDrawerContext = createContext<{ toggleDrawer: () => void } | undefined>(undefined);

export const useCustomDrawer = () => {
  const context = useContext(CustomDrawerContext);
  if (!context) throw new Error("useCustomDrawer doit être utilisé dans DrawerNavigator");
  return context;
};

export const DrawerNavigator = () => {
  const { isStaff, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'main' | 'admin'>(isStaff ? 'admin' : 'main');
  
  const animX = useRef(new Animated.Value(-DRAWER_WIDTH)).current; // Caché à gauche

  const toggleDrawer = () => {
    if (isOpen) {
      // Fermer
      Animated.timing(animX, {
        toValue: -DRAWER_WIDTH,
        duration: 250,
        useNativeDriver: true,
      }).start(() => setIsOpen(false));
    } else {
      // Ouvrir
      setIsOpen(true);
      Animated.timing(animX, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  };
return (
    <CustomDrawerContext.Provider value={{ toggleDrawer }}>
      <View style={styles.container}>
        
        {/* 1. L'APPLICATION EN ARRIÈRE-PLAN */}
        <View style={styles.contentArea}>
          {currentView === 'admin' && isStaff ? <AdminStack /> : <MainStack />}
        </View>

        {/* 2. L'OVERLAY SOMBRE DE COUVERTURE TOTALE */}
        {isOpen && (
          <TouchableWithoutFeedback onPress={toggleDrawer}>
            <Animated.View style={styles.overlay} />
          </TouchableWithoutFeedback>
        )}

        {/* 3. LE TIROIR ANIMÉ (DRAWER) */}
        <Animated.View style={[styles.drawer, { transform: [{ translateX: animX }] }]}>
          <View style={styles.drawerContent}>
            
            <Text style={styles.menuTitle}>📖 SecureLibrary</Text>
            
            <TouchableOpacity 
              style={[styles.menuItem, currentView === 'main' && styles.activeItem]} 
              onPress={() => { setCurrentView('main'); toggleDrawer(); }}
            >
              <Text style={styles.menuItemText}>📚 Ma Bibliothèque</Text>
            </TouchableOpacity>

            {isStaff && (
              <TouchableOpacity 
                style={[styles.menuItem, currentView === 'admin' && styles.activeItem]} 
                onPress={() => { setCurrentView('admin'); toggleDrawer(); }}
              >
                <Text style={styles.menuItemText}>⚙️ Panel Console Admin</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.logoutButton} onPress={async () => await logout()}>
              <Text style={styles.logoutText}>🚪 Déconnexion</Text>
            </TouchableOpacity>
            
          </View>
        </Animated.View>
      </View>
    </CustomDrawerContext.Provider>
  );
};

// 🎨 LES STYLES CORRIGÉS POUR L'OVERLAY
const styles = StyleSheet.create({
  container: { 
    flex: 1,
    position: 'relative',
  },
  contentArea: {
    flex: 1,
    zIndex: 1, // L'application est au niveau le plus bas
  },
  overlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    zIndex: 10, // L'overlay se met au-dessus de l'application
  },
  drawer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: DRAWER_WIDTH,
    backgroundColor: '#ffffff',
    zIndex: 20, // Le tiroir est tout en haut, au-dessus de l'overlay
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 5,
  },
  drawerContent: { flex: 1, padding: 20, paddingTop: 60 },
  menuTitle: { fontSize: 22, fontWeight: 'bold', color: '#1e293b', marginBottom: 30, paddingLeft: 10 },
  menuItem: { paddingVertical: 14, paddingHorizontal: 12, borderRadius: 8, marginBottom: 10 },
  activeItem: { backgroundColor: '#e2e8f0' },
  menuItemText: { fontSize: 16, color: '#334155', fontWeight: '600' },
  logoutButton: { marginTop: 'auto', backgroundColor: '#fee2e2', padding: 14, borderRadius: 8, alignItems: 'center', marginBottom: 20 },
  logoutText: { color: '#ef4444', fontWeight: 'bold', fontSize: 16 }
});

export default DrawerNavigator;
