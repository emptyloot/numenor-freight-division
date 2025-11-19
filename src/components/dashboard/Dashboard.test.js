import React from 'react';
import { render, screen } from '@testing-library/react';
import Dashboard from './Dashboard';
import { useDashboard } from '../../context/DashboardContext';
import '../../firebase/firebase';

// Mock the useDashboard hook from the context
jest.mock('../../context/DashboardContext');
jest.mock('../../firebase/firebase');

// Mock the ShipmentCard component to simplify testing and focus on the Dashboard logic
jest.mock('./ShipmentCard', () => ({ shipment }) => (
  <div data-testid="shipment-card">Shipment to {shipment.destination}</div>
));

/**
 * @description Test suite for the Dashboard component.
 */
describe('Dashboard', () => {
  /**
   * @description Verifies that the loading message is displayed when the component is in a loading state.
   */
  test('displays loading message when loading', () => {
    useDashboard.mockReturnValue({
      shipments: [],
      loading: true,
      error: null,
    });

    render(<Dashboard />);
    expect(screen.getByText(/Loading shipments.../i)).toBeInTheDocument();
  });

  /**
   * @description Verifies that an error message is displayed when an error has occurred.
   */
  test('displays error message when there is an error', () => {
    const errorMessage = 'Failed to fetch';
    useDashboard.mockReturnValue({
      shipments: [],
      loading: false,
      error: { message: errorMessage },
    });

    render(<Dashboard />);
    expect(screen.getByText(`Error fetching shipments: ${errorMessage}`)).toBeInTheDocument();
  });

  /**
   * @description Verifies that a "no shipments" message is shown when the user has no shipments.
   */
  test('displays "no shipments" message when there are no shipments', () => {
    useDashboard.mockReturnValue({
      shipments: [],
      loading: false,
      error: null,
    });

    render(<Dashboard />);
    expect(screen.getByText(/You have no shipments./i)).toBeInTheDocument();
  });

  /**
   * @description Verifies that shipment cards are rendered correctly when shipment data is available.
   */
  test('renders shipment cards when shipments are available', () => {
    const mockShipments = [
      { id: '1', destination: 'Port A', currentStatus: 'In Transit', lastUpdated: new Date() },
      { id: '2', destination: 'Port B', currentStatus: 'Delivered', lastUpdated: new Date() },
    ];
    useDashboard.mockReturnValue({
      shipments: mockShipments,
      loading: false,
      error: null,
    });

    render(<Dashboard />);

    expect(screen.getByText(/My Shipments/i)).toBeInTheDocument();
    const shipmentCards = screen.getAllByTestId('shipment-card');
    expect(shipmentCards).toHaveLength(2);
    expect(screen.getByText(/Shipment to Port A/i)).toBeInTheDocument();
    expect(screen.getByText(/Shipment to Port B/i)).toBeInTheDocument();
  });
});
