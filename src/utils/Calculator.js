function Calculator(a, b) {
  const aSize = Number(a);
  const bSize = Number(b);
  if (aSize <= 0 || bSize <= 0) {
    return 0;
  }
  const result = aSize * bSize;
  return result;
}

export default Calculator;
