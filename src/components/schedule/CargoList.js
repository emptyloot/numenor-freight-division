import React from 'react';
import { useManifest } from '../../context/ShipmentManifestContext';
import InputCargo from './InputCargo';

/**
 * @description Calculates the number of cargo slots required for a given quantity,
 *              assuming each slot can hold a maximum of 25 units.
 * @param {number} quantity - The total quantity of a cargo item.
 * @returns {number} The number of cargo slots needed.
 */
const calculateSlotsRequired = (quantity) => {
  if (quantity <= 0) return 0;
  return Math.ceil(quantity / 25);
};

/**
 * @description Renders a dynamic list of cargo items and manages total quantity.
 * @param {object} props The component's properties.
 * @param {number} props.maxTotalQuantity The maximum total quantity allowed across all cargo holds.
 * @param {number} props.maxCargoSlots The maximum number of cargo slots available.
 * @param {number} props.maxQuantityPerSlot The maximum quantity allowed per cargo slot.
 * @returns {object} A React component for managing the cargo list.
 */
const CargoList = ({ maxTotalQuantity = 250, maxCargoSlots = 10, maxQuantityPerSlot = 25 }) => {
  const { manifest, addCargoItem, removeCargoItem } = useManifest();

  const totalCargoQuantity = manifest.cargo.reduce((total, item) => total + Number(item.quantity || 0), 0);
  const totalSlotsConsumedByAll = manifest.cargo.reduce((total, item) => {
    return total + calculateSlotsRequired(Number(item.quantity || 0));
  }, 0);
  const canAddMoreSlots = totalSlotsConsumedByAll < maxCargoSlots;
  const canAddMoreItems = totalCargoQuantity < maxTotalQuantity;

  const canAddCargo = canAddMoreSlots && canAddMoreItems;
  /**
   * @description Function to calculate the maximum quantity allowed for a specific cargo slot
   * This takes into account the total quantity limit and the number of available cargo slots.
   * It ensures that adding or updating an item doesn't exceed the overall capacity.
   * @param {number} currentIndex of slot being dynamicly calculated
   * @returns {number} the total amount the current slot can have as a max quantity
   */
  const getDynamicMaxQuantity = (currentIndex) => {
    const currentItemQuantity = Number(manifest.cargo[currentIndex]?.quantity || 0);
    const slotsConsumedByCurrentItem = calculateSlotsRequired(currentItemQuantity);

    const slotsConsumedByOthers = totalSlotsConsumedByAll - slotsConsumedByCurrentItem;

    // Use Math.max(0, ...) to prevent negative slot counts if someone inputs an absurd number
    const maxRemainingSlots = Math.max(0, maxCargoSlots - slotsConsumedByOthers);

    // Cap by the absolute weight limit (250)
    return Math.min(maxRemainingSlots * 25, maxTotalQuantity);
  };
  return (
    <fieldset className="space-y-4">
      <legend>Cargo Manifest</legend>
      <div className="p-4 bg-black/20 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Cargo Details</h3>
          <div className="text-right">
            <p>
              Total Quantity: {totalCargoQuantity} / {maxTotalQuantity}
            </p>
            <p>
              Cargo Slots: {totalSlotsConsumedByAll} / {maxCargoSlots}
            </p>
          </div>
        </div>
        <div className="space-y-4">
          {manifest.cargo.map((cargoItem, index) => (
            <div key={index} className="flex items-center gap-4">
              <div className="flex-grow">
                <InputCargo cargoIndex={index} maxQuantity={getDynamicMaxQuantity(index)} />
              </div>
              <button
                type="button"
                onClick={() => removeCargoItem(index)}
                className="bg-red-600 hover:bg-red-700 text-off-white font-bold py-2 px-4 rounded"
                aria-label={`Remove Cargo Hold ${index + 1}`}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        {totalCargoQuantity > maxTotalQuantity && (
          <div className="text-red-400 bg-red-900/50 p-3 rounded-lg mt-4">
            Warning: Total cargo quantity exceeds the maximum of {maxTotalQuantity}.
          </div>
        )}
        <button
          type="button"
          onClick={addCargoItem}
          disabled={!canAddCargo}
          className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-off-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Add Cargo Slot
        </button>
      </div>
    </fieldset>
  );
};

export default CargoList;
