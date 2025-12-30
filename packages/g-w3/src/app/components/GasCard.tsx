'use client';

import { GasData } from '@/app/types';
import { getGasLevel } from '@/app/utils/api';

interface GasCardProps {
  data: GasData;
}

const CHAIN_ICONS: Record<string, string> = {
  eth: '⟠',
  base: '🔵',
  sol: '◎',
  arb: '🔷',
  op: '🔴',
  poly: '⬡',
};

const LEVEL_COLORS = {
  low: 'bg-green-100 dark:bg-green-900/30 border-green-500 text-green-700 dark:text-green-400',
  medium: 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-500 text-yellow-700 dark:text-yellow-400',
  high: 'bg-red-100 dark:bg-red-900/30 border-red-500 text-red-700 dark:text-red-400',
};

export default function GasCard({ data }: GasCardProps) {
  const level = getGasLevel(data.medium, data.chainId);
  const colorClass = LEVEL_COLORS[level];
  
  return (
    <div className={`rounded-xl border-2 p-6 transition-all hover:shadow-lg ${colorClass}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{CHAIN_ICONS[data.chainId] || '⛓️'}</span>
          <div>
            <h3 className="font-bold text-lg">{data.chain}</h3>
            <span className="text-xs uppercase font-semibold">{level}</span>
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Low</span>
          <span className="font-mono font-bold">{data.low} Gwei</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Medium</span>
          <span className="font-mono font-bold">{data.medium} Gwei</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">High</span>
          <span className="font-mono font-bold">{data.high} Gwei</span>
        </div>
        
        {data.usdCost && (
          <div className="pt-2 mt-2 border-t border-current/20">
            <div className="flex justify-between items-center">
              <span className="text-xs">Est. Transfer Cost</span>
              <span className="font-mono font-bold text-sm">${data.usdCost.toFixed(2)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

