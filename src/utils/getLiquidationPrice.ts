const getLiquidationPrice = (
  borrow: number,
  deposit: number,
  tokenPrice: number,
  lth: number
) => {
  return borrow / ((deposit / tokenPrice) * lth);
};

export default getLiquidationPrice;
