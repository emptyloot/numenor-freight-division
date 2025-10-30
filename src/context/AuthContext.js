import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, firestore } from '../firebase/firebase';

const AuthContext = createContext();

/**
 * @description Provides authentication context to its children components, managing user login state
 *              and providing methods for authentication actions like logout. It integrates with Firebase
 *              Authentication and Firestore to manage user sessions and profiles.
 * @returns {object} An AuthContext.Provider component that supplies authentication-related data
 *                   and functions to its descendant components.
 */
export const useAuth = () => {
  return useContext(AuthContext);
};

/**
 * @description AuthProvider component that manages user authentication state using Firebase.
 *              It provides the current user and a logout function to its children.
 * @param {object} root0 - The props object.
 * @param {React.ReactNode} root0.children - The child components to be rendered within the provider.
 * @returns {object} AuthContext.Provider with the current user and logout function.
 */
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /**
   * @description Signs out the current user from Firebase.
   */
  const logout = () => {
    signOut(auth);
  };

  /**
   * @description Subscribes to Firebase authentication state changes. When a user logs in,
   * it fetches their profile from Firestore and merges it with the auth data. When they
   * log out, it clears the user state. It also manages the initial loading state.
   * The subscription is automatically cleaned up on component unmount.
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is signed in, now fetch their profile from Firestore.
        const userRef = doc(firestore, 'users', user.uid); // eslint-disable-line
        const docSnap = await getDoc(userRef);

        if (docSnap.exists()) {
          setCurrentUser({ ...user, ...docSnap.data() });
        } else {
          // Handle case where user exists in Auth but not in Firestore
          console.error("User document doesn't exist in Firestore.");
          setCurrentUser(user);
        }
      } else {
        // User is signed out
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    isAuthenticated: !!currentUser,
    logout,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};
