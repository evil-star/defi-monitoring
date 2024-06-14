import getHf from '@/utils/getHf';
import getLiquidationPrice from '@/utils/getLiquidationPrice';
import getRiskFactor from '@/utils/getRiskFactor';
import { useMemo } from 'react';

interface Props {
  deposit?: number;
  borrow?: number;
  lth?: number;
  tokenPrice?: number;
  borrowFactor?: number;
}

const useCalculatedLendingData = ({
  deposit,
  borrow,
  lth,
  tokenPrice,
  borrowFactor = 1,
}: Props) => {
  const healthFactor = useMemo(() => {
    if (deposit && borrow && lth && borrowFactor)
      return getHf(deposit, borrow, lth, borrowFactor);
    else return 0;
  }, [borrow, borrowFactor, deposit, lth]);

  const riskFactor = useMemo(() => {
    if (deposit && borrow && lth) return getRiskFactor(borrow, deposit, lth, borrowFactor);
  }, [borrow, deposit, lth, borrowFactor]);

  const liquidationPrice = useMemo(() => {
    if (borrow && deposit && tokenPrice && lth && borrowFactor)
      return getLiquidationPrice(borrow, deposit, tokenPrice, lth, borrowFactor);
  }, [borrow, tokenPrice, deposit, lth, borrowFactor]);

  return {
    healthFactor,
    riskFactor,
    liquidationPrice,
  };
};

export default useCalculatedLendingData;
