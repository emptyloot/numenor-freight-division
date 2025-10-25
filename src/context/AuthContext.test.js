import React from 'react';
import { render, screen, act, fireEvent, waitFor } from '@testing-library/react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { AuthProvider, useAuth } from './AuthContext';

// Mock the firebase services and functions
jest.mock('../firebase/firebase', () => ({
  auth: {},
  firestore: {},
}));

jest.mock('firebase/auth', () => ({
  onAuthStateChanged: jest.fn(),
  signOut: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  getDoc: jest.fn(),
}));

/**
 * @description A test component to consume the context
 * @returns {object} React.ReactElement
 */
const TestConsumer = () => {
  const { currentUser, logout } = useAuth();
  return (
    <div>
      <div data-testid="current-user">{currentUser ? JSON.stringify(currentUser) : 'No User'}</div>
      <button data-testid="logout-button" onClick={logout}>
        Logout
      </button>
    </div>
  );
};

describe('AuthContext', () => {
  let onAuthStateChangedCallback;
  const mockUnsubscribe = jest.fn();

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Capture the onAuthStateChanged callback to simulate auth state changes
    onAuthStateChanged.mockImplementation((auth, callback) => {
      onAuthStateChangedCallback = callback;
      return mockUnsubscribe; // Return a mock unsubscribe function
    });

    // Default mock for getDoc (document exists)
    getDoc.mockResolvedValue({
      /**
       * @returns {true} true for mock
       */
      exists: () => true,
      /**
       * @returns {object} data object to pass in test
       */
      data: () => ({ role: 'admin', extraData: 'test' }),
    });

    doc.mockImplementation((firestore, collection, uid) => ({
      _path: `${collection}/${uid}`,
    }));
  });

  it('should be in a loading state initially and not render children', () => {
    render(
      <AuthProvider>
        <div data-testid="child">Child Content</div>
      </AuthProvider>
    );
    // Children are not rendered while loading
    expect(screen.queryByTestId('child')).not.toBeInTheDocument();
  });

  it('should set current user when user is authenticated and firestore doc exists', async () => {
    const mockUser = { uid: '123', email: 'test@example.com' };

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    // Simulate user signing in
    await act(async () => {
      await onAuthStateChangedCallback(mockUser);
    });

    // Check if firestore was queried
    expect(doc).toHaveBeenCalledWith(expect.anything(), 'users', '123');
    expect(getDoc).toHaveBeenCalled();

    // Check if user data is correctly set and displayed
    const expectedUser = { ...mockUser, role: 'admin', extraData: 'test' };
    await waitFor(() => {
      expect(screen.getByTestId('current-user')).toHaveTextContent(JSON.stringify(expectedUser));
    });
  });

  it('should set current user from auth if firestore doc does not exist', async () => {
    const mockUser = { uid: '123', email: 'test@example.com' };
    console.error = jest.fn(); // Mock console.error

    // Mock getDoc to return a non-existent document
    getDoc.mockResolvedValue({
      /**
       * @returns {false} false for mock exit
       */
      exists: () => false,
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await act(async () => {
      await onAuthStateChangedCallback(mockUser);
    });

    expect(console.error).toHaveBeenCalledWith("User document doesn't exist in Firestore.");
    await waitFor(() => {
      expect(screen.getByTestId('current-user')).toHaveTextContent(JSON.stringify(mockUser));
    });
  });

  it('should set current user to null when user is signed out', async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    // Simulate user signing out
    await act(async () => {
      await onAuthStateChangedCallback(null);
    });

    await waitFor(() => {
      expect(screen.getByTestId('current-user')).toHaveTextContent('No User');
    });
  });

  it('should call signOut when logout is invoked', async () => {
    const mockUser = { uid: '123', email: 'test@example.com' };
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    // First, sign in a user
    await act(async () => {
      await onAuthStateChangedCallback(mockUser);
    });

    // Then, click the logout button
    fireEvent.click(screen.getByTestId('logout-button'));

    expect(signOut).toHaveBeenCalledTimes(1);
  });

  it('should unsubscribe from onAuthStateChanged on unmount', async () => {
    const { unmount } = render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    unmount();

    expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
  });
});
