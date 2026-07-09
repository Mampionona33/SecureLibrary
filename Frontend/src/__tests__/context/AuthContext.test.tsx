import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Text } from 'react-native';
import { AuthProvider } from '@context/AuthContext';

test('AuthProvider loads without crashing', () => {
  expect(() => {
    ReactTestRenderer.act(() => {
      ReactTestRenderer.create(
        <AuthProvider>
          <Text>Test Content</Text>
        </AuthProvider>
      );
    });
  }).not.toThrow();
});
