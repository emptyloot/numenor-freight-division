import React from 'react';
import { Link } from 'react-router-dom';

/**
 * @description A component that displays a single shipment's details on a card.
 * @param {object} props - The component props.
 * @param {object} props.shipment - The shipment object to display.
 * @returns {object} {JSX.Element} The rendered shipment card.
 */
const ShipmentCard = ({ shipment }) => {
  return (
    <Link to={`/shipment/${shipment.id}`} className="block hover:bg-gray-700 rounded-lg">
      <div className="bg-white rounded-lg shadow-md p-4 text-gray-800 h-full">
        <h2 className="text-lg font-bold mb-2">Shipment ID: {shipment.id}</h2>
        <p className="truncate">
          <span className="font-semibold">Destination:</span> {shipment.destination || 'N/A'}
        </p>
        <p>
          <span className="font-semibold">Status:</span> {shipment.currentStatus}
        </p>
        <p>
          <span className="font-semibold">Last Updated:</span>{' '}
          {shipment.lastUpdated ? shipment.lastUpdated.toLocaleString() : 'N/A'}
        </p>
      </div>
    </Link>
  );
};

export default ShipmentCard;
