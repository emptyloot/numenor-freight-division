import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LocationInput from './InputLocation';

// Mock the useManifest hook
const mockUpdatePortField = jest.fn();
const mockManifest = {
  port: [
    { name: 'Initial Origin', north: 100, east: 200 },
    { name: 'Initial Destination', north: 300, east: 400 },
  ],
};
jest.mock('../../context/ShipmentManifestContext', () => ({
  /**
   * @description Mocks the useManifest hook to provide a controlled context for testing.
   * @returns { object } An object containing the mocked `updatePortField` function and `manifest` state.
   */
  useManifest: () => ({
    manifest: mockManifest,
    updatePortField: mockUpdatePortField,
  }),
}));

// Mock the useClaims hook
const mockFindClaimByName = jest.fn();
const mockGetClaimLocation = jest.fn();
jest.mock('../../context/ClaimContext', () => ({
  /**
   * @description Mocks the useClaims hook to provide a controlled context for testing.
   * @returns { object } An object containing the mocked `findClaimByName` and `getClaimLocation` functions.
   */
  useClaims: () => ({
    findClaimByName: mockFindClaimByName,
    getClaimLocation: mockGetClaimLocation,
  }),
}));

describe('LocationInput Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset manifest mock for each test if needed, though for this component,
    // we're primarily testing its interaction with updatePortField.
    // The mockManifest above serves as a default starting point.

    // Default mock for useClaims
    mockFindClaimByName.mockReturnValue([]);
    mockGetClaimLocation.mockReturnValue(null);
  });

  test('renders correctly with initial values for origin port', () => {
    render(<LocationInput baseId="origin" label="Port of Origin" portIndex={0} />);

    expect(screen.getByLabelText(/Port of Origin:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Search by Settlement Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/North \(N\)/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/East \(E\)/i)).toBeInTheDocument();

    // Check initial values from mockManifest
    expect(screen.getByLabelText(/Search by Settlement Name/i)).toHaveValue(''); // Search input starts empty
    expect(screen.getByLabelText(/North \(N\)/i)).toHaveValue(100);
    expect(screen.getByLabelText(/East \(E\)/i)).toHaveValue(200);
  });

  test('renders correctly with initial values for destination port', () => {
    render(<LocationInput baseId="destination" label="Final Destination" portIndex={1} />);

    expect(screen.getByLabelText(/Final Destination:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/North \(N\)/i)).toHaveValue(300);
    expect(screen.getByLabelText(/East \(E\)/i)).toHaveValue(400);
  });

  test('calls updatePortField when North coordinate changes', () => {
    render(<LocationInput baseId="origin" label="Port of Origin" portIndex={0} />);
    const northInput = screen.getByLabelText(/North \(N\)/i);

    fireEvent.change(northInput, { target: { value: '150' } });
    expect(mockUpdatePortField).toHaveBeenCalledWith(0, 'north', 150);
  });

  test('calls updatePortField when East coordinate changes', () => {
    render(<LocationInput baseId="origin" label="Port of Origin" portIndex={0} />);
    const eastInput = screen.getByLabelText(/East \(E\)/i);

    fireEvent.change(eastInput, { target: { value: '250' } });
    expect(mockUpdatePortField).toHaveBeenCalledWith(0, 'east', 250);
  });

  test('calls findClaimByName and displays search results when typing in search input', async () => {
    const mockClaims = [
      { name: 'Armenelos', locationX: 300, locationZ: 600 },
      { name: 'Bits', locationX: 100, locationZ: 200 },
    ];
    mockFindClaimByName.mockReturnValue(mockClaims);

    render(<LocationInput baseId="origin" label="Port of Origin" portIndex={0} />);
    const searchInput = screen.getByLabelText(/Search by Settlement Name/i);

    await userEvent.type(searchInput, 'Bits');

    expect(mockFindClaimByName).toHaveBeenCalledWith('Bits');
    // Assert that both search results are displayed
    expect(await screen.findByText('Armenelos')).toBeInTheDocument();
    expect(await screen.findByText('Bits')).toBeInTheDocument();
  });

  test('selects a search result and updates port fields', async () => {
    const mockClaim = { name: 'Armenelos', locationX: 300, locationZ: 600 };
    const mockLocation = { name: 'Armenelos', north: 200, east: 100 }; // Scaled values
    mockFindClaimByName.mockReturnValue([mockClaim]);
    mockGetClaimLocation.mockReturnValue(mockLocation);

    render(<LocationInput baseId="origin" label="Port of Origin" portIndex={0} />);
    const searchInput = screen.getByLabelText(/Search by Settlement Name/i);

    await userEvent.type(searchInput, 'Armenelos');
    await screen.findByText('Armenelos');

    fireEvent.click(screen.getByText('Armenelos'));

    expect(mockGetClaimLocation).toHaveBeenCalledWith(mockClaim);
    expect(mockUpdatePortField).toHaveBeenCalledWith(0, 'name', mockLocation.name);
    expect(mockUpdatePortField).toHaveBeenCalledWith(0, 'north', mockLocation.north);
    expect(mockUpdatePortField).toHaveBeenCalledWith(0, 'east', mockLocation.east);

    // Verify search input is updated and results are cleared
    expect(searchInput).toHaveValue('Armenelos');
    expect(screen.queryByText('Armenelos')).not.toBeInTheDocument(); // Search results list should be gone
    expect(screen.getByText('✓')).toBeInTheDocument(); // Matched indicator
  });

  test('clears search results and matched indicator when search input is emptied', async () => {
    const mockClaim = { name: 'Armenelos', locationX: 300, locationZ: 600 };
    const mockLocation = { name: 'Armenelos', north: 200, east: 100 };
    mockFindClaimByName.mockReturnValue([mockClaim]);
    mockGetClaimLocation.mockReturnValue(mockLocation);

    render(<LocationInput baseId="origin" label="Port of Origin" portIndex={0} />);
    const searchInput = screen.getByLabelText(/Search by Settlement Name/i);

    // Simulate typing and selecting a result
    await userEvent.type(searchInput, 'Armenelos');
    await screen.findByText('Armenelos');
    fireEvent.click(screen.getByText('Armenelos'));
    await screen.findByText('✓');

    // Simulate clearing the input
    await userEvent.clear(searchInput);

    expect(searchInput).toHaveValue('');
    expect(screen.queryByText('✓')).not.toBeInTheDocument();
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument(); // eslint-disable-line
  });
});
