/**
 * @description Unit tests for the Calculator utility function.
 */
import Calculator from './Calculator'; // Import the function to test

// Describe block groups tests for the Calculator function
describe('Calculator Utility', () => {
  /**
   * @description Tests the calculator with valid, positive integer inputs.
   */
  test('should return the correct quote for valid inputs', () => {
    // Arrange: Define test inputs
    const energy = '10'; // Use strings as they come from input fields
    const tiles = '12';
    const expectedResult = 120; // 10 * 12 = 120

    // Act: Call the function with test inputs
    const result = Calculator(energy, tiles);

    // Assert: Check if the result matches the expected value
    expect(result).toBe(expectedResult);
  });

  /**
   * @description Tests the calculator when one or both inputs are zero.
   */
  test('should return 0 if energy or tiles are zero', () => {
    expect(Calculator('0', '12')).toBe(0); // Zero energy
    expect(Calculator('10', '0')).toBe(0); // Zero tiles
    expect(Calculator('0', '0')).toBe(0); // Both zero
  });

  /**
   * @description Tests the calculator when inputs are missing or invalid strings.
   * The Number() conversion handles these by returning 0.
   */
  test('should return 0 for invalid or missing inputs', () => {
    expect(Calculator('', '12')).toBe(0); // Missing energy
    expect(Calculator('10', '')).toBe(0); // Missing tiles
    expect(Calculator('', '')).toBe(0); // Both missing
    expect(Calculator('ABC', '12')).toBe(0); // Invalid energy string
    expect(Calculator('10', 'XYZ')).toBe(0); // Invalid tiles string
    expect(Calculator(undefined, '12')).toBe(0); // Undefined energy
    expect(Calculator('10', null)).toBe(0); // Null tiles
  });

  /**
   * @description Tests with larger numbers to ensure calculation scales correctly.
   */
  test('should handle larger numbers correctly', () => {
    const energy = '50';
    const tiles = '100';
    const expectedResult = 5000; // 50 * 100 = 5000
    const result = Calculator(energy, tiles);
    expect(result).toBe(expectedResult);
  });
});
