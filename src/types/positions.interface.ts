export interface ILongPosition {
  id: string;
  name: string;
  type: 'hf' | 'liqPrice';
  valueOfType: number;
  tokenId: string;
  tokenSymbol?: string;
  tokensCount: number;
  tokensCountTotal: number;
  lth: number;
  borrowFactor: number;
  positionNote?: string;
  liquidationPrice?: number;
  borrowed?: number;
  healthFactor?: number;
  riskFactor?: number;
  deposit?: number;
  tokenPrice?: number;
}

export interface ILendingPosition {
  id: string;
  depositToken: string;
  depositTokensCount: number;
  depositTokensPrice?: number;
  borrowToken: string;
  borrowTokensCount: number;
  lth: number;
  borrowFactor: number;
  borrowTokensPrice?: number;
  healthFactor?: number;
  riskFactor?: number;
  depositTokenLiqPrice?: number;
  borrowTokenLiqPrice?: number;
  note?: string;
  depositTokenSymbol?: string;
  borrowTokenSymbol?: string;
}
