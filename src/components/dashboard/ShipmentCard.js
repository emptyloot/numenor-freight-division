import React from 'react';

/**
 * @description A component that displays a single shipment's details on a card.
 * @param {object} props - The component props.
 * @param {object} props.shipment - The shipment object to display.
 * @returns {object} {JSX.Element} The rendered shipment card.
 */
const ShipmentCard = ({ shipment }) => {
  return (
    <div key={shipment.id} className="bg-white rounded-lg shadow-md p-4 text-gray-800">
      <h2 className="text-lg font-bold mb-2">Shipment to {shipment.destination || 'N/A'}</h2>
      <p>
        <span className="font-semibold">Status:</span> {shipment.currentStatus}
      </p>
      <p>
        <span className="font-semibold">Last Updated:</span>{' '}
        {shipment.lastUpdated ? shipment.lastUpdated.toLocaleString() : 'N/A'}
      </p>
    </div>
  );
};

export default ShipmentCard;
