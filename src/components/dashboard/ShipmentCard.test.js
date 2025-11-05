import React from 'react';
import { render, screen } from '@testing-library/react';
import ShipmentCard from './ShipmentCard';
import { MemoryRouter } from 'react-router-dom';

/**
 * @description Test suite for the ShipmentCard component.
 */
describe('ShipmentCard', () => {
  /**
   * @description Verifies that the card renders all shipment details correctly when the data is complete.
   */
  test('renders shipment details correctly when all data is provided', () => {
    const mockShipment = {
      id: 'ship123',
      destination: 'Port Test',
      currentStatus: 'Scheduled',
      lastUpdated: new Date('2023-10-27T10:00:00Z'),
    };

    render(
      <MemoryRouter>
        <ShipmentCard shipment={mockShipment} />
      </MemoryRouter>
    );

    expect(screen.getByText(/Shipment ID: ship123/i)).toBeInTheDocument();
    expect(screen.getByText(/Destination:/i)).toBeInTheDocument();
    expect(screen.getByText(/Status:/i)).toBeInTheDocument();
    expect(screen.getByText(/Scheduled/i)).toBeInTheDocument();
    expect(screen.getByText(/Last Updated:/i)).toBeInTheDocument();
    expect(screen.getByText(mockShipment.lastUpdated.toLocaleString())).toBeInTheDocument();
  });

  /**
   * @description Verifies that the card displays fallback text ('N/A') for fields with missing data.
   */
  test('renders fallback text when destination and lastUpdated are missing', () => {
    const mockShipment = {
      id: 'ship456',
      currentStatus: 'Pending',
      destination: null,
      lastUpdated: null,
    };

    render(
      <MemoryRouter>
        <ShipmentCard shipment={mockShipment} />
      </MemoryRouter>
    );

    expect(screen.getByText(/Shipment ID: ship456/i)).toBeInTheDocument();
    expect(screen.getByText(/Destination:/i)).toBeInTheDocument();
    expect(screen.getByText(/Status:/i)).toBeInTheDocument();
    expect(screen.getByText(/Pending/i)).toBeInTheDocument();
    expect(screen.getByText(/Last Updated:/i)).toBeInTheDocument();
    // There are two "N/A" texts, one for destination in the h2 and one for the date.
    // We select the one that is not inside an h2 element.
    const lastUpdatedValue = screen.getAllByText('N/A').find((el) => el.tagName !== 'H2');
    expect(lastUpdatedValue).toBeInTheDocument();
  });
});
