import { useState, useEffect } from 'react';
import { useManifest } from '../../context/ShipmentManifestContext';
import { useCargo } from '../../context/CargoContext';

/**
 * @description Renders a set of input fields for a single cargo item, including its name and quantity.
 * It uses the cargoIndex prop to identify which item in the manifest it corresponds to.
 * @param {object} props The component's properties.
 * @param {number} props.cargoIndex The index of the cargo item in the manifest's cargo array (0-3).
 * @param {object} props.maxQuantity {string} props.maxQuantity The maximum allowed quantity for this cargo item. Defaults to '100'.
 * @returns {object} (JSX.Element) A React component for a single cargo item's inputs.
 */
const InputCargo = ({ cargoIndex, maxQuantity = '100' }) => {
  const cargoSlot = cargoIndex + 1;
  const { manifest, updateCargoField } = useManifest();
  const currentCargo = manifest.cargo[cargoIndex];
  const { findCargoByName, cargoTypes } = useCargo();

  const [search, setSearch] = useState(currentCargo.name || '');
  const [searchResults, setSearchResults] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const isNameValid = cargoTypes.some((cargo) => cargo.name === currentCargo.name);
  const isInvalidAndPopulated = !isNameValid && search !== '' && Number(currentCargo.quantity) > 0;

  /**
   * @description Handles changes to the input fields for a specific cargo item.
   * @param {string} field The name of the field to update ('name' or 'quantity').
   * @param {string|number} value The new value for the field.
   */
  const handleChange = (field, value) => {
    let newValue = value;
    if (field === 'quantity') {
      const numberValue = Number(value);
      // Cap the quantity between 0 and the maxQuantity
      newValue = Math.max(0, Math.min(numberValue, Number(maxQuantity)));
    }

    updateCargoField(cargoIndex, field, newValue);
  };

  /**
   * @description Handles changes to the search input field for cargo names.
   * It updates the local search state, clears the manifest's cargo name if it no longer matches,
   * and performs a search for cargo types based on the input, updating the search results.
   * @param {object} e - The event object from the input change.
   */
  const handleSearchChange = (e) => {
    const searchTerm = e.target.value;
    setSearch(searchTerm);
    // When the user types, we should clear the manifest value if it's not matching
    if (currentCargo.name !== '' && searchTerm !== currentCargo.name) {
      updateCargoField(cargoIndex, 'name', '');
    }
    if (searchTerm) {
      const results = findCargoByName(searchTerm);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  /**
   * @description Handles the selection of a cargo item from the search results.
   * @param {object} cargo - The selected cargo object from the search results.
   */
  const handleSelectCargo = (cargo) => {
    setSearch(cargo.name);
    updateCargoField(cargoIndex, 'name', cargo.name);
    setSearchResults([]);
    setIsFocused(false);
  };

  useEffect(() => {
    // Sync local search state if manifest name changes externally
    // or if the current search text does not match a valid name.
    if (currentCargo.name !== search) {
      setSearch(currentCargo.name || '');
    }
  }, [currentCargo.name]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex flex-wrap md:flex-nowrap gap-4 items-end">
      <label htmlFor={`cargo${cargoSlot}Name`} className="block text-left mb-1 whitespace-nowrap">
        Cargo Hold {cargoSlot}:
      </label>
      <div className="relative w-full">
        <input
          id={`cargo${cargoSlot}Name`}
          type="text"
          className="w-full p-3 rounded-lg bg-white/90 text-black placeholder-gray-500"
          value={search}
          onChange={handleSearchChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)} // Delay to allow click on results
          placeholder="Type to search for cargo..."
          autoComplete="off"
        />
        {isNameValid && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <span className="text-green-500">✓</span>
          </div>
        )}
        {isInvalidAndPopulated && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <span className="text-red-500 font-bold">✗</span>
          </div>
        )}
        {isFocused && searchResults.length > 0 && (
          <ul className="absolute left-0 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-md z-10 overflow-y-auto max-h-52">
            {searchResults.map((cargo) => (
              <li
                key={cargo.id} // Assuming your cargo items have a unique 'id'
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-gray-900"
                onMouseDown={() => handleSelectCargo(cargo)}
              >
                {cargo.name}
              </li>
            ))}
          </ul>
        )}
      </div>

      <label htmlFor={`cargo${cargoSlot}Quantity`} className="block text-left mb-1">
        Quantity:
      </label>
      <input
        id={`cargo${cargoSlot}Quantity`}
        type="number"
        min="0"
        max={maxQuantity}
        className="w-32 p-3 rounded-lg bg-white/90 text-black placeholder-gray-500"
        value={currentCargo.quantity}
        onChange={(e) => handleChange('quantity', e.target.value)}
      />
    </div>
  );
};

export default InputCargo;
