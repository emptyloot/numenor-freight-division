import { createContext, useState, useContext } from 'react';

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

  const value = {
    isAuthenticated,
    setIsAuthenticated,
    user,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Custom hook to access the authentication context.
 * @returns {AuthContext} The authentication context value.
 */
export function useAuth() {
  return useContext(AuthContext);
}
