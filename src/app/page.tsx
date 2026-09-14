'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { ScanResult, ScanResponse } from '@/types';

export default function Dashboard() {
  const [timeframe, setTimeframe] = useState<'1minute' | '3minute' | '5minute'>('5minute');
  const [volumeMultiplier, setVolumeMultiplier] = useState(2);
  const [priceThreshold, setPriceThreshold] = useState(50);
  const [autoRefresh, setAutoRefresh] = useState(30);
  const [results, setResults] = useState<ScanResult[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [lastScanned, setLastScanned] = useState('');
  const [scanDuration, setScanDuration] = useState<number | null>(null);
  const [scannedCount, setScannedCount] = useState(0);
  const [totalStocks, setTotalStocks] = useState(30);
  const [marketOpen, setMarketOpen] = useState<boolean | null>(null);
  const [statusMessage, setStatusMessage] = useState('Ready to scan');
  const [error, setError] = useState('');
  const scanningRef = useRef(false);

  const performScan = useCallback(async () => {
    if (scanningRef.current) return;

    scanningRef.current = true;
    setIsScanning(true);
    setError('');
    setStatusMessage('Scanning F&O stocks...');

    try {
      const response = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timeframe, volumeMultiplier, priceThreshold }),
        cache: 'no-store',
      });

      const data = (await response.json()) as ScanResponse & { error?: string; message?: string };
      if (!response.ok) throw new Error(data.message || data.error || 'Failed to scan');

      setResults(data.results || []);
      setScannedCount(data.scanned ?? 0);
      setTotalStocks(data.totalStocks ?? 30);
      setMarketOpen(data.marketOpen ?? null);
      setScanDuration(data.durationMs ?? null);
      setLastScanned(new Date().toLocaleTimeString('en-IN'));
      setStatusMessage(data.message || `${data.count} matching signal${data.count === 1 ? '' : 's'} found`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to scan stocks');
      setStatusMessage('Scan failed');
    } finally {
      scanningRef.current = false;
      setIsScanning(false);
    }
  }, [timeframe, volumeMultiplier, priceThreshold]);

  useEffect(() => {
    performScan();
  }, [performScan]);

  useEffect(() => {
    if (autoRefresh <= 0) return;
    const interval = setInterval(performScan, autoRefresh * 1000);
    return () => clearInterval(interval);
  }, [autoRefresh, performScan]);

  const directionClass = (direction: string) =>
    direction === 'BULLISH BREAKOUT'
      ? 'text-green-400 bg-green-900/20'
      : 'text-red-400 bg-red-900/20';

  const rowClass = (direction: string) =>
    direction === 'BULLISH BREAKOUT'
      ? 'bg-green-900/10 hover:bg-green-900/20'
      : 'bg-red-900/10 hover:bg-red-900/20';

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <div className="bg-gray-900 border-b border-gray-800 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4">
            <div>
              <h1 className="text-3xl font-bold text-blue-400">📊 Real-Time Stock Scanner</h1>
              <p className="text-xs text-gray-500 mt-1">NSE F&O • Upstox • 09:15–15:30 IST</p>
            </div>
            <div className={`px-3 py-1.5 rounded-full text-sm font-semibold ${
              marketOpen === true ? 'bg-green-900/30 text-green-400' :
              marketOpen === false ? 'bg-gray-800 text-gray-400' : 'bg-blue-900/30 text-blue-400'
            }`}>
              {marketOpen === true ? '● MARKET OPEN' : marketOpen === false ? '● MARKET CLOSED' : '● CHECKING MARKET'}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Timeframe</label>
              <div className="flex gap-2">
                {(['1minute', '3minute', '5minute'] as const).map((tf) => (
                  <button key={tf} onClick={() => setTimeframe(tf)} className={`px-4 py-2 rounded font-medium ${timeframe === tf ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}>
                    {tf.replace('minute', 'min')}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Volume Multiplier</label>
              <select value={volumeMultiplier} onChange={(e) => setVolumeMultiplier(Number(e.target.value))} className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded text-gray-100">
                <option value="1.5">1.5x</option><option value="2">2x</option><option value="3">3x</option><option value="4">4x</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Min Price</label>
              <input type="number" value={priceThreshold} min="0" step="10" onChange={(e) => setPriceThreshold(Number(e.target.value) || 50)} className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded text-gray-100" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Auto Refresh</label>
              <select value={autoRefresh} onChange={(e) => setAutoRefresh(Number(e.target.value))} className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded text-gray-100">
                <option value="0">Off</option><option value="15">15s</option><option value="30">30s</option><option value="60">1min</option>
              </select>
            </div>

            <div className="flex items-end">
              <button onClick={performScan} disabled={isScanning} className={`w-full px-6 py-2 rounded font-medium ${isScanning ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
                {isScanning ? '⟳ Scanning...' : 'Scan Now'}
              </button>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-2 text-sm">
            <div className="bg-gray-950 rounded px-3 py-2"><span className="text-gray-500">F&O Stocks</span><br /><b>{totalStocks}</b></div>
            <div className="bg-gray-950 rounded px-3 py-2"><span className="text-gray-500">Scanned</span><br /><b>{scannedCount}/{totalStocks}</b></div>
            <div className="bg-gray-950 rounded px-3 py-2"><span className="text-gray-500">Signals</span><br /><b className={results.length ? 'text-yellow-400' : ''}>{results.length}</b></div>
            <div className="bg-gray-950 rounded px-3 py-2"><span className="text-gray-500">Scan Time</span><br /><b>{scanDuration !== null ? `${(scanDuration / 1000).toFixed(1)}s` : '—'}</b></div>
            <div className="bg-gray-950 rounded px-3 py-2"><span className="text-gray-500">Last Scan</span><br /><b>{lastScanned || '—'}</b></div>
          </div>

          <div className="mt-3 text-sm text-gray-400">{statusMessage}</div>
          {error && <div className="mt-3 p-3 bg-red-900/20 border border-red-800 rounded text-red-400">⚠️ {error}</div>}
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {results.length === 0 && !isScanning && (
          <div className="text-center py-12 text-gray-500">
            {marketOpen === false ? 'Market is closed. Scanner will work during NSE market hours (09:15–15:30 IST).' : error ? 'No results because the scan failed.' : 'No stocks matching the current conditions.'}
          </div>
        )}

        {results.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead><tr className="bg-gray-900 border-b border-gray-800">
                {['Symbol', 'Direction', 'LTP', 'Volume (x)', 'Prev Day High', 'Prev Day Low', 'Daily High', 'Time'].map((header) => (
                  <th key={header} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">{header}</th>
                ))}
              </tr></thead>
              <tbody>
                {results.map((result, index) => (
                  <tr key={`${result.symbol}-${result.direction}-${index}`} className={`border-b border-gray-800 transition-colors ${rowClass(result.direction)}`}>
                    <td className="px-4 py-3 font-semibold text-white">{result.symbol}</td>
                    <td className="px-4 py-3"><span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${directionClass(result.direction)}`}>{result.direction}</span></td>
                    <td className="px-4 py-3 text-right font-mono">₹{result.ltp.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right font-mono font-semibold text-yellow-400">{result.volumeMultiple.toFixed(2)}x</td>
                    <td className="px-4 py-3 text-right font-mono text-gray-300">₹{result.prevDayHigh.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right font-mono text-gray-300">₹{result.prevDayLow.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right font-mono text-gray-300">₹{result.dailyHigh.toFixed(2)}</td>
                    <td className="px-4 py-3 text-gray-400 text-sm">{new Date(result.triggeredAt).toLocaleTimeString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="container mx-auto px-4 py-6 mt-8 border-t border-gray-800 text-sm text-gray-500 space-y-2">
        <p><strong className="text-gray-400">Logic:</strong> Current candle volume &gt; previous trading day's SMA(20) × {volumeMultiplier}, AND current candle breaks previous day's high/low, AND today's high &gt; ₹{priceThreshold}.</p>
        <p><strong className="text-gray-400">Universe:</strong> NSE F&O stocks only. Scanning is performed with bounded concurrency to reduce latency while respecting Upstox API limits.</p>
      </div>
    </div>
  );
}
