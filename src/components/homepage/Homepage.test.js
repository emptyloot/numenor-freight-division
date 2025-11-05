/**
 * @description Unit tests for the Homepage component.
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom'; // Import MemoryRouter and useNavigate
import Homepage from './Homepage'; // Import the component to test
import Calculator from '../../utils/Calculator'; // Import the function to mock
import { useAuth } from '../../context/AuthContext';
import { useManifest } from '../../context/ShipmentManifestContext';
import { useClaims } from '../../context/ClaimContext';

// --- Mock Dependencies ---

// 1. Mock the Calculator utility function
jest.mock('../../utils/Calculator');

// 2. Mock the useNavigate hook from react-router-dom
const mockNavigate = jest.fn(); // Create a mock function
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'), // Keep original router functionalities
  /**
@description Mocks navigation
@returns {void}
   */
  useNavigate: () => mockNavigate, // Replace useNavigate with our mock
}));

// 3. Mock the useAuth hook
jest.mock('../../context/AuthContext');
jest.mock('../../context/ShipmentManifestContext');
jest.mock('../../context/ClaimContext');

// 4. Mock the LoginButton component
jest.mock('../auth/LoginButton.js', () => ({ children }) => <button>{children || 'Login to Schedule'}</button>);

// --- Test Suite ---

describe('Homepage Component', () => {
  // Clear mocks before each test to ensure isolation
  beforeEach(() => {
    jest.clearAllMocks();
    // Set a default return value for the mocked calculator
    Calculator.mockReturnValue(0);
    // Set a default return value for the useAuth hook for tests outside the specific auth describe blocks
    useAuth.mockReturnValue({ currentUser: null });
    useManifest.mockReturnValue({
      manifest: {
        port: [
          { name: '', north: 0, east: 0 },
          { name: '', north: 0, east: 0 },
        ],
        cargo: [
          { name: '', quantity: 0 },
          { name: '', quantity: 0 },
          { name: '', quantity: 0 },
          { name: '', quantity: 0 },
        ],
      },
      updatePortField: jest.fn(),
    });
    useClaims.mockReturnValue({
      findClaimByName: jest.fn(),
      getClaimLocation: jest.fn(),
    });
  });

  test('renders main elements correctly', () => {
    render(
      <MemoryRouter>
        <Homepage />
      </MemoryRouter>
    );

    // Check headings
    expect(
      screen.getByRole('heading', { name: /"By land or sea, the world turns on our trade"/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /"Instant Quote Calculator"/i })).toBeInTheDocument();

    // Check input labels
    expect(screen.getByLabelText(/Port of Origin:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Final Destination:/i)).toBeInTheDocument();

    // Check initial quote display
    expect(screen.getByText(/--- Hex/i)).toBeInTheDocument();

    // Check steps section (simple check for one step)
    expect(screen.getByText(/Getting your coordinates:/i)).toBeInTheDocument();
  });

  /**
   * @description Tests for when a user is authenticated.
   */
  describe('when user is authenticated', () => {
    beforeEach(() => {
      useAuth.mockReturnValue({ currentUser: { uid: 'test-user' } });
    });

    test('shows "Schedule This Delivery" button and not login button', () => {
      render(
        <MemoryRouter>
          <Homepage />
        </MemoryRouter>
      );
      expect(screen.getByRole('button', { name: /Schedule This Delivery/i })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Login to Schedule/i })).not.toBeInTheDocument();
    });

    test('calls navigate when schedule button is clicked', async () => {
      render(
        <MemoryRouter>
          <Homepage />
        </MemoryRouter>
      );
      const scheduleButton = screen.getByRole('button', { name: /Schedule This Delivery/i });
      await userEvent.click(scheduleButton);
      expect(mockNavigate).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith('/schedule');
    });
  });

  /**
   * @description Tests for when a user is not authenticated.
   */
  describe('when user is not authenticated', () => {
    beforeEach(() => {
      useAuth.mockReturnValue({ currentUser: null });
    });

    test('shows "Login to Schedule" button and not schedule button', () => {
      render(
        <MemoryRouter>
          <Homepage />
        </MemoryRouter>
      );
      expect(screen.getByRole('button', { name: /Login to Schedule/i })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Schedule This Delivery/i })).not.toBeInTheDocument();
    });
  });
});
