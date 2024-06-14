import { ILendingPosition } from '@/types/positions.interface';
import getHf from './getHf';
import getRiskFactor from './getRiskFactor';
import getLiquidationPrice from './getLiquidationPrice';

const formatSavedLendingPositions = (
  positions: ILendingPosition[],
  tokensList: any
) => {
  return positions
    .map((position) => {
      const depositToken = tokensList?.find(
        (t: any) => t?.id === position.depositToken
      );
      const borrowToken = tokensList?.find(
        (t: any) => t?.id === position.borrowToken
      );
      const depositTokensPrice = depositToken?.quotes?.USD?.price;
      const borrowTokensPrice = borrowToken?.quotes?.USD?.price;

      return {
        ...position,
        healthFactor: Number(
          getHf(
            position.depositTokensCount * depositTokensPrice,
            position.borrowTokensCount * borrowTokensPrice,
            position.lth,
            position.borrowFactor
          ).toFixed(1)
        ),
        riskFactor: `${Number(
          getRiskFactor(
            position.borrowTokensCount * borrowTokensPrice,
            position.depositTokensCount * depositTokensPrice,
            position.lth
          ).toFixed(1)
        )} %`,
        borrowTokenLiqPrice: `${Number(
          (
            (position.depositTokensCount * depositTokensPrice * position.lth) /
            position.borrowTokensCount
          ).toFixed(4)
        )} $`,
        depositTokenLiqPrice: `${Number(
          getLiquidationPrice(
            position.borrowTokensCount * borrowTokensPrice,
            position.depositTokensCount * depositTokensPrice,
            depositTokensPrice,
            position.lth
          ).toFixed(4)
        )} $`,
        depositTokensPrice,
        borrowTokensPrice,
        borrowTokenSymbol: borrowToken?.symbol,
        depositTokenSymbol: depositToken?.symbol,
      };
    })
    .sort((a, b) => a.healthFactor - b.healthFactor);
};
export default formatSavedLendingPositions;
