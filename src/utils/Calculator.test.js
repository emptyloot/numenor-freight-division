import Calculator from './Calculator';

/**
 * @file This file contains the unit tests for the Calculator function.
 * The Calculator function is used to estimate the cost of a shipment.
 */
describe('Calculator Cost Estimation', () => {
  // Test case for a short distance shipment, where no long haul fee is applied.
  test('should correctly calculate the cost for a short haul shipment', () => {
    const manifest = {
      port: [
        { north: 1000, east: 1000 }, // Start location
        { north: 2000, east: 2000 }, // End location
      ],
    };
    const cost = Calculator(manifest).costEstimate;
    // The expected cost is calculated based on the formula in Calculator.js for short distances.
    expect(cost).toBeCloseTo(17565);
  });

  // Test case for a long distance shipment, where a long haul fee is applied.
  test('should correctly calculate the cost for a long haul shipment', () => {
    const manifest = {
      port: [
        { north: 1000, east: 1000 }, // Start location
        { north: 4000, east: 4000 }, // End location
      ],
    };
    const cost = Calculator(manifest).costEstimate;
    // The expected cost includes the long haul fee.
    expect(cost).toBeCloseTo(30879);
  });

  // Test case for a shipment with no distance between start and end locations.
  test('should correctly calculate the cost for a zero distance shipment', () => {
    const manifest = {
      port: [
        { north: 1000, east: 1000 }, // Start location
        { north: 1000, east: 1000 }, // End location is the same as start
      ],
    };
    const cost = Calculator(manifest).costEstimate;
    // The expected cost should not include any distance-based charges.
    expect(cost).toBe(11908);
  });

  //Test Examples from Doc
  test('should return same values as original example 1', () => {
    const manifest = {
      port: [
        { north: 4212, east: 6989 }, // Start location
        { north: 2950, east: 6101 }, // End location is the same as start
      ],
    };
    const cost = Calculator(manifest).costEstimate;
    // The expected cost should not include any distance-based charges.
    expect(cost).toBe(9358);
  });
  test('should return same values as original example 2', () => {
    const manifest = {
      port: [
        { north: 1330, east: 2420 }, // Start location
        { north: 4005, east: 6577 }, // End location is the same as start
      ],
    };
    const cost = Calculator(manifest).costEstimate;
    // The expected cost should not include any distance-based charges.
    expect(cost).toBe(31615);
  });
});
