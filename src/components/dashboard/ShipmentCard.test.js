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
      port: [{}, { north: 100, east: 200 }],
      status: 'Scheduled',
      createdAt: {
        /**
         * @description Mocks the Firestore Timestamp `toDate` method.
         * Returns a fixed JavaScript Date object to ensure consistent test results.
         * @returns {Date} A standard JavaScript Date representing 2023-10-27T10:00:00Z.
         */
        toDate: () => new Date('2023-10-27T10:00:00Z'),
      },
    };

    render(
      <MemoryRouter>
        <ShipmentCard shipment={mockShipment} />
      </MemoryRouter>
    );

    expect(screen.getByText(/Shipment ID: ship123/i)).toBeInTheDocument();
    expect(screen.getByText(/Destination:/i)).toBeInTheDocument();
    expect(screen.getByText(/North:100 East:200/i)).toBeInTheDocument();
    expect(screen.getByText(/Status:/i)).toBeInTheDocument();
    expect(screen.getByText(/Scheduled/i)).toBeInTheDocument();
    expect(screen.getByText(/Created:/i)).toBeInTheDocument();
    expect(screen.getByText(mockShipment.createdAt.toDate().toLocaleString())).toBeInTheDocument();
  });

  /**
   * @description Verifies that the card displays fallback text ('N/A') for fields with missing data.
   */
  test('renders fallback text when shipment data is missing', () => {
    const mockShipment = {
      id: 'ship456',
      // No port, status, or createdAt to test fall backs
    };

    render(
      <MemoryRouter>
        <ShipmentCard shipment={mockShipment} />
      </MemoryRouter>
    );

    expect(screen.getByText(/Shipment ID: ship456/i)).toBeInTheDocument();
    expect(screen.getByText(/Destination:/i)).toBeInTheDocument();
    expect(screen.getByText(/Status:/i)).toBeInTheDocument();
    expect(screen.getByText(/Scheduled/i)).toBeInTheDocument(); // Fallback status
    expect(screen.getByText(/Created:/i)).toBeInTheDocument();

    // Assert that both destination and created at fields show 'N/A'
    const allNAs = screen.getAllByText('N/A');
    expect(allNAs).toHaveLength(2);
  });
});
