import { useManifest } from '../../context/ShipmentManifestContext';

/**
 * @description A reusable component that renders a form label and its associated text input field, following standard accessibility practices by linking the label's `htmlFor` attribute to the input's `id`.
 * @param {number} portIndex the Port of origin position 0 and the destination port position 1 in the index.
 * $param {string} label The user-friendly text displayed next to the input field (e.g., "Port of Origin").
 * $param {string} baseId The unique identifier (id) used to link the label and input field. This is also used for the input's name if needed.
 * @returns {object} A React component containing an accessible label and text input field.
 */
const LocationInput = ({ baseId, label, portIndex }) => {
  const inputClass = 'w-full p-3 rounded-lg bg-white/90 text-black placeholder-gray-500';
  const labelClass = 'block text-left text-xs mb-1 font-semibold';
  const { manifest, updatePortField } = useManifest();
  const currentPort = manifest.port[portIndex];

  /**
   * @description Handles changes to the input fields (east, north, name) for a specific port.
   * @param {object} field variable inside object to change
   * @param {object} value new value to change variable to
   */
  const handleChange = (field, value) => {
    const newValue = field === 'east' || field === 'north' ? Number(value) : value;
    // 2. Call the simple, central update function
    updatePortField(portIndex, field, newValue);
  };

  return (
    <div className="grid grid-cols-6 gap-x-4 items-center">
      {/* 1. Primary Group Label (Visible above the inputs) */}
      <label htmlFor={`${baseId}-E`} className="col-span-2 text-right font-bold text-lg whitespace-nowrap">
        {label}:
      </label>
      {/* 2. East Coordinate Input Group */}
      <div className="col-span-2">
        <label htmlFor={`${baseId}-E`} className={labelClass}>
          East (E)
        </label>
        <input
          id={`${baseId}-E`}
          value={currentPort.east}
          onChange={(e) => handleChange('east', e.target.value)}
          type="number"
          className={inputClass}
          min="0"
          max="7800"
        />
      </div>
      {/* 3. North Coordinate Input Group */}
      <div className="col-span-2">
        <label htmlFor={`${baseId}-N`} className={labelClass}>
          North (N)
        </label>
        <input
          value={currentPort.north}
          onChange={(e) => handleChange('north', e.target.value)}
          id={`${baseId}-N`}
          type="number"
          className={inputClass}
          min="0"
          max="7800"
        />
      </div>
    </div>
  );
};

export default LocationInput;
