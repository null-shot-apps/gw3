'use client';

import { RefreshCw } from 'lucide-react';

interface HeaderProps {
  onRefresh: () => void;
  isRefreshing: boolean;
  lastUpdate: Date | null;
}

export default function Header({ onRefresh, isRefreshing, lastUpdate }: HeaderProps) {
  return (
    <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              ⛽ GasWise
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Real-time gas tracker across multiple chains
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {lastUpdate && (
              <span className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                Updated {lastUpdate.toLocaleTimeString()}
              </span>
            )}
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

