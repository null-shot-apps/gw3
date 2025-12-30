'use client';

import { useEffect, useState, useCallback } from 'react';
import Header from './components/Header';
import GasCard from './components/GasCard';
import BestChainCard from './components/BestChainCard';
import TrendChart from './components/TrendChart';
import { GasData } from '@/app/types';
import { fetchGasData } from '@/app/utils/api';

const REFRESH_INTERVAL = 30000; // 30 seconds

export default function GasWise() {
  const [gasData, setGasData] = useState<GasData[]>([]);
  const [historicalData, setHistoricalData] = useState<Map<string, GasData[]>>(new Map());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const loadGasData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const data = await fetchGasData();
      setGasData(data);
      setLastUpdate(new Date());
      
      // Update historical data for charts
      setHistoricalData((prev) => {
        const newHistorical = new Map(prev);
        data.forEach((gasInfo) => {
          const chainHistory = newHistorical.get(gasInfo.chainId) || [];
          // Keep last 24 hours of data (max 1440 points at 1-minute intervals)
          const updatedHistory = [...chainHistory, gasInfo].slice(-1440);
          newHistorical.set(gasInfo.chainId, updatedHistory);
        });
        return newHistorical;
      });
    } catch (error) {
      console.error('Error loading gas data:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    // Initial load
    loadGasData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadGasData, REFRESH_INTERVAL);
    
    return () => clearInterval(interval);
  }, [loadGasData]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      <Header 
        onRefresh={loadGasData} 
        isRefreshing={isRefreshing}
        lastUpdate={lastUpdate}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Best Chain Recommendation */}
        <div className="mb-8">
          <BestChainCard gasData={gasData} />
        </div>
        
        {/* Gas Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {gasData.map((data) => (
            <GasCard key={data.chainId} data={data} />
          ))}
        </div>
        
        {/* Trend Chart */}
        <TrendChart historicalData={historicalData} />
      </main>
    </div>
  );
}

