import React from 'react';
import { render, screen, act, fireEvent, waitFor } from '@testing-library/react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { AuthProvider, useAuth } from './AuthContext';

// Mock the firebase services and functions
jest.mock('../firebase/firebase', () => ({
  auth: {},
  firestore: {},
}));

jest.mock('firebase/auth', () => ({
  onAuthStateChanged: jest.fn(),
  signOut: jest.fn(),
  getAuth: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  getDoc: jest.fn(),
  onSnapshot: jest.fn(),
  getFirestore: jest.fn(),
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
  let onSnapshotCallback;
  /**
   * @description Sets up mock implementations for Firebase authentication and Firestore before each test.
   */

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Capture the onAuthStateChanged callback to simulate auth state changes
    onAuthStateChanged.mockImplementation((auth, callback) => {
      onAuthStateChangedCallback = callback;
      return mockUnsubscribe; // Return a mock unsubscribe function
    });

    // Mock onSnapshot to capture its callback
    onSnapshot.mockImplementation((docRef, callback) => {
      onSnapshotCallback = callback;
      // Return a mock unsubscribe function for the profile
      return jest.fn();
    });

    onSnapshotCallback = jest.fn().mockImplementation((docSnap) => {
      // Default implementation can be empty or simulate a specific scenario
    });

    doc.mockImplementation((firestore, collection, uid) => ({
      _path: `${collection}/${uid}`,
    }));
  });

  /**
   * @description Verifies that the AuthProvider does not render its children while in the initial loading state.
   */
  it('should be in a loading state initially and not render children', () => {
    render(
      <AuthProvider>
        <div data-testid="child">Child Content</div>
      </AuthProvider>
    );
    // Children are not rendered while loading
    expect(screen.queryByTestId('child')).not.toBeInTheDocument();
  });

  /**
   * @description Verifies that the currentUser is correctly set with merged data from both authentication and Firestore when a user signs in and their profile document exists.
   */
  it('should set current user when user is authenticated and firestore doc exists', async () => {
    const mockUser = { uid: '123', email: 'test@example.com' };

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    // Simulate user signing in
    await act(async () => onAuthStateChangedCallback(mockUser));

    // Simulate firestore returning the user's profile
    await act(async () =>
      onSnapshotCallback({
        /**
         * @description Mocks the existence of a Firestore document.
         * @returns {boolean} Always returns true to simulate an existing document.
         */
        exists: () => true,
        /**
         * @description Mocks the data of a Firestore document.
         * @returns {object} An object containing mock document data.
         */
        data: () => ({ role: 'admin', extraData: 'test' }),
      })
    );

    // Check if firestore was queried
    expect(doc).toHaveBeenCalledWith(expect.anything(), 'users', '123');
    expect(onSnapshot).toHaveBeenCalled();

    // Check if user data is correctly set and displayed
    const expectedUser = { ...mockUser, role: 'admin', extraData: 'test' };
    await waitFor(() => {
      expect(screen.getByTestId('current-user')).toHaveTextContent(JSON.stringify(expectedUser));
    });
  });

  /**
   * @description Verifies that the currentUser is set using only authentication data if the corresponding Firestore document does not exist.
   */
  it('should set current user from auth if firestore doc does not exist', async () => {
    const mockUser = { uid: '123', email: 'test@example.com' };
    console.log = jest.fn(); // Mock console.log

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await act(async () => onAuthStateChangedCallback(mockUser));

    // Simulate firestore returning a non-existent doc
    await act(async () =>
      onSnapshotCallback({
        /**
         * @description Mocks the existence of a Firestore document.
         * @returns {boolean} Always returns false to simulate a non-existing document.
         */
        exists: () => false,
      })
    );

    expect(console.log).toHaveBeenCalledWith("User document doesn't exist yet. Listening for creation...");
    await waitFor(() => {
      expect(screen.getByTestId('current-user')).toHaveTextContent(JSON.stringify(mockUser));
    });
  });

  /**
   * @description Verifies that the currentUser is set to null when a user signs out.
   */
  it('should set current user to null when user is signed out', async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    // Simulate user signing out
    await act(async () => onAuthStateChangedCallback(null));

    await waitFor(() => {
      expect(screen.getByTestId('current-user')).toHaveTextContent('No User');
    });
  });

  /**
   * @description Verifies that the `signOut` function is called when the logout button is clicked by a signed-in user.
   */
  it('should call signOut when logout is invoked', async () => {
    const mockUser = { uid: '123', email: 'test@example.com' };
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    // First, sign in a user
    await act(async () => onAuthStateChangedCallback(mockUser));

    // Simulate firestore returning the user's profile to complete loading
    await act(async () =>
      onSnapshotCallback({
        /**
         * @description Mocks the existence of a Firestore document.
         * @returns {boolean} Always returns true to simulate an existing document.
         */
        exists: () => true,
        /**
         * @description Mocks the data of a Firestore document.
         * @returns {object} An object containing mock document data.
         */
        data: () => ({ role: 'admin', extraData: 'test' }),
      })
    );

    // Then, click the logout button. fireEvent.click is already wrapped in act.
    fireEvent.click(screen.getByTestId('logout-button'));

    expect(signOut).toHaveBeenCalledTimes(1);
  });

  /**
   * @description Verifies that the onAuthStateChanged listener is properly unsubscribed when the AuthProvider component unmount.
   */
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
