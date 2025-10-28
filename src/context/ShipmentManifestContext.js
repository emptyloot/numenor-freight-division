import React, { createContext, useContext, useState } from 'react';

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
  const [manifest, setManifest] = useState({
    port: [DEFAULT_PORT, DEFAULT_PORT],
    cargo: [DEFAULT_CARGO_ITEM, DEFAULT_CARGO_ITEM, DEFAULT_CARGO_ITEM, DEFAULT_CARGO_ITEM],
  });

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

  const manifestState = {
    manifest,
    setManifest,
    updatePortField,
    updateCargoField,
  };

  return <ManifestContext.Provider value={manifestState}>{children}</ManifestContext.Provider>;
};
