/**
@description multiplication equation to be a placeholder for testing website design. 
@param {object} manifest manifest contains array of two ports with cords and name, and cargo array of 4 cargo with name and quantity
@returns {number} result of the length a times length b to test website design
 */
function Calculator(manifest) {
  const aSize = Number(manifest.port[0].north) || 0;
  const bSize = Number(manifest.port[1].north) || 0;
  if (aSize <= 0 || bSize <= 0) {
    return 0;
  }
  const result = aSize * bSize;
  return result;
}

export default Calculator;
