const getRiskFactor = (borrow: number, deposit: number, lth: number) => {
  return (borrow / (deposit * lth)) * 100;
}

export default getRiskFactor;
