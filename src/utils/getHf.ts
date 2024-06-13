const getHf = (
  deposit: number,
  borrow: number,
  lth: number,
  borrowFactor: number
) => {
  return (deposit * lth) / ((borrow * 1) / borrowFactor);
};

export default getHf;
