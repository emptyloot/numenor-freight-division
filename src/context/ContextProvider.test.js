import React from 'react';
import { render, screen } from '@testing-library/react';
import { ContextProvider } from './ContextProvider'; // Adjust the import path

jest.mock('axios', () => ({
  get: jest.fn(() => Promise.resolve({ data: {} })),
  post: jest.fn(() => Promise.resolve({ data: {} })),
  put: jest.fn(() => Promise.resolve({ data: {} })),
  delete: jest.fn(() => Promise.resolve({ data: {} })),
}));

// Mocking the individual providers for testing purposes
// Assuming you have mock files set up or you mock them inline
jest.mock('./AuthContext', () => ({
  /**
   * @param {object} root0 The props object.
   * @param {object} root0.children The child components to be rendered within the provider.
   * @description A mock AuthProvider component for testing.
   * @returns {object} A div element representing the AuthProvider.
   */
  AuthProvider: ({ children }) => <div data-testid="auth-provider">{children}</div>,
}));

jest.mock('./DashboardContext', () => ({
  /**
   * @param {object} root0 The props object.
   * @param {object} root0.children The child components to be rendered within the provider.
   * @returns {object} A div element representing the DashboardProvider.
   */
  DashboardProvider: ({ children }) => <div data-testid="dashboard-provider">{children}</div>,
}));

jest.mock('./ShipmentManifestContext', () => ({
  /**
   * @param {object} root0 The props object.
   * @param {object} root0.children The child components to be rendered within the provider.
   * @returns {object} A div element representing the ManifestProvider.
   */
  ManifestProvider: ({ children }) => <div data-testid="manifest-provider">{children}</div>,
}));

describe('./ContextProvider', () => {
  it('renders children wrapped in all composed providers in the correct order', () => {
    /**
     * @returns {object} A functional component that renders a div with the data test id "child-component".
     */
    const ChildComponent = () => <div data-testid="child-component" />;

    render(
      <ContextProvider>
        <ChildComponent />
      </ContextProvider>
    );

    const child = screen.getByTestId('child-component');
    const manifestProvider = screen.getByTestId('manifest-provider');
    const dashboardProvider = screen.getByTestId('dashboard-provider');
    const authProvider = screen.getByTestId('auth-provider');

    // 1. Check if the child component is rendered
    expect(child).toBeInTheDocument();

    // 2. Verify the composition hierarchy (nesting)
    // The contextProviders array is reduced right-to-left:
    // AuthProvider -> DashboardProvider -> ManifestProvider -> ChildComponent

    // The ChildComponent should be inside the ManifestProvider
    expect(manifestProvider).toContainElement(child);

    // The ManifestProvider should be inside the DashboardProvider
    expect(dashboardProvider).toContainElement(manifestProvider);

    // The DashboardProvider should be inside the AuthProvider
    expect(authProvider).toContainElement(dashboardProvider);

    // Check if the overall structure starts with AuthProvider
    expect(screen.getByTestId('auth-provider')).toBeInTheDocument(); // Check if authProvider is the top-most mocked provider
  });
});
