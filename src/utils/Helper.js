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

export default normalizeString;
