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
import { useAppTheme } from '@theme/useAppTheme'; // 🟢 Import du thème
import MainStack from './MainStack';
import AdminStack from './AdminStack';

const { width } = Dimensions.get('window');
const DRAWER_WIDTH = width * 0.75;

// Mini-context local pour piloter l'ouverture du tiroir
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
  
  // 🟢 Extraction des valeurs du thème
  const { theme } = useAppTheme();
  const { colors, spacing, radius } = theme;

  // Valeurs animées pour la position du tiroir et l'opacité de l'overlay
  const animX = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const animOpacity = useRef(new Animated.Value(0)).current;

  const toggleDrawer = () => {
    if (isOpen) {
      // Fermeture simultanée du tiroir et fondu de l'overlay
      Animated.parallel([
        Animated.timing(animX, {
          toValue: -DRAWER_WIDTH,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(animOpacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start(() => setIsOpen(false));
    } else {
      setIsOpen(true);
      // Ouverture simultanée du tiroir et apparition de l'overlay
      Animated.parallel([
        Animated.timing(animX, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(animOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  return (
    <CustomDrawerContext.Provider value={{ toggleDrawer }}>
      <View style={styles.container}>
        
        {/* 1. CONTENU DE L'APPLICATION EN ARRIÈRE-PLAN */}
        <View style={styles.contentArea}>
          {currentView === 'admin' && isStaff ? <AdminStack /> : <MainStack />}
        </View>

        {/* 2. OVERLAY ANIMÉ AVEC TRANSPARENCE DYNAMIQUE */}
        {isOpen && (
          <TouchableWithoutFeedback onPress={toggleDrawer}>
            <Animated.View 
              style={[
                styles.overlay, 
                { 
                  backgroundColor: colors.overlay,
                  opacity: animOpacity 
                }
              ]} 
            />
          </TouchableWithoutFeedback>
        )}

        {/* 3. TIROIR SÉCURISÉ & THÉMATISÉ */}
        <Animated.View 
          style={[
            styles.drawer, 
            { 
              width: DRAWER_WIDTH,
              backgroundColor: colors.surface, 
              borderColor: colors.border,
              transform: [{ translateX: animX }] 
            }
          ]}
        >
          <View style={[styles.drawerContent, { padding: spacing.lg, paddingTop: spacing.xl * 1.5 }]}>
            
            <Text style={[styles.menuTitle, { color: colors.text, marginBottom: spacing.xl }]}>
              📖 SecureLibrary
            </Text>
            
            {/* Onglet Bibliothèque */}
            <TouchableOpacity 
              style={[
                styles.menuItem, 
                { borderRadius: radius.md, paddingVertical: spacing.md, paddingHorizontal: spacing.sm },
                currentView === 'main' && { backgroundColor: colors.surfaceVariant }
              ]} 
              onPress={() => { setCurrentView('main'); toggleDrawer(); }}
            >
              <Text style={[
                styles.menuItemText, 
                { color: currentView === 'main' ? colors.primary : colors.textSecondary }
              ]}>
                📚 Ma Bibliothèque
              </Text>
            </TouchableOpacity>

            {/* Onglet Admin Panel */}
            {isStaff && (
              <TouchableOpacity 
                style={[
                  styles.menuItem, 
                  { borderRadius: radius.md, paddingVertical: spacing.md, paddingHorizontal: spacing.sm },
                  currentView === 'admin' && { backgroundColor: colors.surfaceVariant }
                ]} 
                onPress={() => { setCurrentView('admin'); toggleDrawer(); }}
              >
                <Text style={[
                  styles.menuItemText, 
                  { color: currentView === 'admin' ? colors.primary : colors.textSecondary }
                ]}>
                  ⚙️ Panel Console Admin
                </Text>
              </TouchableOpacity>
            )}

            {/* Bouton Déconnexion */}
            <TouchableOpacity 
              style={[
                styles.logoutButton, 
                { 
                  backgroundColor: colors.danger + '20', // Opacité légère de danger
                  borderRadius: radius.md, 
                  padding: spacing.md,
                  marginBottom: spacing.lg 
                }
              ]} 
              onPress={async () => await logout()}
            >
              <Text style={[styles.logoutText, { color: colors.danger }]}>
                🚪 Déconnexion
              </Text>
            </TouchableOpacity>
            
          </View>
        </Animated.View>
      </View>
    </CustomDrawerContext.Provider>
  );
};

// 🎨 STYLES ÉPURÉS
const styles = StyleSheet.create({
  container: { 
    flex: 1,
    position: 'relative',
  },
  contentArea: {
    flex: 1,
    zIndex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  drawer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    zIndex: 20,
    borderRightWidth: 1,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 5,
  },
  drawerContent: { 
    flex: 1,
  },
  menuTitle: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    paddingLeft: 8 
  },
  menuItem: { 
    marginBottom: 8 
  },
  menuItemText: { 
    fontSize: 16, 
    fontWeight: '600' 
  },
  logoutButton: { 
    marginTop: 'auto', 
    alignItems: 'center' 
  },
  logoutText: { 
    fontWeight: 'bold', 
    fontSize: 16 
  }
});

export default DrawerNavigator;
