// 1. Navigation Sécurité
export type SecurityStackParamList = {
  SetupVault: undefined;
  UnlockVault: undefined;
};

// 2. Navigation Authentification
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  PendingApproval: undefined;
};

// 3. Navigation Utilisateur
export type MainStackParamList = {
  BookList: undefined;
  BookReader: { bookId: string; bookTitle: string }; // Paramètres requis pour lire un livre
};

// 4. Navigation Admin
export type AdminStackParamList = {
  AdminDashboard: undefined;
  ManageUsers: undefined;
  ManageCategories: undefined;
  ManageBooks: undefined;
};

// 5. Paramètres Globaux combinés pour le RootStack
export type RootStackParamList = {
  SecurityStack: undefined;
  AuthStack: undefined;
  MainStack: undefined;
  AdminStack: undefined;
};
