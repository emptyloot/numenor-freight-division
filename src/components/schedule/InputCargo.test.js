import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import { useManifest } from '../../context/ShipmentManifestContext';
import { useCargo } from '../../context/CargoContext';
import InputCargo from './InputCargo';

// Mock the useManifest hook to control the context values
const mockUpdateCargoField = jest.fn();
jest.mock('../../firebase/firebase');
jest.mock('../../context/ShipmentManifestContext', () => ({
  ...jest.requireActual('../../context/ShipmentManifestContext'),
  useManifest: jest.fn(),
}));
jest.mock('../../context/CargoContext');

/**
 * @description Test suite for the InputCargo component.
 */
describe('InputCargo', () => {
  const cargoIndex = 0;
  const initialManifest = {
    cargo: [
      { name: 'Iron Ore', quantity: 50 },
      { name: '', quantity: 0 },
    ],
  };

  const mockCargoTypes = [
    { id: '1', name: 'Iron Ore' },
    { id: '2', name: 'Gold Ore' },
  ];

  beforeEach(() => {
    // Before each test, clear mock history and set the mock return value
    mockUpdateCargoField.mockClear();
    useManifest.mockReturnValue({
      manifest: initialManifest,
      updateCargoField: mockUpdateCargoField,
    });
    useCargo.mockReturnValue({
      cargoTypes: mockCargoTypes,
      /**
       * @description Mocks the `findCargoByName` function to return filtered cargo types based on a search term.
       * @param {string} term - The search term to filter cargo types.
       * @returns  {Array<object>} An array of filtered cargo types.
       */
      findCargoByName: (term) => mockCargoTypes.filter((c) => c.name.toLowerCase().includes(term.toLowerCase())),
    });
  });

  /**
   * @description Verifies that the component's input fields render with the initial state from the manifest context.
   */
  test('renders with initial values from manifest', () => {
    render(<InputCargo cargoIndex={cargoIndex} />);

    // Check if the name input displays the correct initial value
    const nameInput = screen.getByLabelText(/Cargo Hold 1:/i);
    expect(nameInput.value).toBe('Iron Ore');

    // Check if the quantity input displays the correct initial value
    const quantityInput = screen.getByLabelText(/Quantity:/i);
    expect(quantityInput.value).toBe('50');
  });

  /**
   * @description Verifies that changing the cargo name input calls the updateCargoField function with the correct parameters.
   */
  test('searches and updates cargo name on selection', async () => {
    render(<InputCargo cargoIndex={cargoIndex} />);

    const nameInput = screen.getByLabelText(/Cargo Hold 1:/i);

    // Simulate user focusing the input before typing
    fireEvent.focus(nameInput);

    // Simulate user typing to search
    fireEvent.change(nameInput, { target: { value: 'Gold Ore' } });

    // A selection from the drop down should appear.
    const searchResult = await screen.findByText('Gold Ore');
    expect(searchResult).toBeInTheDocument();

    // Simulate user selecting the item
    fireEvent.mouseDown(searchResult);

    // The manifest should be updated with the selected name.
    await waitFor(() => {
      expect(mockUpdateCargoField).toHaveBeenCalledWith(cargoIndex, 'name', 'Gold Ore');
    });
  });

  /**
   * @description Verifies that changing the cargo quantity input calls the updateCargoField function with the correct parameters.
   */
  test('calls updateCargoField with a number when quantity is changed', () => {
    render(<InputCargo cargoIndex={cargoIndex} />);

    const quantityInput = screen.getByLabelText(/Quantity:/i);
    fireEvent.change(quantityInput, { target: { value: '75' } });

    expect(mockUpdateCargoField).toHaveBeenCalledTimes(1);
    expect(mockUpdateCargoField).toHaveBeenCalledWith(cargoIndex, 'quantity', 75);
  });
});
