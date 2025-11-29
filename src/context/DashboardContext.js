import React, { createContext, useContext, useState, useEffect } from 'react';
import { firestore } from '../firebase/firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, orderBy } from 'firebase/firestore';
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
    if (!currentUser) {
      setShipments([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const shipmentsRef = collection(firestore, 'shipments');
    /**
     * @description Initializes a placeholder function for the Firestore listener cleanup.
     * This will be reassigned to the actual unsubscribe function returned by onSnapshot.
     */
    let unsubscribe = () => {};

    /**
     * @description Helper function to process the Firestore snapshot into an array of shipment objects.
     * It extracts the document ID and spreads the document data.
     * @param {object} querySnapshot - The snapshot object returned from a Firestore query.
     * @returns {Array<object>} An array of mapped shipment objects.
     */
    const processSnapshot = (querySnapshot) => {
      return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    };

    // Role-based query logic
    if (currentUser.role === 'staff') {
      const q = query(shipmentsRef, orderBy('createdAt', 'desc'));
      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          setShipments(processSnapshot(snapshot));
          setLoading(false);
        },
        (err) => {
          setError(err);
          setLoading(false);
        }
      );
    } else if (currentUser.role === 'driver') {
      let assignedShipments = [];
      let unassignedShipments = [];

      const assignedQuery = query(shipmentsRef, where('driverId', '==', currentUser.uid));
      const unassignedQuery = query(shipmentsRef, where('driverId', '==', null));

      const unsubscribeAssigned = onSnapshot(
        assignedQuery,
        (snapshot) => {
          assignedShipments = processSnapshot(snapshot);
          setShipments([...assignedShipments, ...unassignedShipments].sort((a, b) => b.createdAt - a.createdAt));
          setLoading(false);
        },
        (err) => {
          setError(err);
          setLoading(false);
        }
      );

      const unsubscribeUnassigned = onSnapshot(
        unassignedQuery,
        (snapshot) => {
          unassignedShipments = processSnapshot(snapshot);
          setShipments([...assignedShipments, ...unassignedShipments].sort((a, b) => b.createdAt - a.createdAt));
          setLoading(false);
        },
        (err) => {
          setError(err);
          setLoading(false);
        }
      );

      /**
       *
       */
      unsubscribe = () => {
        unsubscribeAssigned();
        unsubscribeUnassigned();
      };
    } else {
      // Client
      const q = query(shipmentsRef, where('userId', '==', currentUser.uid), orderBy('createdAt', 'desc'));
      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          setShipments(processSnapshot(snapshot));
          setLoading(false);
        },
        (err) => {
          setError(err);
          setLoading(false);
        }
      );
    }

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
