'use client';

import { useState, useEffect, useCallback } from 'react';
import { ScanResult } from '@/lib/scanner';

export default function Dashboard() {
  const [timeframe, setTimeframe] = useState<'1minute' | '3minute' | '5minute'>('5minute');
  const [volumeMultiplier, setVolumeMultiplier] = useState<number>(2);
  const [priceThreshold, setPriceThreshold] = useState<number>(50);
  const [autoRefresh, setAutoRefresh] = useState<number>(30); // seconds
  const [results, setResults] = useState<ScanResult[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [lastScanned, setLastScanned] = useState<string>('');
  const [error, setError] = useState<string>('');

  const performScan = useCallback(async () => {
    setIsScanning(true);
    setError('');
    
    try {
      const response = await fetch('/api/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          timeframe,
          volumeMultiplier,
          priceThreshold,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to scan');
      }

      setResults(data.results || []);
      setLastScanned(new Date().toLocaleTimeString('en-IN'));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to scan stocks');
      console.error('Scan error:', err);
    } finally {
      setIsScanning(false);
    }
  }, [timeframe, volumeMultiplier, priceThreshold]);

  // Auto-refresh effect
  useEffect(() => {
    if (autoRefresh > 0) {
      const interval = setInterval(() => {
        performScan();
      }, autoRefresh * 1000);

      return () => clearInterval(interval);
    }
  }, [autoRefresh, performScan]);

  // Initial scan on mount
  useEffect(() => {
    performScan();
  }, []);

  // Re-scan when timeframe changes
  useEffect(() => {
    performScan();
  }, [timeframe]);

  const getDirectionColor = (direction: string) => {
    return direction === 'BULLISH BREAKOUT' 
      ? 'text-green-400 bg-green-900/20' 
      : 'text-red-400 bg-red-900/20';
  };

  const getRowColor = (direction: string) => {
    return direction === 'BULLISH BREAKOUT'
      ? 'bg-green-900/10 hover:bg-green-900/20'
      : 'bg-red-900/10 hover:bg-red-900/20';
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-3xl font-bold text-blue-400 mb-4">
            📊 Real-Time Stock Scanner
          </h1>
          
          {/* Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Timeframe Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Timeframe
              </label>
              <div className="flex gap-2">
                {(['1minute', '3minute', '5minute'] as const).map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setTimeframe(tf)}
                    className={`px-4 py-2 rounded font-medium transition-colors ${
                      timeframe === tf
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    {tf.replace('minute', 'min')}
                  </button>
                ))}
              </div>
            </div>

            {/* Volume Multiplier */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Volume Multiplier
              </label>
              <select
                value={volumeMultiplier}
                onChange={(e) => setVolumeMultiplier(parseFloat(e.target.value))}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded text-gray-100 focus:outline-none focus:border-blue-500"
              >
                <option value="1.5">1.5x</option>
                <option value="2">2x</option>
                <option value="3">3x</option>
                <option value="4">4x</option>
              </select>
            </div>

            {/* Price Threshold */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Min Price
              </label>
              <input
                type="number"
                value={priceThreshold}
                onChange={(e) => setPriceThreshold(parseFloat(e.target.value) || 50)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded text-gray-100 focus:outline-none focus:border-blue-500"
                min="0"
                step="10"
              />
            </div>

            {/* Auto Refresh */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Auto Refresh
              </label>
              <select
                value={autoRefresh}
                onChange={(e) => setAutoRefresh(parseInt(e.target.value))}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded text-gray-100 focus:outline-none focus:border-blue-500"
              >
                <option value="0">Off</option>
                <option value="15">15s</option>
                <option value="30">30s</option>
                <option value="60">1min</option>
              </select>
            </div>

            {/* Scan Button */}
            <div className="flex items-end">
              <button
                onClick={performScan}
                disabled={isScanning}
                className={`w-full px-6 py-2 rounded font-medium transition-colors ${
                  isScanning
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isScanning ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Scanning...
                  </span>
                ) : (
                  'Scan Now'
                )}
              </button>
            </div>
          </div>

          {/* Status Bar */}
          <div className="mt-4 flex items-center justify-between text-sm">
            <div className="text-gray-400">
              {lastScanned && (
                <span>Last scanned: {lastScanned}</span>
              )}
            </div>
            <div className="text-gray-400">
              Found: <span className="text-white font-semibold">{results.length}</span> stocks
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-4 bg-red-900/20 border border-red-800 rounded text-red-400">
              ⚠️ {error}
            </div>
          )}
        </div>
      </div>

      {/* Results Table */}
      <div className="container mx-auto px-4 py-6">
        {results.length === 0 && !isScanning && (
          <div className="text-center py-12 text-gray-500">
            {error ? 'No results due to error' : 'No stocks matching criteria found. Try adjusting filters.'}
          </div>
        )}

        {results.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-900 border-b border-gray-800">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Symbol
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Direction
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    LTP
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Volume (x)
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Prev Day High
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Prev Day Low
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Daily High
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody>
                {results.map((result, index) => (
                  <tr
                    key={`${result.symbol}-${result.direction}-${index}`}
                    className={`border-b border-gray-800 transition-colors ${getRowColor(result.direction)}`}
                  >
                    <td className="px-4 py-3 font-semibold text-white">
                      {result.symbol}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getDirectionColor(result.direction)}`}>
                        {result.direction}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-white">
                      ₹{result.ltp.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-semibold text-yellow-400">
                      {result.volumeMultiple.toFixed(2)}x
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-gray-300">
                      ₹{result.prevDayHigh.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-gray-300">
                      ₹{result.prevDayLow.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-gray-300">
                      ₹{result.dailyHigh.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-sm">
                      {new Date(result.triggeredAt).toLocaleTimeString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="container mx-auto px-4 py-6 mt-8 border-t border-gray-800">
        <div className="text-sm text-gray-500 space-y-2">
          <p>
            <strong className="text-gray-400">Scanner Logic:</strong> Volume &gt; SMA(20) × {volumeMultiplier}x 
            AND (High &gt; Prev Day High OR Low &lt; Prev Day Low) 
            AND Daily High &gt; ₹{priceThreshold}
          </p>
          <p>
            <strong className="text-gray-400">Data Source:</strong> Upstox API v3 | 
            <strong className="text-gray-400 ml-4">Stocks:</strong> NSE F&O Universe ({results.length > 0 ? results.filter((r, i, arr) => arr.findIndex(x => x.symbol === r.symbol) === i).length : '30'} symbols scanned)
          </p>
        </div>
      </div>
    </div>
  );
}
