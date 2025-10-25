import { createContext, useState, useContext, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const auth = getAuth();

const AuthContext = createContext();

/**
 * Provides authentication context to its children components.
 * @param {object} children The component's properties.
 * @param {object} children.children - The child components to be wrapped by the provider.
 * @returns {object} A context provider wrapping the child
 */
export function AuthProvider({ children }) {
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
  }, []);

  const value = {
    isAuthenticated,
    setIsAuthenticated,
    user,
    setUser,
    isLoading,
    setIsLoading,
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
