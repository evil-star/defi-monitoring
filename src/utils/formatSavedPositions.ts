import { ILongPosition } from '@/types/positions.interface';
import getHf from './getHf';
import getRiskFactor from './getRiskFactor';
import getLiquidationPrice from './getLiquidationPrice';

const formatSavedPositions = (
  savedPositions: ILongPosition[],
  tokensList: any
) => {
  return savedPositions
    .map((position) => {
      const token = tokensList?.find(
        (token: any) => token.id === position.tokenId
      );
      const tokenPrice = token?.quotes?.USD?.price || 0;
      const tokenSymbol = token?.symbol || '';

      const deposit =
        position.tokensCount * tokenPrice + (position.borrowed || 0);

      return {
        healthFactor: getHf(
          deposit,
          position.borrowed || 0,
          position.lth,
          position.borrowFactor
        ),
        riskFactor: getRiskFactor(
          position.borrowed || 0,
          deposit,
          position.lth,
          position.borrowFactor
        ),
        liquidationPrice: getLiquidationPrice(
          position.borrowed || 0,
          deposit,
          tokenPrice,
          position.lth,
          position.borrowFactor
        ),
        tokenSymbol,
        tokenPrice,
        ...position,
      };
    })
    .sort((a, b) => a.healthFactor - b.healthFactor);
};

export default formatSavedPositions;
