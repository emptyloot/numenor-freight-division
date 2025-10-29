import React from 'react';
import { AuthProvider } from './AuthContext';
import { DashboardProvider } from './DashboardContext';
import { ManifestProvider } from './ShipmentManifestContext';

const contextProviders = [AuthProvider, DashboardProvider, ManifestProvider];

/**
 * @description A component that composes multiple context providers into a single provider.
 *              This helps to avoid deeply nested providers in the main application file.
 * @param {object} root0 - The props object.
 * @param {React.ReactNode} root0.children - The child components to be rendered within the provider.
 * @returns {object} {JSX.Element} The composed context providers wrapping the children.
 */
export const ContextProvider = ({ children }) => {
  return contextProviders.reduceRight((accumulator, Provider) => {
    return <Provider>{accumulator}</Provider>;
  }, children);
};
