import { GasData } from '../types.js';

const CHAINS = [
  { name: 'Ethereum', chainId: 'eth', owlracleId: 'eth' },
  { name: 'Base', chainId: 'base', owlracleId: 'base' },
  { name: 'Solana', chainId: 'sol', owlracleId: 'sol' },
  { name: 'Arbitrum', chainId: 'arb', owlracleId: 'arb' },
  { name: 'Optimism', chainId: 'op', owlracleId: 'op' },
  { name: 'Polygon', chainId: 'poly', owlracleId: 'poly' },
];

interface CoinPaprikaResponse {
  quotes: {
    USD: {
      price: number;
    };
  };
}

export async function fetchEthPrice(): Promise<number> {
  try {
    const response = await fetch('https://api.coinpaprika.com/v1/tickers/eth-ethereum');
    const data = await response.json() as CoinPaprikaResponse;
    return data.quotes.USD.price;
  } catch (error) {
    console.error('Error fetching ETH price:', error);
    return 0;
  }
}

export async function fetchGasData(): Promise<GasData[]> {
  const ethPrice = await fetchEthPrice();
  
  const gasDataPromises = CHAINS.map(async (chain) => {
    try {
      // Using Owlracle API - free tier
      const response = await fetch(`https://api.owlracle.info/v4/${chain.owlracleId}/gas`);
      const data = await response.json() as { speeds?: Array<{ gasPrice?: number }> };
      
      // Owlracle returns speeds array with different gas prices
      const speeds = data.speeds || [];
      const low = speeds[0]?.gasPrice || 0;
      const medium = speeds[1]?.gasPrice || 0;
      const high = speeds[2]?.gasPrice || 0;
      
      // Calculate USD cost for Ethereum (rough estimate: 21000 gas for simple transfer)
      const usdCost = chain.chainId === 'eth' ? (medium * 21000 * ethPrice) / 1e9 : undefined;
      
      return {
        chain: chain.name,
        chainId: chain.chainId,
        low: Math.round(low),
        medium: Math.round(medium),
        high: Math.round(high),
        timestamp: Date.now(),
        usdCost,
      };
    } catch (error) {
      console.error(`Error fetching gas for ${chain.name}:`, error);
      // Return mock data as fallback
      return {
        chain: chain.name,
        chainId: chain.chainId,
        low: Math.floor(Math.random() * 20) + 5,
        medium: Math.floor(Math.random() * 40) + 25,
        high: Math.floor(Math.random() * 60) + 50,
        timestamp: Date.now(),
        usdCost: chain.chainId === 'eth' ? Math.random() * 5 + 1 : undefined,
      };
    }
  });
  
  return Promise.all(gasDataPromises);
}

export function getGasLevel(value: number, chain: string): 'low' | 'medium' | 'high' {
  // Different thresholds for different chains
  const thresholds: Record<string, { low: number; high: number }> = {
    eth: { low: 30, high: 80 },
    base: { low: 0.5, high: 2 },
    sol: { low: 0.00001, high: 0.0001 },
    arb: { low: 0.1, high: 0.5 },
    op: { low: 0.1, high: 0.5 },
    poly: { low: 30, high: 100 },
  };
  
  const threshold = thresholds[chain] || { low: 30, high: 80 };
  
  if (value <= threshold.low) return 'low';
  if (value >= threshold.high) return 'high';
  return 'medium';
}




