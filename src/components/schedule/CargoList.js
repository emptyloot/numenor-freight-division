import React from 'react';
import { useManifest } from '../../context/ShipmentManifestContext';
import InputCargo from './InputCargo';

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

  const canAddMoreSlots = manifest.cargo.length < maxCargoSlots;
  const canAddMoreItems = totalCargoQuantity < maxTotalQuantity;
  const canAddCargo = canAddMoreSlots && canAddMoreItems;

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
              Cargo Slots: {manifest.cargo.length} / {maxCargoSlots}
            </p>
          </div>
        </div>
        <div className="space-y-4">
          {manifest.cargo.map((cargoItem, index) => (
            <div key={index} className="flex items-center gap-4">
              <div className="flex-grow">
                <InputCargo cargoIndex={index} maxQuantity={maxQuantityPerSlot} />
              </div>
              <button
                type="button"
                onClick={() => removeCargoItem(index)}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
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
          className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Add Cargo Slot
        </button>
      </div>
    </fieldset>
  );
};

export default CargoList;
