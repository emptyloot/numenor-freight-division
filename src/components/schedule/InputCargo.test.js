import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { useManifest } from '../../context/ShipmentManifestContext';
import InputCargo from './InputCargo';

// Mock the useManifest hook to control the context values
const mockUpdateCargoField = jest.fn();
jest.mock('../../context/ShipmentManifestContext', () => ({
  ...jest.requireActual('../../context/ShipmentManifestContext'),
  useManifest: jest.fn(),
}));

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

  beforeEach(() => {
    // Before each test, clear mock history and set the mock return value
    mockUpdateCargoField.mockClear();
    useManifest.mockReturnValue({
      manifest: initialManifest,
      updateCargoField: mockUpdateCargoField,
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
  test('calls updateCargoField when name is changed', () => {
    render(<InputCargo cargoIndex={cargoIndex} />);

    const nameInput = screen.getByLabelText(/Cargo Hold 1:/i);
    fireEvent.change(nameInput, { target: { value: 'Gold Ore' } });

    expect(mockUpdateCargoField).toHaveBeenCalledTimes(1);
    expect(mockUpdateCargoField).toHaveBeenCalledWith(cargoIndex, 'name', 'Gold Ore');
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
