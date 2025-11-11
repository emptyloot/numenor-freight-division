import React, { useState, useEffect } from 'react';
import { useManifest } from '../../context/ShipmentManifestContext';
import { useClaims } from '../../context/ClaimContext';

/**
 * @description A reusable component that renders a form label and its associated text input field, following standard accessibility practices by linking the label's `htmlFor` attribute to the input's `id`.
 * @param {object} props - The component properties.
 * @param {string} props.label The user-friendly text displayed next to the input field (e.g., "Port of Origin").
 * @param {string} props.baseId The unique identifier (id) used to link the label and input field. This is also used for the input's name if needed.
 * @param {number} props.portIndex the Port of origin position 0 and the destination port position 1 in the index.
 * @returns {object} A React component containing an accessible label and text input field.
 */
const LocationInput = ({ baseId, label, portIndex }) => {
  const inputClass = 'w-full p-3 rounded-lg bg-white/90 text-black placeholder-gray-500';
  const labelClass = 'block text-left text-xs mb-1 font-semibold';
  const { manifest, updatePortField, updatePort } = useManifest();
  const { findClaimByName, getClaimLocation } = useClaims();
  const [currentPort, setCurrentPort] = useState(manifest.port[portIndex]);
  const [search, setSearch] = useState('');
  const [isMatched, setIsMatched] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const [isSelectEvent, setIsSelectEvent] = useState(false);

  /**
   * @description Handles changes to the input fields (east, north, name) for a specific port.
   * @param {object} field variable inside object to change
   * @param {object} value new value to change variable to
   */ // DISABLED in the input field//
  const handleChange = (field, value) => {
    const newValue = field === 'east' || field === 'north' ? Number(value) : value;
    // 2. Call the simple, central update function
    updatePortField(portIndex, field, newValue);
  };

  /**
   * @description Handles changes to the search input field.
   * @param {React.ChangeEvent<HTMLInputElement>} e - The input change event.
   */
  const handleSearchChange = (e) => {
    const searchTerm = e.target.value;
    setSearch(searchTerm);
  };

  /**
   * @description Normalizes a string for case-insensitive and accent-insensitive comparison.
   * @param {string} text The string to normalize.
   * @returns {string} The normalized string.
   */
  const normalizeString = (text) => {
    if (typeof text !== 'string') return '';
    return text
      .toLowerCase()
      .normalize('NFD') // Decomposes accented chars (e.g., "ó" -> "o" + "́")
      .replace(/[\u0300-\u036f]/g, ''); // Removes the accent characters
  };

  /**
   * @description Handles the selection of a search result from the drop down.
   * Updates the port's name, north, and east coordinates based on the selected claim.
   * @param {object} e e.preventDefault();
   * @param {object} claim - The selected claim object from the search results.
   */
  const handleSelectSearchResult = (e, claim) => {
    e.preventDefault();
    setIsSelectEvent(true);
    const myClaim = claim;
    if (myClaim) {
      const location = getClaimLocation(myClaim);
      if (location) {
        setCurrentPort({
          name: location.name,
          north: location.north,
          east: location.east,
        });
        setSearch(location.name);
        setIsMatched(true);
      }
    }
  };

  //Sets search on first load with port name and when select event handler is used.
  useEffect(() => {
    if (currentPort.name !== '') {
      setSearch(currentPort.name);
    }
  }, [currentPort]);

  // Checks for invalid matches when search is changed.
  useEffect(() => {
    if (isSelectEvent) {
      return;
    }
    if (currentPort.name === '') {
      return;
    }
    if (normalizeString(currentPort.name) !== normalizeString(search)) {
      setIsMatched(false);
      return;
    }
  }, [currentPort.name, isSelectEvent, search]);

  //Resets data when match is invalid.
  useEffect(() => {
    if (isMatched) {
      updatePort(portIndex, currentPort);
      setSearchResults([]);
      setIsSelectEvent(false);
      return;
    } else {
      updatePortField(portIndex, 'name', '');
      updatePortField(portIndex, 'north', 0);
      updatePortField(portIndex, 'east', 0);
      return;
    }
  }, [currentPort, isMatched, portIndex, updatePort, updatePortField]);

  //Searches the available list of claims for the value in the search bar.
  useEffect(() => {
    if (isSelectEvent) {
      return;
    }
    if (search === '') {
      setIsMatched(false);
      return;
    }
    if (isMatched) {
      return;
    }
    setCurrentPort({
      name: '',
      north: 0,
      east: 0,
    });
    const results = findClaimByName(search);
    if (results.length === 1 && normalizeString(results[0].name) === normalizeString(search)) {
      const location = getClaimLocation(results[0]);
      if (location) {
        setCurrentPort({
          name: location.name,
          north: location.north,
          east: location.east,
        });
        setIsMatched(true);
      }
    } else {
      setSearchResults(results);
    }
  }, [findClaimByName, getClaimLocation, isMatched, isSelectEvent, search]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-6 gap-x-4 items-end">
        <label htmlFor={`${baseId}-search`} className="col-span-2 text-right font-bold text-lg whitespace-nowrap">
          {label}:
        </label>
        <div className="col-span-4 relative" onBlur={() => setIsFocused(false)}>
          <label htmlFor={`${baseId}-search`} className={labelClass}>
            Search by Settlement Name
          </label>
          <input
            id={`${baseId}-search`}
            type="text"
            value={search}
            onChange={handleSearchChange}
            className={`${inputClass} pr-10`}
            placeholder="Armenelos"
            autoComplete="off"
            onFocus={() => setIsFocused(true)}
          />
          {isFocused && searchResults.length > 0 && (
            <ul className="absolute left-0 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-md z-10 overflow-y-auto max-h-52">
              {searchResults.map((result) => (
                <li
                  key={result.entityId}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-gray-900"
                  onMouseDown={(e) => {
                    handleSelectSearchResult(e, result);
                  }}
                >
                  {result.name}: {result.entityId}
                </li>
              ))}
            </ul>
          )}
          {isMatched && <span className="absolute right-3 top-9 text-green-500">✓</span>}
        </div>
      </div>
      <div className="grid grid-cols-6 gap-x-4 items-center">
        <div className="col-span-2" /> {/* Spacer */}
        {/* North Coordinate Input Group */}
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
            disabled
          />
        </div>
        {/* East Coordinate Input Group */}
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
            disabled
          />
        </div>
      </div>
    </div>
  );
};

export default LocationInput;
