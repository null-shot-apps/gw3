'use client';

import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { GasData, TimeRange } from '@/app/types';

interface TrendChartProps {
  historicalData: Map<string, GasData[]>;
}

const CHAIN_COLORS: Record<string, string> = {
  eth: '#627EEA',
  base: '#0052FF',
  sol: '#14F195',
  arb: '#28A0F0',
  op: '#FF0420',
  poly: '#8247E5',
};

export default function TrendChart({ historicalData }: TrendChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('24h');
  const [selectedChains, setSelectedChains] = useState<Set<string>>(
    new Set(['eth', 'base', 'arb'])
  );
  
  const getFilteredData = () => {
    const now = Date.now();
    const timeLimit = timeRange === '1h' ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
    
    // Combine all historical data into a single timeline
    const timelineMap = new Map<number, Record<string, number>>();
    
    historicalData.forEach((dataPoints, chainId) => {
      if (!selectedChains.has(chainId)) return;
      
      dataPoints.forEach((point) => {
        if (now - point.timestamp <= timeLimit) {
          const roundedTime = Math.floor(point.timestamp / 60000) * 60000; // Round to minute
          if (!timelineMap.has(roundedTime)) {
            timelineMap.set(roundedTime, {});
          }
          timelineMap.get(roundedTime)![chainId] = point.medium;
        }
      });
    });
    
    // Convert to array and sort by time
    return Array.from(timelineMap.entries())
      .map(([timestamp, values]) => ({
        timestamp,
        time: new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        ...values,
      }))
      .sort((a, b) => a.timestamp - b.timestamp);
  };
  
  const chartData = getFilteredData();
  
  const toggleChain = (chainId: string) => {
    const newSelected = new Set(selectedChains);
    if (newSelected.has(chainId)) {
      newSelected.delete(chainId);
    } else {
      newSelected.add(chainId);
    }
    setSelectedChains(newSelected);
  };
  
  const chains = [
    { id: 'eth', name: 'Ethereum' },
    { id: 'base', name: 'Base' },
    { id: 'sol', name: 'Solana' },
    { id: 'arb', name: 'Arbitrum' },
    { id: 'op', name: 'Optimism' },
    { id: 'poly', name: 'Polygon' },
  ];
  
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Gas Trends</h2>
        
        <div className="flex gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => setTimeRange('1h')}
            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
              timeRange === '1h'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            1 Hour
          </button>
          <button
            onClick={() => setTimeRange('24h')}
            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
              timeRange === '24h'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            24 Hours
          </button>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2 mb-4">
        {chains.map((chain) => (
          <button
            key={chain.id}
            onClick={() => toggleChain(chain.id)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
              selectedChains.has(chain.id)
                ? 'text-white shadow-md'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
            style={
              selectedChains.has(chain.id)
                ? { backgroundColor: CHAIN_COLORS[chain.id] }
                : {}
            }
          >
            {chain.name}
          </button>
        ))}
      </div>
      
      <div className="h-80">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
              <XAxis 
                dataKey="time" 
                stroke="#9CA3AF"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#9CA3AF"
                style={{ fontSize: '12px' }}
                label={{ value: 'Gwei', angle: -90, position: 'insideLeft', fill: '#9CA3AF' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F9FAFB'
                }}
              />
              <Legend />
              {Array.from(selectedChains).map((chainId) => (
                <Line
                  key={chainId}
                  type="monotone"
                  dataKey={chainId}
                  stroke={CHAIN_COLORS[chainId]}
                  strokeWidth={2}
                  dot={false}
                  name={chains.find(c => c.id === chainId)?.name}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
            <p>Collecting data... Check back in a few moments</p>
          </div>
        )}
      </div>
    </div>
  );
}

