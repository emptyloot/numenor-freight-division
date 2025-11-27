import React, { createContext, useContext, useState } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { firestore } from '../firebase/firebase';
import { useAuth } from './AuthContext';
import Calculator from '../utils/Calculator';
import { useCargo } from './CargoContext';

const ManifestContext = createContext(null);

/**
 * @description A custom React hook that provides direct access to the shipment manifestation form's global state and state setters.
 * This hook must be called within a component nested inside the ManifestProvider.
 * @returns {object} The manifest state object, typically including properties like `manifest`, `setManifest`, and potentially other global data used throughout the multi-step form workflow.
 */
export const useManifest = () => useContext(ManifestContext);

const DEFAULT_CARGO_ITEM = {
  name: '',
  quantity: 0,
};
const DEFAULT_PORT = {
  name: '',
  north: 0,
  east: 0,
};

/**
 * @description Provides a central, global context for managing the entire shipment manifestation form's state.
 * This allows all components involved in the multi-step form process (e.g., coordinate input, cargo entry, and the final submission component) to read and write data.
 * @param {object} root0 root0 The component's properties.
 * @param {object} root0.children root0.children The child components rendered within the provider.
 * @returns {object} (JSX.Element) A Context.Provider that supplies the 'manifest' state object and the 'setManifest' function.
 */
export const ManifestProvider = ({ children }) => {
  const INITIAL_MANIFEST_STATE = {
    port: [DEFAULT_PORT, DEFAULT_PORT],
    cargo: [DEFAULT_CARGO_ITEM],
  };

  const { currentUser } = useAuth();
  const { cargoTypes } = useCargo();
  const [manifest, setManifest] = useState(INITIAL_MANIFEST_STATE);

  /** @description Resets the manifest state to its initial default values. */
  const resetManifest = () => {
    setManifest(INITIAL_MANIFEST_STATE);
  };

  /**
   * @description Adds a new cargo item to the manifest.
   */
  const addCargoItem = () => {
    setManifest((prevManifest) => ({
      ...prevManifest,
      cargo: [...prevManifest.cargo, { ...DEFAULT_CARGO_ITEM }],
    }));
  };

  /**
   * @description Removes a cargo item from the manifest at a specific index.
   * @param {number} cargoIndex - The index of the cargo item to remove.
   */
  const removeCargoItem = (cargoIndex) => {
    setManifest((prevManifest) => ({
      ...prevManifest,
      cargo: prevManifest.cargo.filter((_, idx) => idx !== cargoIndex), //eslint-disable-line
    }));
  };

  /**
   * @description Updates an entire port object at a specific index in the manifest state.
   * This is useful when an external action (e.g., selecting from search results)
   * provides a complete port object that needs to replace the existing one.
   * @param {number} portIndex - The index of the port object to update (0 for origin, 1 for destination).
   * @param {object} port - The new port object to set.
   */
  const updatePort = (portIndex, port) => {
    setManifest((prevManifest) => {
      const newManifest = { ...prevManifest };
      newManifest.port[portIndex] = port;
      return newManifest;
    });
  };
  /**
   * Specialized function to immutably update a single field (name, east, or north)
   * within a specific port object (index 0 or 1) in the manifest state.
   * @param {number} portIndex - The index of the port object to update (0 for origin, 1 for destination).
   * @param {string} field - The key of the property to update ('name', 'east', or 'north').
   * @param {string|number} value - The new value for the property.
   */
  const updatePortField = (portIndex, field, value) => {
    // Use the functional form of setManifest for reliable updates
    setManifest((prevManifest) => {
      // 1. Create a shallow copy of the manifest object
      const newManifest = { ...prevManifest };

      // 2. Immutably update the target port within the port array
      const updatedPorts = newManifest.port.map((port, index) => {
        if (index === portIndex) {
          // Update the specific port object immutably
          return {
            ...port,
            [field]: value,
          };
        }
        return port; // Return all other ports unchanged
      });

      // 3. Assign the new ports array back to the manifest
      newManifest.port = updatedPorts;

      return newManifest;
    });
  };

  /**
   * Specialized function to immutably update a single field (name or quantity)
   * within a specific cargo object (index 0, 1, 2, or 3) in the manifest state.
   * @param {number} cargoIndex - The index of the cargo object to update 0-3.
   * @param {string} field - The key of the property to update ('name' or 'quantity').
   * @param {string|number} value - The new value for the property.
   */
  const updateCargoField = (cargoIndex, field, value) => {
    // Use the functional form of setManifest for reliable updates
    setManifest((prevManifest) => {
      // 1. Create a shallow copy of the manifest object
      const newManifest = { ...prevManifest };

      // 2. Immutably update the target cargo within the cargo array
      const updatedCargo = newManifest.cargo.map((cargo, index) => {
        if (index === cargoIndex) {
          // Update the specific cargo object immutably
          return {
            ...cargo,
            [field]: value,
          };
        }
        return cargo; // Return all other cargo unchanged
      });

      // 3. Assign the new cargo array back to the manifest
      newManifest.cargo = updatedCargo;

      return newManifest;
    });
  };

  /**
   * @description Validates the manifest and uploads it to Firestore as a new shipment document.
   * Throws an error if the manifest is incomplete or if there is no authenticated user.
   * @returns {Promise<string>} A promise that resolves with the new shipment document ID upon success.
   */
  const handleScheduleShipment = async () => {
    if (!currentUser) {
      throw new Error('You must be logged in to schedule a shipment.');
    }

    // 1. Validate manifest data
    const { port, cargo } = manifest;

    // Validate port coordinates
    if (port[0]?.north === 0 && port[0]?.east === 0) {
      throw new Error('Port of Origin coordinates cannot be (0, 0).');
    }
    if (port[1]?.north === 0 && port[1]?.east === 0) {
      throw new Error('Final Destination coordinates cannot be (0, 0).');
    }

    // Validate that origin and destination are not the same coordinates
    if (port[0]?.north === port[1]?.north && port[0]?.east === port[1]?.east) {
      throw new Error('Port of Origin and Final Destination cannot be the same coordinates.');
    }

    const hasCargo = cargo.some((item) => item.name && item.quantity > 0);
    if (!hasCargo) {
      throw new Error('At least one cargo item with a quantity greater than zero is required.');
    }

    // Validate that every cargo item with a quantity has a valid name
    const invalidCargo = cargo.find(
      (item) => Number(item.quantity) > 0 && !cargoTypes.some((t) => t.name === item.name)
    );

    if (invalidCargo) {
      throw new Error(
        `Invalid cargo name found: "${invalidCargo.name || '(empty)'}". Please select a valid cargo from the list.`
      );
    }

    const quote = Calculator(manifest).costEstimate;
    // 2. Prepare data for Firestore
    const shipmentData = {
      ...manifest,
      client: currentUser.global_name,
      userId: currentUser.uid,
      status: 'scheduled',
      quote: quote,
      paid: false, // Shipments are not paid by default
      driverId: null, // No driver assigned on creation
      createdAt: serverTimestamp(),
    };

    // 3. Upload to Firestore
    const shipmentsCollectionRef = collection(firestore, 'shipments');
    const docRef = await addDoc(shipmentsCollectionRef, shipmentData);
    resetManifest();
    return docRef.id;
  };

  const manifestState = {
    manifest,
    setManifest,
    updatePort,
    updatePortField,
    updateCargoField,
    resetManifest,
    handleScheduleShipment,
    addCargoItem,
    removeCargoItem,
  };

  return <ManifestContext.Provider value={manifestState}>{children}</ManifestContext.Provider>;
};
