export interface GasData {
  chain: string;
  chainId: string;
  low: number;
  medium: number;
  high: number;
  timestamp: number;
  usdCost?: number;
}

export interface ChainConfig {
  name: string;
  chainId: string;
  icon: string;
  color: string;
}

export interface TrendData {
  timestamp: number;
  value: number;
}

export type TimeRange = '1h' | '24h';
export type RecommendationType = 'cost' | 'speed';

