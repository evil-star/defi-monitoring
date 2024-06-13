function calcBorrowByRiskFactor(
  riskFactor: number,
  deposit: number,
  lth: number,
  tokenPrice: number
) {
  const rf = riskFactor / 100;
  const borrow =
    (rf * deposit * Math.pow(tokenPrice, 2) * lth) / (1 - rf * lth);
  return borrow;
}

export default calcBorrowByRiskFactor;
