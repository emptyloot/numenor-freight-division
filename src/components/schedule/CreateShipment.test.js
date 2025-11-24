import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CreateShipment from './CreateShipment';
import { useAuth } from '../../context/AuthContext';
import { useClaims } from '../../context/ClaimContext';
import { useCargo } from '../../context/CargoContext';

// Mock the useNavigate hook from react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  /**
   * @description Mocks the `useNavigate` hook from `react-router-dom` to return a mock navigation function.
   * @returns {object} A mock function that records navigation calls.
   */
  useNavigate: () => mockNavigate,
}));

// Mock the firebase module to prevent it from initializing Firebase services
jest.mock('../../firebase/firebase');

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
        { name: 'Test Cargo 5', quantity: '40' },
        { name: 'Test Cargo 6', quantity: '40' },
        { name: 'Test Cargo 7', quantity: '40' },
        { name: 'Test Cargo 8', quantity: '40' },
        { name: 'Test Cargo 9', quantity: '40' },
        { name: 'Test Cargo 10', quantity: '40' },
      ],
    },
  }),
}));

// Mock the useAuth hook
jest.mock('../../context/AuthContext');
jest.mock('../../context/ClaimContext');
jest.mock('../../context/CargoContext');
jest.mock('../inputLocation/InputLocation', () => () => <div data-testid="input-location-mock" />);

/**
 * @description Test suite for the CreateShipment component.
 */
describe('CreateShipment', () => {
  /**
   * @description Resets mocks before each test to ensure a clean state.
   */
  beforeEach(() => {
    mockHandleScheduleShipment.mockClear();
    mockNavigate.mockClear();
    useAuth.mockReturnValue({
      currentUser: { uid: 'test-uid', email: 'test@example.com' },
    });
    useClaims.mockReturnValue({
      findClaimByName: jest.fn(),
      getClaimLocation: jest.fn(),
    });
    useCargo.mockReturnValue({
      cargoTypes: [],
      findCargoByName: jest.fn(),
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  /**
   * @description Verifies that the form renders and that a successful submission calls the handleScheduleShipment function.
   */
  test('renders the form and navigates on successful submission', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <MemoryRouter>
        <CreateShipment />
      </MemoryRouter>
    );

    // Mock a successful shipment scheduling
    await fireEvent.submit(screen.getByRole('button', { name: /schedule shipment/i }));

    expect(mockHandleScheduleShipment).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });

  /**
   * @description Verifies that an error message is displayed to the user if the submission process fails.
   */
  test('displays an error message on submission failure', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <MemoryRouter>
        <CreateShipment />
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
