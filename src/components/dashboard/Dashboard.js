import React from 'react';
import { useDashboard } from '../../context/DashboardContext';
import ShipmentCard from './ShipmentCard';
import HelpChannel from '../about/HelpChannel';

/**
 * @description A component that displays the user's shipments in a grid of tiles.
 *              It shows a loading state while fetching data and an error message on failure.
 * @returns {object} {JSX.Element} The rendered dashboard page with shipment tiles.
 */
const Dashboard = () => {
  const { shipments, loading, error } = useDashboard();

  if (loading) {
    return <div className="text-center p-4">Loading shipments...</div>;
  }

  if (error) {
    return <div className="text-center p-4 text-red-500">Error fetching shipments: {error.message}</div>;
  }

  return (
    <main className="container mx-auto p-4 text-center text-off-white">
      <h1 className="text-2xl font-bold mb-4 text-left">My Shipments</h1>
      {shipments.length === 0 ? (
        <p>You have no shipments.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {shipments.map((shipment) => (
            <ShipmentCard key={shipment.id} shipment={shipment} />
          ))}
        </div>
      )}
      <div className="mt-12">
        <HelpChannel />
      </div>
    </main>
  );
};

export default Dashboard;
