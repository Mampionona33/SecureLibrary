import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { NavigationContainer } from '@react-navigation/native';
import AdminStack from '@navigation/AdminStack';

jest.mock('@react-navigation/native-stack', () => {
  const React = require('react');
  return {
    createNativeStackNavigator: jest.fn(() => {
      const Navigator = ({ children }: any) => {
        const childrenArray = React.Children.toArray(children);
        return React.createElement(
          'View',
          null,
          childrenArray.map((child: any) => {
            if (child.props.name === 'AdminDashboard') {
              const Component = child.props.component;
              return React.createElement(Component, { key: child.props.name });
            }
            return null;
          })
        );
      };

      const Screen = ({ component: Component }: any) => React.createElement(Component);

      return {
        Navigator,
        Screen,
      };
    }),
  };
});

jest.mock('@navigation/DrawerNavigator', () => ({
  useCustomDrawer: jest.fn(() => ({
    toggleDrawer: jest.fn(),
  })),
}));

jest.mock('@screens/Admin/Dashboard', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: () => React.createElement('Text', { testID: 'admin-dashboard' }, 'AdminDashboardScreen'),
  };
});

jest.mock('@screens/Admin/ManageUsers', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: () => React.createElement('Text', null, 'ManageUsersScreen'),
  };
});

jest.mock('@screens/Admin/ManageCategories', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: () => React.createElement('Text', null, 'ManageCategoriesScreen'),
  };
});

jest.mock('@screens/Admin/ManageBooks', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: () => React.createElement('Text', null, 'ManageBooksScreen'),
  };
});

jest.mock('@screens/Admin/UserDetail', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: () => React.createElement('Text', null, 'UserDetailScreen'),
  };
});

jest.mock('@screens/Admin/UserEdit', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: () => React.createElement('Text', null, 'UserEditScreen'),
  };
});

jest.mock('@screens/Admin/CreateUser', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: () => React.createElement('Text', null, 'CreateUserScreen'),
  };
});

jest.mock('@screens/Admin/CreateBook', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: () => React.createElement('Text', null, 'CreateBookScreen'),
  };
});

jest.mock('@react-navigation/native', () => ({
  NavigationContainer: ({ children }: any) => children,
  useFocusEffect: jest.fn(),
  useNavigation: jest.fn(),
}));

describe('AdminStack', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders AdminDashboard by default', async () => {
    let instance: any;
    await ReactTestRenderer.act(async () => {
      instance = ReactTestRenderer.create(
        <NavigationContainer>
          <AdminStack />
        </NavigationContainer>
      );
    });

    const root = instance.root;
    const dashboardText = root.findAll(
      (el: any) => el.props.testID === 'admin-dashboard'
    );
    expect(dashboardText.length).toBeGreaterThan(0);
  });

  it('should not throw error when rendering', async () => {
    await expect(async () => {
      await ReactTestRenderer.act(async () => {
        ReactTestRenderer.create(
          <NavigationContainer>
            <AdminStack />
          </NavigationContainer>
        );
      });
    }).not.toThrow();
  });
});
