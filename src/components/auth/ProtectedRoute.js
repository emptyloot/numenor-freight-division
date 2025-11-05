import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * @description A component that guards a route, allowing access only to authenticated users.
 * If the user is not authenticated, they are redirected to the homepage.
 * @param {object} props The component's properties.
 * @param {React.ReactNode} props.children The component to render if the user is authenticated.
 * @returns {React.ReactElement} The protected component or a redirect.
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    // If user is not authenticated, redirect them to the homepage.
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
