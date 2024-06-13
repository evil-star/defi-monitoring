function calcBorrowByLiquidationPrice(
  tokensCount: number,
  lth: number,
  currentPrice: number,
  liquidationPrice: number,
  borrowFactor = 1
) {
  const borrow =
    (liquidationPrice * tokensCount * lth * borrowFactor) /
    (1 - liquidationPrice * (lth / currentPrice));
  return borrow;
}
export default calcBorrowByLiquidationPrice;
