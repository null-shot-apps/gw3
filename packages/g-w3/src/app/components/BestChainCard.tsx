'use client';

import { useState } from 'react';
import { GasData, RecommendationType } from '@/app/types';

interface BestChainCardProps {
  gasData: GasData[];
}

const CHAIN_ICONS: Record<string, string> = {
  eth: '⟠',
  base: '🔵',
  sol: '◎',
  arb: '🔷',
  op: '🔴',
  poly: '⬡',
};

export default function BestChainCard({ gasData }: BestChainCardProps) {
  const [recommendationType, setRecommendationType] = useState<RecommendationType>('cost');
  
  const getBestChain = (): GasData | null => {
    if (gasData.length === 0) return null;
    
    if (recommendationType === 'cost') {
      // Find chain with lowest medium gas price
      return gasData.reduce((best, current) => 
        current.medium < best.medium ? current : best
      );
    } else {
      // For speed, prefer L2s and chains with lower confirmation times
      // Simplified: just pick the one with lowest gas (faster chains tend to have lower gas)
      const speedPriority = ['sol', 'base', 'arb', 'op', 'poly', 'eth'];
      const sorted = [...gasData].sort((a, b) => {
        const aIndex = speedPriority.indexOf(a.chainId);
        const bIndex = speedPriority.indexOf(b.chainId);
        return aIndex - bIndex;
      });
      return sorted[0];
    }
  };
  
  const bestChain = getBestChain();
  
  if (!bestChain) return null;
  
  return (
    <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl p-6 text-white shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">🏆 Best Chain Right Now</h2>
        
        <div className="flex gap-2 bg-white/20 rounded-lg p-1">
          <button
            onClick={() => setRecommendationType('cost')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              recommendationType === 'cost' 
                ? 'bg-white text-blue-600' 
                : 'text-white/80 hover:text-white'
            }`}
          >
            Lowest Cost
          </button>
          <button
            onClick={() => setRecommendationType('speed')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              recommendationType === 'speed' 
                ? 'bg-white text-purple-600' 
                : 'text-white/80 hover:text-white'
            }`}
          >
            Fastest
          </button>
        </div>
      </div>
      
      <div className="flex items-center gap-4 bg-white/10 rounded-lg p-4 backdrop-blur-sm">
        <span className="text-5xl">{CHAIN_ICONS[bestChain.chainId] || '⛓️'}</span>
        <div className="flex-1">
          <h3 className="text-2xl font-bold mb-1">{bestChain.chain}</h3>
          <p className="text-white/80 text-sm mb-2">
            {recommendationType === 'cost' 
              ? 'Most affordable gas fees right now' 
              : 'Fastest transaction confirmation'}
          </p>
          <div className="flex items-center gap-4">
            <div>
              <span className="text-xs text-white/60">Gas Price</span>
              <p className="font-mono font-bold text-lg">{bestChain.medium} Gwei</p>
            </div>
            {bestChain.usdCost && (
              <div>
                <span className="text-xs text-white/60">Est. Cost</span>
                <p className="font-mono font-bold text-lg">${bestChain.usdCost.toFixed(2)}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

