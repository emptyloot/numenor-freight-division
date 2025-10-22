/**
@description multiplication equation to be a placeholder for testing website design. 
@param {number} a side a of a right angle triangle.
@param {number} b side b of a right angle triangle.
@returns {number} result of the length a times length b to test website design
 */
function Calculator(a, b) {
  const aSize = Number(a) || 0;
  const bSize = Number(b) || 0;
  if (aSize <= 0 || bSize <= 0) {
    return 0;
  }
  const result = aSize * bSize;
  return result;
}

export default Calculator;
