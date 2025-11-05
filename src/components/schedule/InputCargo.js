import { useManifest } from '../../context/ShipmentManifestContext';

/**
 * @description Renders a set of input fields for a single cargo item, including its name and quantity.
 * It uses the cargoIndex prop to identify which item in the manifest it corresponds to.
 * @param {object} props The component's properties.
 * @param {number} props.cargoIndex The index of the cargo item in the manifest's cargo array (0-3).
 * @returns {object} (JSX.Element) A React component for a single cargo item's inputs.
 */
const InputCargo = ({ cargoIndex }) => {
  const cargoSlot = cargoIndex + 1;
  const { manifest, updateCargoField } = useManifest();
  const currentCargo = manifest.cargo[cargoIndex];

  /**
   * @description Handles changes to the input fields for a specific cargo item.
   * @param {string} field The name of the field to update ('name' or 'quantity').
   * @param {string|number} value The new value for the field.
   */
  const handleChange = (field, value) => {
    const newValue = field === 'quantity' ? Number(value) : value;
    // 2. Call the simple, central update function
    updateCargoField(cargoIndex, field, newValue);
  };
  return (
    <div className="flex flex-wrap md:flex-nowrap gap-4 items-end">
      <label htmlFor={`cargo${cargoSlot}Name`} className="block text-left mb-1 whitespace-nowrap">
        Cargo Hold {cargoSlot}:
      </label>
      <input
        id={`cargo${cargoSlot}Name`}
        type="text"
        className="w-full p-3 rounded-lg bg-white/90 text-black placeholder-gray-500"
        value={currentCargo.name}
        onChange={(e) => handleChange('name', e.target.value)}
      />

      <label htmlFor={`cargo${cargoSlot}Quantity`} className="block text-left mb-1">
        Quantity:
      </label>
      <input
        id={`cargo${cargoSlot}Quantity`}
        type="number"
        min="0"
        max="100"
        className="w-half p-3 rounded-lg bg-white/90 text-black placeholder-gray-500"
        value={currentCargo.quantity}
        onChange={(e) => handleChange('quantity', e.target.value)}
      />
    </div>
  );
};

export default InputCargo;
