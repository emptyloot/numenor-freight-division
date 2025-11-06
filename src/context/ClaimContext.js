import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const ClaimContext = createContext(null);

/**
 * @description A custom hook to access the claims context.
 * @returns {object} The claims context with claims data, loading and error states, and search functions.
 */
export const useClaims = () => useContext(ClaimContext);

// eslint-disable-next-line spellcheck/spell-checker
/**
 * @description Provides a context for fetching, caching, and searching claims from the bitjita.com API.
 * @param {object} props The component's properties.
 * @param {React.ReactNode} props.children The child components to be rendered within the provider.
 * @returns {object} {JSX.Element} A Context.Provider that supplies claims data and utility functions.
 */
export const ClaimProvider = ({ children }) => {
  const [claims, setClaims] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * @description Fetches the list of all claims from the API on component mount.
   */
  useEffect(() => {
    /**
     *
     */
    const fetchClaims = async () => {
      try {
        setLoading(true);
        // Fetch claims from your backend API
        const response = await axios.get('/api/claims');
        setClaims(response.data.claims);
        setCount(response.data.count);
      } catch (e) {
        setError(e);
        console.error('Failed to fetch claims:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchClaims();
  }, []);

  /**
   * @description Searches the locally stored claims list for a claim by its name.
   * The search is case-insensitive and looks for a partial match.
   * @param {string} name - The name of the claim to search for (can be a partial string)..
   * @returns {Array<object>} An array of claim objects that match the search term. Returns an empty array if no matches are found.
   */
  const findClaimByName = useCallback(
    (name) => {
      if (!name || claims.length === 0) {
        return [];
      }
      return claims.filter((claim) => claim.name.toLowerCase().includes(name.toLowerCase()));
    },
    [claims]
  );

  /**
   * @description Extracts location information from a given claim object.
   * @param {object} claim - The claim object returned from `findClaimByName`.
   * @returns {{north: number, east: number}|null} An object with north and east coordinates, or null if not found.
   */
  const getClaimLocation = useCallback((claim) => {
    if (!claim) {
      return null;
    }
    const { name, locationX, locationZ } = claim;

    if (locationX !== undefined && locationZ !== undefined && name !== undefined) {
      // Perform scaling conversion
      const scaledEast = Math.floor(locationX / 3);
      const scaledNorth = Math.floor(locationZ / 3);
      return { name: name, north: scaledNorth, east: scaledEast };
    }

    return null;
  }, []);

  const value = {
    claims,
    count,
    loading,
    error,
    findClaimByName,
    getClaimLocation,
  };

  return <ClaimContext.Provider value={value}>{children}</ClaimContext.Provider>;
};
