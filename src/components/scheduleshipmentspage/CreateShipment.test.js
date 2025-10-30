import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ManifestProvider } from '../../context/ShipmentManifestContext';
import CreateShipment from './CreateShipment';
import { useAuth } from '../../context/AuthContext';

// Mock the useManifest hook
const mockHandleScheduleShipment = jest.fn();
jest.mock('../../context/ShipmentManifestContext', () => ({
  ...jest.requireActual('../../context/ShipmentManifestContext'),
  /**
   * @description Mocks the useManifest hook to provide a controlled context for testing.
   * @returns { object } An object containing the mocked `handleScheduleShipment` function and `manifest` state.
   */
  useManifest: () => ({
    handleScheduleShipment: mockHandleScheduleShipment,
    manifest: {
      port: [
        { east: '', north: '', name: '' },
        { east: '', north: '', name: '' },
      ],
      cargo: [
        { name: 'Test Cargo', quantity: '10' },
        { name: 'Test Cargo 2', quantity: '20' },
        { name: 'Test Cargo 3', quantity: '30' },
        { name: 'Test Cargo 4', quantity: '40' },
      ],
    },
  }),
}));

// Mock the useAuth hook
jest.mock('../../context/AuthContext');

/**
 * @description Test suite for the CreateShipment component.
 */
describe('CreateShipment', () => {
  /**
   * @description Resets mocks before each test to ensure a clean state.
   */
  beforeEach(() => {
    mockHandleScheduleShipment.mockClear();
    useAuth.mockReturnValue({
      currentUser: { uid: 'test-uid', email: 'test@example.com' },
    });
  });

  /**
   * @description Verifies that the form renders and that a successful submission calls the handleScheduleShipment function.
   */
  test('renders the form and submits successfully', async () => {
    render(
      <MemoryRouter>
        <ManifestProvider>
          <CreateShipment />
        </ManifestProvider>
      </MemoryRouter>
    );

    // Mock a successful shipment scheduling
    await fireEvent.submit(screen.getByRole('button', { name: /schedule shipment/i }));

    expect(mockHandleScheduleShipment).toHaveBeenCalledTimes(1);
  });

  /**
   * @description Verifies that an error message is displayed to the user if the submission process fails.
   */
  test('displays an error message on submission failure', async () => {
    render(
      <MemoryRouter>
        <ManifestProvider>
          <CreateShipment />
        </ManifestProvider>
      </MemoryRouter>
    );

    // Mock a failed shipment scheduling
    const errorMessage = 'Test error';
    mockHandleScheduleShipment.mockRejectedValueOnce(new Error(errorMessage));

    await fireEvent.submit(screen.getByRole('button', { name: /schedule shipment/i }));

    expect(mockHandleScheduleShipment).toHaveBeenCalledTimes(1);
    expect(await screen.findByText(errorMessage)).toBeInTheDocument();
  });
});
