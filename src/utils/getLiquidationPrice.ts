const getLiquidationPrice = (
  borrow: number,
  deposit: number,
  tokenPrice: number,
  lth: number,
  borrowFactor: number
) => {
  return (borrow * 1) / borrowFactor / ((deposit / tokenPrice) * lth);
};

export default getLiquidationPrice;
