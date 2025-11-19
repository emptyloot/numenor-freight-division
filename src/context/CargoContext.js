import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import normalizeString from '../utils/Helper';

const CargoContext = createContext(null);

/**
 * @description A custom hook to access the cargo context.
 * @returns {object} The cargo context with cargo data, loading and error states, and search functions.
 */
export const useCargo = () => useContext(CargoContext);

/**
 * @description Provides a context for fetching, caching, and searching cargo from an API.
 * @param {object} props The component's properties.
 * @param {React.ReactNode} props.children The child components to be rendered within the provider.
 * @returns {object} {JSX.Element} A Context.Provider that supplies cargo data and utility functions.
 */
export const CargoProvider = ({ children }) => {
  const [cargoTypes, setCargoTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    /**
     * @description Fetches the list of all cargo types from the API on component mount.
     */
    const fetchCargoTypes = async () => {
      try {
        setLoading(true);
        // This endpoint will need to be created in your backend.
        const response = await axios.get('/api/cargo');
        setCargoTypes(response.data.cargo);
      } catch (e) {
        setError(e);
        console.error('Failed to fetch cargo types:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchCargoTypes();
  }, []);

  const findCargoByName = useCallback(
    (name) => {
      if (!name || cargoTypes.length === 0) return [];
      return cargoTypes.filter((cargo) => normalizeString(cargo.name).includes(normalizeString(name.toLowerCase())));
    },
    [cargoTypes]
  );

  const value = { cargoTypes, loading, error, findCargoByName };

  return <CargoContext.Provider value={value}>{children}</CargoContext.Provider>;
};
