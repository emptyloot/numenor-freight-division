import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { firestore } from '../firebase/firebase';
import { useAuth } from './AuthContext';

const DashboardContext = createContext();

/**
 * @description Custom hook to use the DashboardContext.
 * @returns {object} The context value for the dashboard.
 */
export const useDashboard = () => {
  return useContext(DashboardContext);
};

/**
 * @description Provides dashboard-related data, such as user shipments. It fetches and listens for
 *              real-time updates on the user's shipments from Firestore.
 * @param {object} root0 - The props object.
 * @param {React.ReactNode} root0.children - The child components to be rendered within the provider.
 * @returns {object} A DashboardContext.Provider component that supplies shipment data to its children.
 */
export const DashboardProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * @description Sets up a real-time listener for the current user's shipments in Firestore.
   *              It fetches the destination, last update timestamp, and current status for each shipment.
   *              If a shipment's status is null or undefined, it defaults to 'Scheduled'.
   *              The listener is cleaned up on component unmount or when the user changes.
   */
  useEffect(() => {
    if (!currentUser) {
      setShipments([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const shipmentsRef = collection(firestore, 'shipments');
    const q = query(shipmentsRef, where('userId', '==', currentUser.uid));

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const userShipments = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            destination: `North:${data.port[1].north} East:${data.port[1].east}`,
            lastUpdated: data.createdAt?.toDate(), // Convert Firestore Timestamp to JS Date
            currentStatus: data.status, // Default to 'Scheduled' if status is null/undefined
          };
        });
        setShipments(userShipments);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching shipments:', err);
        setError(err);
        setLoading(false);
      }
    );

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [currentUser]);

  const value = {
    shipments,
    loading,
    error,
  };

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
};
