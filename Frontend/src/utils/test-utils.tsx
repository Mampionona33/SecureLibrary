import React, { act } from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Text } from 'react-native';
import { AuthProvider } from '@context/AuthContext';

test('AuthProvider passes down isAuthenticated prop', () => {
  const isAuthenticated = true;
  const component = ReactTestRenderer.create(
    <AuthProvider isAuthenticated={isAuthenticated}>
      <Text>Test Content</Text>
    </AuthProvider>,
  );
  
  act(() => {
    expect(component.root.findByType(Text).props.children).toBe('Test Content');
  });
});
