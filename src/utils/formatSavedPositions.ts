import { ILongPosition } from '@/types/positions.interface';
import calcBorrowByHF from './calcBorrowByHF';
import calcBorrowByLiquidationPrice from './calcBorrowByLiquidationPrice';
import getHf from './getHf';
import getRiskFactor from './getRiskFactor';
import getLiquidationPrice from './getLiquidationPrice';

const formatSavedPositions = (
  savedPositions: ILongPosition[],
  tokensList: any
) => {
  return savedPositions
    .map((position) => {
      let borrowed = 0;
      const token = tokensList?.find(
        (token: any) => token.id === position.tokenId
      );
      const tokenPrice = token?.quotes?.USD?.price || 0;
      const tokenSymbol = token?.symbol || '';

      if (position.type === 'hf') {
        borrowed = calcBorrowByHF(
          position.tokensCount * tokenPrice,
          position.lth,
          position.valueOfType || 1,
          position.borrowFactor
        );
      }
      if (position.type === 'liqPrice') {
        borrowed = calcBorrowByLiquidationPrice(
          position.tokensCount,
          position.lth,
          tokenPrice,
          position.valueOfType || 1,
          position.borrowFactor
        );
      }

      const deposit = position.tokensCount * tokenPrice + borrowed;

      return {
        healthFactor: getHf(
          deposit,
          borrowed,
          position.lth,
          position.borrowFactor
        ),
        riskFactor: getRiskFactor(
          borrowed,
          deposit,
          position.lth,
          position.borrowFactor
        ),
        liquidationPrice: getLiquidationPrice(
          borrowed,
          deposit,
          tokenPrice,
          position.lth,
          position.borrowFactor
        ),
        borrowed,
        deposit,
        tokenSymbol,
        tokenPrice,
        ...position,
      };
    })
    .sort((a, b) => a.healthFactor - b.healthFactor);
};

export default formatSavedPositions;
