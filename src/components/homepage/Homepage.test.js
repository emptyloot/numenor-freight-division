/**
 * @description Unit tests for the Homepage component.
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom'; // Import MemoryRouter and useNavigate

import Homepage from './Homepage'; // Import the component to test
import Calculator from '../../utils/Calculator'; // Import the function to mock

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

// --- Test Suite ---

describe('Homepage Component', () => {
  // Clear mocks before each test to ensure isolation
  beforeEach(() => {
    jest.clearAllMocks();
    // Set a default return value for the mocked calculator
    Calculator.mockReturnValue(0);
  });

  /**
   * @description Verifies that the main elements render correctly on initial load.
   */
  test('renders main elements correctly', () => {
    render(
      <MemoryRouter>
        {' '}
        {/* Needed because component uses useNavigate */}
        <Homepage />
      </MemoryRouter>
    );

    // Check headings
    expect(
      screen.getByRole('heading', { name: /"By land or sea, the world turns on our trade"/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /"Instant Quote Calculator"/i })).toBeInTheDocument();

    // Check input labels
    expect(screen.getByLabelText(/Enter TP Energy:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Enter Number of Tiles:/i)).toBeInTheDocument();

    // Check initial quote display
    expect(screen.getByText(/--- Hex/i)).toBeInTheDocument();

    // Check button
    expect(screen.getByRole('button', { name: /Schedule This Delivery/i })).toBeInTheDocument();

    // Check steps section (simple check for one step)
    expect(screen.getByText(/Step 1: Get an instant and transparent quote/i)).toBeInTheDocument();
  });

  /**
   * @description Verifies calculator input updates state and calls calculator function.
   */
  test('updates quote when user types in inputs', async () => {
    // Configure mock calculator to return a specific value for this test
    Calculator.mockReturnValue(7200);

    render(
      <MemoryRouter>
        <Homepage />
      </MemoryRouter>
    );

    // Get input fields by their labels
    const energyInput = screen.getByLabelText(/Enter TP Energy:/i);
    const tilesInput = screen.getByLabelText(/Enter Number of Tiles:/i);

    // Simulate user typing
    await userEvent.type(energyInput, '10');
    await userEvent.type(tilesInput, '12');

    // Verify inputs have the typed values
    expect(energyInput).toHaveValue(10);
    expect(tilesInput).toHaveValue(12);

    // Verify the mock Calculator function was called correctly
    // Note: It gets called multiple times due to useEffect, check the last call
    expect(Calculator).toHaveBeenLastCalledWith('10', '12'); // Inputs pass strings

    // Verify the quote display is updated with the mock return value
    expect(screen.getByText(/7,200 Hex/i)).toBeInTheDocument();
    expect(screen.queryByText(/--- Hex/i)).not.toBeInTheDocument();
  });

  /**
   * @description Verifies clicking the schedule button calls navigate.
   */
  test('calls navigate when schedule button is clicked', async () => {
    render(
      <MemoryRouter>
        <Homepage />
      </MemoryRouter>
    );

    // Find the button
    const scheduleButton = screen.getByRole('button', { name: /Schedule This Delivery/i });

    // Simulate click
    await userEvent.click(scheduleButton);

    // Verify the mock navigate function was called correctly
    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('/schedule');
  });
});
