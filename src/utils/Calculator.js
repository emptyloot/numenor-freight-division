/**
@description multiplication equation to be a placeholder for testing website design. 
@param {object} manifest manifest contains array of two ports with cords and name, and cargo array of 4 cargo with name and quantity
@returns {number} result of the length a times length b to test website design
 */
function Calculator(manifest) {
  //Set constants
  const startLocation = manifest.port[0];
  const endLocation = manifest.port[1];
  //Exit early if still 0
  if ((startLocation.north === 0 && startLocation.east === 0) || (endLocation.north === 0 && endLocation.east === 0)) {
    return 0;
  }
  //more constants
  const baseContractCost = 4500;
  const shortHaulDistance = 2500;
  const ShortHaulDiscountOffer = -2000;
  const distanceErrorCorrectionTerm = 1.1;
  const tpEnergyPerDistance = 0.004;
  const pricePerFruit = 5000;
  const tpEnergyPerFruit = 20;
  const costPerDistance = 4;
  const capitalLocation = { north: 4005, east: 6577 };
  const inventorySlotTPCost = 1.35;

  /**
   * @description calculates the distance between two points using EuclideanDistance
   * @param {object} startLocation object with north east cords for port of origin
   * @param {object} endLocation object with north east cords for destination
   * @returns {number} distance between two points
   */
  const getDistance = (startLocation, endLocation) => {
    const distance = Math.sqrt(
      Math.pow(startLocation.north - endLocation.north, 2) + Math.pow(startLocation.east - endLocation.east, 2)
    );
    return distance;
  };
  //Calculate the distance between two points.
  const distance = getDistance(startLocation, endLocation);

  const distanceToCapital = getDistance(startLocation, capitalLocation);

  //Calculate Outbound TP  Cost
  const outboundTpCost = Math.ceil(
    (distanceErrorCorrectionTerm * distanceToCapital * tpEnergyPerDistance * pricePerFruit * inventorySlotTPCost) /
      tpEnergyPerFruit
  );

  //Calculate Transport Distance Cost
  const shortHaulDiscount = distance <= shortHaulDistance ? ShortHaulDiscountOffer : 0;
  const transportDistanceCost = costPerDistance * distance + shortHaulDiscount;

  //Calculate the cost estimate
  const costEstimate = Math.ceil(baseContractCost + outboundTpCost + transportDistanceCost);

  return costEstimate;
}

export default Calculator;
