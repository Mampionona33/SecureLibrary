// navigation/DrawerNavigator.tsx
import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  Animated, 
  Dimensions, 
  TouchableWithoutFeedback,
  Switch,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useAuthStore } from '@store/useAuthStore';
import { useAppTheme } from '@theme/useAppTheme';
import { useThemeStore } from '@store/useThemeStore';
import { useNavigation } from '@react-navigation/native';
import MainStack from './MainStack';
import AdminStack from './AdminStack';

const { width } = Dimensions.get('window');
const DRAWER_WIDTH = width * 0.75;

// Context pour le drawer
const CustomDrawerContext = createContext<{ toggleDrawer: () => void } | undefined>(undefined);

export const useCustomDrawer = () => {
  const context = useContext(CustomDrawerContext);
  if (!context) throw new Error("useCustomDrawer doit être utilisé dans DrawerNavigator");
  return context;
};

export const DrawerNavigator = () => {
  // États du store
  const { 
    isStaff, 
    logout, 
    isLoading, 
    user,
    isPendingApproval,
    isAuthenticated
  } = useAuthStore();
  
  const navigation = useNavigation();
  
  const [isOpen, setIsOpen] = useState(false);
  // ✅ Définir la vue par défaut : 'main' pour tout le monde
  const [currentView, setCurrentView] = useState<'main' | 'admin'>('main');
  
  // Thème
  const { theme, isDark } = useAppTheme();
  const { colors, spacing, radius } = theme;
  const setThemeMode = useThemeStore((state) => state.setThemeMode);

  // Animations
  const animX = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const animOpacity = useRef(new Animated.Value(0)).current;

  // Surveiller l'authentification pour rediriger vers Login si déconnecté
  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      console.log('🚪 Utilisateur non authentifié, redirection vers Login');
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    }
  }, [isAuthenticated, isLoading, navigation]);

  // ✅ NE PAS forcer la vue admin automatiquement
  // Laissez l'utilisateur choisir sa vue

  // Gestion de l'ouverture/fermeture du drawer
  const toggleDrawer = () => {
    if (isOpen) {
      Animated.parallel([
        Animated.timing(animX, { 
          toValue: -DRAWER_WIDTH, 
          duration: 250, 
          useNativeDriver: true 
        }),
        Animated.timing(animOpacity, { 
          toValue: 0, 
          duration: 250, 
          useNativeDriver: true 
        }),
      ]).start(() => setIsOpen(false));
    } else {
      setIsOpen(true);
      Animated.parallel([
        Animated.timing(animX, { 
          toValue: 0, 
          duration: 250, 
          useNativeDriver: true 
        }),
        Animated.timing(animOpacity, { 
          toValue: 1, 
          duration: 250, 
          useNativeDriver: true 
        }),
      ]).start();
    }
  };

  // Gestion du thème
  const handleToggleTheme = (value: boolean) => {
    setThemeMode(value ? 'dark' : 'light');
  };

  // Gestion de la déconnexion avec confirmation
  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { 
          text: 'Annuler', 
          style: 'cancel' 
        },
        { 
          text: 'Se déconnecter', 
          style: 'destructive',
          onPress: async () => {
            try {
              if (isOpen) toggleDrawer();
              console.log('🔓 Déconnexion demandée...');
              await logout();
              console.log('✅ Déconnexion réussie');
            } catch (error) {
              console.error('❌ Erreur déconnexion:', error);
              Alert.alert(
                'Erreur',
                'Une erreur est survenue lors de la déconnexion. Veuillez réessayer.'
              );
            }
          }
        }
      ],
      { cancelable: false }
    );
  };

  // Fonction pour changer de vue
  const handleViewChange = (view: 'main' | 'admin') => {
    setCurrentView(view);
    toggleDrawer();
  };

  console.log('👤 Drawer - isAuthenticated:', isAuthenticated);
  console.log('👤 Drawer - isStaff:', isStaff);
  console.log('👤 Drawer - user:', user?.email);
  console.log('👤 Drawer - currentView:', currentView);
  console.log('👤 Drawer - isLoading:', isLoading);

  // ✅ Déterminer quelle stack afficher
  const renderStack = () => {
    // Si admin ET que currentView est 'admin', afficher AdminStack
    if (isStaff && currentView === 'admin') {
      return <AdminStack />;
    }
    // Sinon, toujours afficher MainStack
    return <MainStack />;
  };

  return (
    <CustomDrawerContext.Provider value={{ toggleDrawer }}>
      <View style={styles.container}>
        
        {/* Contenu principal */}
        <View style={styles.contentArea}>
          {renderStack()}
        </View>

        {/* Overlay quand le drawer est ouvert */}
        {isOpen && (
          <TouchableWithoutFeedback onPress={toggleDrawer}>
            <Animated.View 
              style={[
                styles.overlay, 
                { 
                  backgroundColor: colors.overlay || 'rgba(0,0,0,0.5)',
                  opacity: animOpacity 
                }
              ]} 
            />
          </TouchableWithoutFeedback>
        )}

        {/* Drawer */}
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
            
            {/* En-tête avec info utilisateur */}
            <View style={styles.headerContainer}>
              <Text style={[styles.menuTitle, { color: colors.text, marginBottom: spacing.xs }]}>
                📖 SecureLibrary
              </Text>
              {user ? (
                <View style={styles.userInfoContainer}>
                  <Text style={[styles.userName, { color: colors.text, fontWeight: '600' }]}>
                    {user.firstName || user.first_name || 'Utilisateur'}
                  </Text>
                  <Text style={[styles.userEmail, { color: colors.textSecondary }]}>
                    {user.email || 'Email non disponible'}
                  </Text>
                  <View style={styles.badgeContainer}>
                    {isStaff && (
                      <View style={[styles.badge, { backgroundColor: colors.primary + '20' }]}>
                        <Text style={[styles.badgeText, { color: colors.primary }]}>
                          👑 Admin
                        </Text>
                      </View>
                    )}
                    {isPendingApproval && (
                      <View style={[styles.badge, { backgroundColor: colors.warning + '20' }]}>
                        <Text style={[styles.badgeText, { color: colors.warning }]}>
                          ⏳ En attente
                        </Text>
                      </View>
                    )}
                    {!isStaff && !isPendingApproval && (
                      <View style={[styles.badge, { backgroundColor: colors.success + '20' }]}>
                        <Text style={[styles.badgeText, { color: colors.success }]}>
                          👤 Utilisateur
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              ) : (
                <View style={styles.userInfoContainer}>
                  <Text style={[styles.userEmail, { color: colors.textSecondary }]}>
                    Chargement...
                  </Text>
                </View>
              )}
            </View>
            
            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            {/* Menu items */}
            <TouchableOpacity 
              style={[
                styles.menuItem, 
                { 
                  borderRadius: radius.md, 
                  paddingVertical: spacing.md, 
                  paddingHorizontal: spacing.sm,
                  marginBottom: spacing.xs 
                },
                // ✅ Mettre en surbrillance quand 'main' est sélectionné
                currentView === 'main' && { backgroundColor: colors.surfaceVariant || colors.primary + '15' }
              ]} 
              onPress={() => handleViewChange('main')}
            >
              <Text style={[
                styles.menuItemText, 
                { 
                  color: currentView === 'main' ? colors.primary : colors.textSecondary 
                }
              ]}>
                📚 Ma Bibliothèque
              </Text>
            </TouchableOpacity>

            {isStaff && (
              <TouchableOpacity 
                style={[
                  styles.menuItem, 
                  { 
                    borderRadius: radius.md, 
                    paddingVertical: spacing.md, 
                    paddingHorizontal: spacing.sm,
                    marginBottom: spacing.xs 
                  },
                  // ✅ Mettre en surbrillance quand 'admin' est sélectionné
                  currentView === 'admin' && { backgroundColor: colors.surfaceVariant || colors.primary + '15' }
                ]} 
                onPress={() => handleViewChange('admin')}
              >
                <Text style={[
                  styles.menuItemText, 
                  { 
                    color: currentView === 'admin' ? colors.primary : colors.textSecondary 
                  }
                ]}>
                  ⚙️ Panel Console Admin
                </Text>
              </TouchableOpacity>
            )}

            {/* Espace flexible */}
            <View style={{ flex: 1 }} />

            {/* Theme switch */}
            <View style={[
              styles.themeSwitchRow, 
              { 
                backgroundColor: colors.inputBackground || colors.surfaceVariant, 
                borderColor: colors.border,
                borderRadius: radius.md,
                padding: spacing.md,
                marginBottom: spacing.md
              }
            ]}>
              <View style={styles.themeLabelContainer}>
                <Text style={{ fontSize: 18 }}>{isDark ? '🌙' : '☀️'}</Text>
                <Text style={[styles.themeLabelText, { color: colors.text, marginLeft: spacing.xs }]}>
                  Mode Sombre
                </Text>
              </View>

              <Switch
                trackColor={{ 
                  false: colors.border || '#ccc', 
                  true: colors.primary 
                }}
                thumbColor={colors.surface || '#fff'}
                ios_backgroundColor={colors.border || '#ccc'}
                onValueChange={handleToggleTheme}
                value={isDark}
              />
            </View>

            {/* Bouton de déconnexion */}
            <TouchableOpacity 
              style={[
                styles.logoutButton, 
                { 
                  backgroundColor: colors.danger + '20', 
                  borderRadius: radius.md, 
                  padding: spacing.md,
                  marginBottom: spacing.lg,
                  opacity: isLoading ? 0.7 : 1,
                }
              ]} 
              onPress={handleLogout}
              disabled={isLoading}
            >
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={colors.danger} />
                  <Text style={[styles.logoutText, { color: colors.danger, marginLeft: spacing.xs }]}>
                    Déconnexion...
                  </Text>
                </View>
              ) : (
                <Text style={[styles.logoutText, { color: colors.danger }]}>
                  🚪 Déconnexion
                </Text>
              )}
            </TouchableOpacity>
            
          </View>
        </Animated.View>
      </View>
    </CustomDrawerContext.Provider>
  );
};

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
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },
  drawerContent: { 
    flex: 1,
  },
  headerContainer: {
    marginBottom: 8,
  },
  menuTitle: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    paddingLeft: 8 
  },
  userInfoContainer: {
    paddingLeft: 8,
    marginTop: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 4,
  },
  badgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 2,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    marginRight: 6,
    marginTop: 2,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    marginVertical: 12,
    marginHorizontal: 8,
  },
  menuItem: { 
    marginBottom: 4,
  },
  menuItemText: { 
    fontSize: 16, 
    fontWeight: '600' 
  },
  themeSwitchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
  },
  themeLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  themeLabelText: {
    fontSize: 15,
    fontWeight: '600',
  },
  logoutButton: { 
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  logoutText: { 
    fontWeight: 'bold', 
    fontSize: 16 
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default DrawerNavigator;
