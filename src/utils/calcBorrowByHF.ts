function calcBorrowByHF(
  deposit: number,
  lth: number,
  hf: number,
  borrowFactor = 1
) {
  return deposit / (hf / (lth * borrowFactor) - 1);
}

export default calcBorrowByHF;
