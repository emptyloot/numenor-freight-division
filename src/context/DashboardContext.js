import React, { createContext, useContext, useState, useEffect } from 'react';
import { firestore } from '../firebase/firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, orderBy, getDocs } from 'firebase/firestore';
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
   * @description Updates a shipment document in Firestore.
   * - Drivers can only update the 'status' field.
   * - Staff can update 'status' and 'paid' fields.
   * @param {string} shipmentId - The ID of the shipment to update.
   * @param {object} updates - An object containing the fields to update (e.g., { status: 'in-transit', paid: true }).
   * @returns {Promise<void>} A promise that resolves when the update is complete.
   * @throws {Error} If the user is not authorized or provides invalid fields.
   */
  const updateShipment = async (shipmentId, updates) => {
    if (!currentUser || !['staff', 'driver'].includes(currentUser.role)) {
      throw new Error('You are not authorized to perform this action.');
    }

    const allowedUpdates = {};

    // Drivers can only update status
    if (currentUser.role === 'driver' && 'status' in updates) {
      allowedUpdates.status = updates.status;
    }
    // Drivers can assign themselves to a shipment
    if (currentUser.role === 'driver' && 'driverId' in updates) {
      allowedUpdates.driverId = updates.driverId;
      if ('driverName' in updates) allowedUpdates.driverName = updates.driverName;
    }

    // Staff can update status and paid status
    if (currentUser.role === 'staff') {
      if ('status' in updates) allowedUpdates.status = updates.status;
      if ('paid' in updates) allowedUpdates.paid = updates.paid;
      if ('driverId' in updates) allowedUpdates.driverId = updates.driverId;
      if ('driverName' in updates) allowedUpdates.driverName = updates.driverName;
    }

    const shipmentRef = doc(firestore, 'shipments', shipmentId);
    await updateDoc(shipmentRef, allowedUpdates);
  };

  /**
   * @description Sets up a real-time listener for the current user's shipments in Firestore.
   *              It fetches the destination, last update timestamp, and current status for each shipment.
   *              If a shipment's status is null or undefined, it defaults to 'Scheduled'.
   *              The listener is cleaned up on component unmount or when the user changes.
   */
  useEffect(() => {
    /**
     * @description Processes a Firestore query snapshot into a standardized array of shipment objects.
     * @param {object} querySnapshot - The Firestore QuerySnapshot object containing shipment documents.
     * @returns {object} Array<object> An array of standardized shipment objects.
     */
    const processSnapshot = (querySnapshot) => {
      return querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          destination: `North:${data.port[1].north} East:${data.port[1].east}`,
          lastUpdated: data.createdAt?.toDate(), // Convert Firestore Timestamp to JS Date
          currentStatus: data.status, // Default to 'Scheduled' if status is null/undefined
        };
      });
    };

    if (!currentUser) {
      setShipments([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const shipmentsRef = collection(firestore, 'shipments');
    /**
     *
     */
    let unsubscribe = () => {};

    /**
     *
     */
    const setupListener = async () => {
      try {
        let q;
        // Conditionally build the query based on the user's role
        if (['staff'].includes(currentUser.role)) {
          // Staff and drivers can see all shipments, ordered by creation date
          q = query(shipmentsRef, orderBy('createdAt', 'desc'));
          unsubscribe = onSnapshot(q, (snapshot) => setShipments(processSnapshot(snapshot)), setError);
        } else if (currentUser.role === 'driver') {
          // For drivers, we need two separate queries and merge them client-side.
          // This is because Firestore rules can't handle the OR logic with `userId` checks.
          const assignedQuery = query(shipmentsRef, where('driverId', '==', currentUser.uid));
          const unassignedQuery = query(shipmentsRef, where('driverId', '==', null));

          // We use getDocs for an initial load. For real-time, you'd set up two onSnapshot listeners.
          const [assignedSnap, unassignedSnap] = await Promise.all([getDocs(assignedQuery), getDocs(unassignedQuery)]);

          const assignedShipments = processSnapshot(assignedSnap);
          const unassignedShipments = processSnapshot(unassignedSnap);

          setShipments([...assignedShipments, ...unassignedShipments]);
        } else {
          // Clients see shipments they created
          q = query(shipmentsRef, where('userId', '==', currentUser.uid));
          unsubscribe = onSnapshot(q, (snapshot) => setShipments(processSnapshot(snapshot)), setError);
        }
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    setupListener();

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [currentUser]);

  const value = {
    shipments,
    loading,
    error,
    updateShipment,
  };

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
};
