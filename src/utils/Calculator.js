/**
@description multiplication equation to be a placeholder for testing website design. 
@param {object} manifest manifest contains array of two ports with cords and name, and cargo array of 4 cargo with name and quantity
 * @param {number} baseContractCost Per trip cost for shipment
 * @param {number} shortHaulDistance Distance travel has reduced cost if less shortHaulDistance value 
 * @param {number} ShortHaulDiscountOffer Discount applied when shipment short haul distance requirement is met
 * @param {number} distanceErrorCorrectionTerm Hex shape correction value used to adjust distance calculation and price.
 * @param {number} tpEnergyPerDistance Energy cost per hex traveled
 * @param {number} pricePerFruit Traveler's fruit base cost on the market
 * @param {number} tpEnergyPerFruit Traveler's fruit TP energy restored when consumed
 * @param {number} costPerDistance Hex coin cost per hex traveled
 * @param {object} capitalLocation Location of the capital in {north: , south: } object
 * @param {number} inventorySlotTPCost Additional cost for TP energy used when traveling with inventory filled.
@returns {number} result of the length a times length b to test website design
 */
function Calculator(
  manifest,
  baseContractCost = 4500,
  shortHaulDistance = 2500,
  ShortHaulDiscountOffer = -2000,
  distanceErrorCorrectionTerm = 1.1,
  tpEnergyPerDistance = 0.004,
  pricePerFruit = 5000,
  tpEnergyPerFruit = 20,
  costPerDistance = 4,
  capitalLocation = { north: 4005, east: 6577 },
  inventorySlotTPCost = 1.35
) {
  //Set constants
  const startLocation = manifest.port[0];
  const endLocation = manifest.port[1];
  //Exit early if still 0
  if ((startLocation.north === 0 && startLocation.east === 0) || (endLocation.north === 0 && endLocation.east === 0)) {
    return 0;
  }

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
  const transportDistanceCost = Math.ceil(costPerDistance * distance);

  //Calculate the cost estimate
  const costEstimate = Math.ceil(baseContractCost + outboundTpCost + transportDistanceCost + shortHaulDiscount);

  const costOutputs = {
    costEstimate,
    distance,
    distanceToCapital,
    outboundTpCost,
    transportDistanceCost,
    shortHaulDiscount,
  };

  return costOutputs;
}

export default Calculator;
