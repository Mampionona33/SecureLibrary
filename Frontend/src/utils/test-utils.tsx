import React from 'react';
import { render as rtlRender } from '@testing-library/react-native';
import { AuthProvider } from '@context/AuthContext';
import { VaultProvider } from '@context/VaultContext';

// Un vrai helper qui enveloppe tes composants avec tes providers globaux
function renderWithProviders(ui: React.ReactElement, options = {}) {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthProvider>
      <VaultProvider>
        {children}
      </VaultProvider>
    </AuthProvider>
  );

  return rtlRender(ui, { wrapper: Wrapper, ...options });
}

// On ré-exporte tout ce qui vient de testing-library + notre render personnalisé
export * from '@testing-library/react-native';
export { renderWithProviders as render };
