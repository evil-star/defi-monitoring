const getRiskFactor = (
  borrow: number,
  deposit: number,
  lth: number,
  borrowFactor: number
) => {
  return ((borrow * 1) / borrowFactor / (deposit * lth)) * 100;
};

export default getRiskFactor;
