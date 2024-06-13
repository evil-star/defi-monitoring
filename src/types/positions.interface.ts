export interface ILongPosition {
  id: string;
  name: string;
  type: 'hf' | 'liqPrice';
  valueOfType: number;
  tokenId: string;
  tokenSymbol?: string;
  tokensCount: number;
  lth: number;
  borrowFactor: number;
  liquidationPrice?: number;
  borrowed?: number;
  healthFactor?: number;
  riskFactor?: number;
  deposit?: number;
  tokenPrice?: number;
}
