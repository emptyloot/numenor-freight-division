import { createContext, useState, useContext, useEffect } from 'react';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth'; // Import signOut

const AuthContext = createContext();

/**
 * Provides authentication context to its children components.
 * @param {object} children The component's properties.
 * @param {object} children.children - The child components to be wrapped by the provider.
 * @returns {object} A context provider wrapping the child
 */
export function AuthProvider({ children }) {
  const auth = getAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        setIsAuthenticated(true);
        setIsLoading(false);
      } else {
        setUser(null);
        setIsAuthenticated(false);
        setIsLoading(false);
      }
    });
    return () => {
      unsubscribe();
    };
  }, [auth]);

  /**
   *
   */
  const logout = async () => {
    try {
      await signOut(auth);
      // The onAuthStateChanged listener will automatically update isAuthenticated and user state.
    } catch (error) {
      console.error('Error signing out:', error);
      // Optionally, you can add user-facing error feedback here
    }
  };

  const value = {
    isAuthenticated,
    user,
    isLoading,
    logout, // Expose the logout function
  };

  return <AuthContext.Provider value={value}>{!isLoading && children}</AuthContext.Provider>;
}

/**
 * Custom hook to access the authentication context.
 * @returns {AuthContext} The authentication context value.
 */
export function useAuth() {
  return useContext(AuthContext);
}
