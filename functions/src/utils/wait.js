/**
 * Helper function to pause execution.
 * @param {number} ms - The number of milliseconds to wait.
 * @returns {Promise<void>} A promise that resolves after the specified duration.
 */
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

module.exports = { wait };
