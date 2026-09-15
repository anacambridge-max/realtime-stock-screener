'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type { ScanResult, ScanResponse } from '@/types';

type Tab = 'all' | 'bullish' | 'bearish' | 'confirmed';
type SortKey = 'symbol' | 'ltp' | 'dayChange' | 'dayChangePercent' | 'volumeMultiple' | 'direction' | 'setup' | 'firstSeen' | 'lastSeen';
type SortDirection = 'asc' | 'desc';
type DailyStock = ScanResult & { firstSeen: string; lastSeen: string };

const STORAGE_PREFIX = 'realtime-stock-screener:day:';
function getIndiaDateKey(date = new Date()): string { return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(date); }
function formatTime(value: string) { return new Date(value).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }); }
function formatNumber(value: number) { return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(value); }

export default function Dashboard() {
  const [timeframe, setTimeframe] = useState<'1minute' | '3minute' | '5minute'>('1minute');
  const [volumeMultiplier, setVolumeMultiplier] = useState(2);
  const [priceThreshold, setPriceThreshold] = useState(50);
  const [autoRefresh, setAutoRefresh] = useState(30);
  const [dailyResults, setDailyResults] = useState<DailyStock[]>([]);
  const [tab, setTab] = useState<Tab>('all');
  const [sortKey, setSortKey] = useState<SortKey>('lastSeen');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [newTodayCount, setNewTodayCount] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const [lastScanned, setLastScanned] = useState('');
  const [scanDuration, setScanDuration] = useState<number | null>(null);
  const [scannedCount, setScannedCount] = useState(0);
  const [totalStocks, setTotalStocks] = useState(0);
  const [marketOpen, setMarketOpen] = useState<boolean | null>(null);
  const [statusMessage, setStatusMessage] = useState('Ready to scan');
  const [error, setError] = useState('');
  const [hydrated, setHydrated] = useState(false);
  const scanningRef = useRef(false);
  const storageKey = `${STORAGE_PREFIX}${getIndiaDateKey()}`;

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) { const parsed = JSON.parse(raw) as DailyStock[]; if (Array.isArray(parsed)) setDailyResults(parsed); }
    } catch (storageError) { console.error('Unable to restore daily scanner list:', storageError); }
    finally { setHydrated(true); }
  }, [storageKey]);

  useEffect(() => {
    if (!hydrated) return;
    try { window.localStorage.setItem(storageKey, JSON.stringify(dailyResults)); }
    catch (storageError) { console.error('Unable to save daily scanner list:', storageError); }
  }, [dailyResults, hydrated, storageKey]);

  const performScan = useCallback(async () => {
    if (scanningRef.current) return;
    scanningRef.current = true; setIsScanning(true); setError(''); setStatusMessage('Scanning current NSE F&O universe...');
    try {
      const response = await fetch('/api/scan', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ timeframe, volumeMultiplier, priceThreshold }), cache: 'no-store' });
      const data = (await response.json()) as ScanResponse & { error?: string; message?: string };
      if (!response.ok) throw new Error(data.message || data.error || 'Failed to scan');
      const seenAt = data.scannedAt || new Date().toISOString();
      const incoming = data.results || [];
      const previousSymbols = new Set(dailyResults.map((item) => item.symbol));
      const bySymbol = new Map(dailyResults.map((item) => [item.symbol, item]));
      for (const result of incoming) {
        const existing = bySymbol.get(result.symbol);
        bySymbol.set(result.symbol, { ...existing, ...result, firstSeen: existing?.firstSeen || result.triggeredAt || seenAt, lastSeen: seenAt });
      }
      const merged = [...bySymbol.values()];
      setDailyResults(merged);
      setNewTodayCount(incoming.filter((item) => !previousSymbols.has(item.symbol)).length);
      setScannedCount(data.scanned ?? 0); setTotalStocks(data.totalStocks ?? 0); setMarketOpen(data.marketOpen ?? null);
      setScanDuration(data.durationMs ?? null); setLastScanned(new Date().toLocaleTimeString('en-IN'));
      setStatusMessage(incoming.length ? `${incoming.length} new/updated signal${incoming.length === 1 ? '' : 's'} • ${merged.length} stock${merged.length === 1 ? '' : 's'} retained for today` : `${merged.length} stock${merged.length === 1 ? '' : 's'} retained for today • no new signal on this scan`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to scan stocks');
      setStatusMessage("Scan failed — today's saved list is still preserved");
    } finally { scanningRef.current = false; setIsScanning(false); }
  }, [dailyResults, priceThreshold, timeframe, volumeMultiplier]);

  useEffect(() => { if (hydrated) performScan(); }, [hydrated, performScan]);
  useEffect(() => { if (autoRefresh <= 0 || !hydrated) return; const interval = setInterval(performScan, autoRefresh * 1000); return () => clearInterval(interval); }, [autoRefresh, hydrated, performScan]);

  const bullishCount = dailyResults.filter((item) => item.direction === 'BULLISH BREAKOUT').length;
  const bearishCount = dailyResults.filter((item) => item.direction === 'BEARISH BREAKDOWN').length;
  const confirmedCount = dailyResults.filter((item) => item.confirmed).length;

  const visibleResults = useMemo(() => {
    const filtered = dailyResults.filter((item) => tab === 'bullish' ? item.direction === 'BULLISH BREAKOUT' : tab === 'bearish' ? item.direction === 'BEARISH BREAKDOWN' : tab === 'confirmed' ? item.confirmed : true);
    return [...filtered].sort((a, b) => {
      let comparison = 0;
      if (sortKey === 'symbol' || sortKey === 'direction' || sortKey === 'setup') comparison = String(a[sortKey]).localeCompare(String(b[sortKey]));
      else if (sortKey === 'firstSeen' || sortKey === 'lastSeen') comparison = new Date(String(a[sortKey])).getTime() - new Date(String(b[sortKey])).getTime();
      else comparison = Number(a[sortKey]) - Number(b[sortKey]);
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [dailyResults, sortKey, sortDirection, tab]);

  const sortBy = (key: SortKey) => {
    if (sortKey === key) setSortDirection((current) => current === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDirection(key === 'symbol' || key === 'direction' || key === 'setup' ? 'asc' : 'desc'); }
  };
  const clearToday = () => {
    if (!window.confirm("Clear today's saved scanner list?")) return;
    setDailyResults([]); setNewTodayCount(0); window.localStorage.removeItem(storageKey); setStatusMessage("Today's saved list cleared");
  };
  const tabButton = (value: Tab, label: string, count: number, icon: string, activeClass: string) => <button onClick={() => setTab(value)} className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition ${tab === value ? activeClass : 'border-gray-800 bg-gray-900/70 text-gray-300 hover:border-gray-700 hover:bg-gray-800'}`}><span className="text-base">{icon}</span>{label} <span className="opacity-80">({count})</span></button>;
  const sortIcon = (key: SortKey) => sortKey === key ? (sortDirection === 'asc' ? '↑' : '↓') : '↕';
  const SortHeader = ({ label, sort }: { label: string; sort: SortKey }) => <button onClick={() => sortBy(sort)} className="flex w-full items-center justify-between gap-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 hover:text-white"><span>{label}</span><span className={sortKey === sort ? 'text-blue-400' : 'text-gray-600'}>{sortIcon(sort)}</span></button>;

  return <div className="min-h-screen bg-gray-950 text-gray-100">
    <header className="sticky top-0 z-20 border-b border-gray-800 bg-gray-900/95 backdrop-blur"><div className="container mx-auto px-4 py-4">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"><div><h1 className="text-2xl font-bold text-blue-400 md:text-3xl">📊 Real-Time Stock Scanner</h1><p className="mt-1 text-xs text-gray-500">NSE F&O • Upstox • 09:15–15:30 IST • Daily signal memory enabled</p></div><div className={`rounded-full px-4 py-2 text-sm font-semibold ${marketOpen === true ? 'bg-green-900/30 text-green-400' : marketOpen === false ? 'bg-gray-800 text-gray-400' : 'bg-blue-900/30 text-blue-400'}`}>{marketOpen === true ? '● MARKET OPEN' : marketOpen === false ? '● MARKET CLOSED' : '● CHECKING MARKET'}</div></div>
      <div className="mb-4 grid grid-cols-2 gap-2 md:grid-cols-4">{tabButton('all','All Stocks',dailyResults.length,'▦','border-blue-500 bg-blue-600 text-white')}{tabButton('bullish','Bullish',bullishCount,'↗','border-green-500 bg-green-900/40 text-green-300')}{tabButton('bearish','Bearish',bearishCount,'↘','border-red-500 bg-red-900/40 text-red-300')}{tabButton('confirmed','Confirmed Setups',confirmedCount,'★','border-yellow-500 bg-yellow-900/30 text-yellow-300')}</div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-5">
        <div><label className="mb-2 block text-sm font-medium text-gray-300">Timeframe</label><div className="flex gap-2">{(['1minute','3minute','5minute'] as const).map((tf)=><button key={tf} onClick={()=>setTimeframe(tf)} className={`rounded px-4 py-2 font-medium ${timeframe===tf?'bg-blue-600 text-white':'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}>{tf.replace('minute','min')}</button>)}</div></div>
        <div><label className="mb-2 block text-sm font-medium text-gray-300">Volume Multiplier</label><select value={volumeMultiplier} onChange={(e)=>setVolumeMultiplier(Number(e.target.value))} className="w-full rounded border border-gray-700 bg-gray-800 px-4 py-2 text-gray-100"><option value="1.5">1.5x</option><option value="2">2x</option><option value="3">3x</option><option value="4">4x</option></select></div>
        <div><label className="mb-2 block text-sm font-medium text-gray-300">Min Price (₹)</label><input type="number" value={priceThreshold} min="0" step="10" onChange={(e)=>setPriceThreshold(Number(e.target.value)||50)} className="w-full rounded border border-gray-700 bg-gray-800 px-4 py-2 text-gray-100" /></div>
        <div><label className="mb-2 block text-sm font-medium text-gray-300">Auto Refresh</label><select value={autoRefresh} onChange={(e)=>setAutoRefresh(Number(e.target.value))} className="w-full rounded border border-gray-700 bg-gray-800 px-4 py-2 text-gray-100"><option value="0">Off</option><option value="15">15s</option><option value="30">30s</option><option value="60">1min</option></select></div>
        <div className="flex items-end gap-2"><button onClick={performScan} disabled={isScanning} className={`flex-1 rounded px-5 py-2 font-semibold ${isScanning?'cursor-not-allowed bg-gray-700 text-gray-400':'bg-blue-600 text-white hover:bg-blue-700'}`}>{isScanning?'⟳ Scanning...':'↻ Scan Now'}</button><button onClick={clearToday} className="rounded border border-gray-700 bg-gray-800 px-4 py-2 text-gray-300 hover:bg-gray-700">Clear</button></div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 text-sm md:grid-cols-4 lg:grid-cols-8"><div className="rounded bg-gray-950 px-3 py-2"><span className="text-gray-500">F&O Stocks</span><br/><b>{totalStocks||'—'}</b></div><div className="rounded bg-gray-950 px-3 py-2"><span className="text-gray-500">Scanned</span><br/><b>{scannedCount}/{totalStocks||'—'}</b></div><div className="rounded bg-gray-950 px-3 py-2"><span className="text-green-500">Bullish</span><br/><b className="text-green-400">{bullishCount}</b></div><div className="rounded bg-gray-950 px-3 py-2"><span className="text-red-500">Bearish</span><br/><b className="text-red-400">{bearishCount}</b></div><div className="rounded bg-gray-950 px-3 py-2"><span className="text-yellow-500">Confirmed</span><br/><b className="text-yellow-400">{confirmedCount}</b></div><div className="rounded bg-gray-950 px-3 py-2"><span className="text-purple-400">New Today</span><br/><b className="text-purple-300">{newTodayCount}</b></div><div className="rounded bg-gray-950 px-3 py-2"><span className="text-gray-500">Scan Time</span><br/><b>{scanDuration!==null?`${(scanDuration/1000).toFixed(1)}s`:'—'}</b></div><div className="rounded bg-gray-950 px-3 py-2"><span className="text-gray-500">Last Scan</span><br/><b>{lastScanned||'—'}</b></div></div>
      <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-gray-400"><span>{statusMessage}</span><span className="text-green-400">• Stocks remain saved for the whole IST trading day once they appear.</span></div>{error&&<div className="mt-3 rounded border border-red-800 bg-red-900/20 p-3 text-red-400">⚠️ {error}</div>}
    </div></header>
    <main className="container mx-auto px-4 py-6">{visibleResults.length===0&&!isScanning?<div className="rounded-xl border border-gray-800 bg-gray-900/40 py-16 text-center text-gray-500">{dailyResults.length===0?'No stocks have triggered a signal yet today.':'No stocks in this tab.'}</div>:<div className="overflow-hidden rounded-xl border border-gray-800 bg-gray-950 shadow-2xl"><div className="flex items-center justify-between border-b border-gray-800 bg-gray-900 px-4 py-3"><div><span className="font-semibold text-white">Today&apos;s Signal List</span><span className="ml-2 text-xs text-gray-500">{visibleResults.length} shown • {dailyResults.length} unique today</span></div><span className="hidden text-xs text-gray-500 md:inline">Click any heading to sort ↑↓</span></div><div className="overflow-x-auto"><table className="min-w-[1200px] w-full border-collapse"><thead><tr className="border-b border-gray-800 bg-gray-900/80"><th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">#</th><th className="px-4 py-3"><SortHeader label="Symbol" sort="symbol"/></th><th className="px-4 py-3"><SortHeader label="LTP (₹)" sort="ltp"/></th><th className="px-4 py-3"><SortHeader label="Change (₹)" sort="dayChange"/></th><th className="px-4 py-3"><SortHeader label="Change (%)" sort="dayChangePercent"/></th><th className="px-4 py-3"><SortHeader label="Volume" sort="volumeMultiple"/></th><th className="px-4 py-3"><SortHeader label="Signal" sort="direction"/></th><th className="px-4 py-3"><SortHeader label="Setup" sort="setup"/></th><th className="px-4 py-3"><SortHeader label="First Seen" sort="firstSeen"/></th><th className="px-4 py-3"><SortHeader label="Last Seen" sort="lastSeen"/></th><th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Action</th></tr></thead><tbody>{visibleResults.map((result,index)=>{const bullish=result.direction==='BULLISH BREAKOUT';return <tr key={result.symbol} className={`border-b border-gray-800 transition-colors ${bullish?'bg-green-950/10 hover:bg-green-950/20':'bg-red-950/10 hover:bg-red-950/20'}`}><td className="px-4 py-3 text-sm text-gray-500">{index+1}</td><td className="px-4 py-3 font-bold text-white"><button onClick={()=>window.open(`https://in.tradingview.com/symbols/NSE-${result.symbol}/`,'_blank','noopener,noreferrer')} className="hover:text-blue-400 hover:underline">{result.symbol}</button></td><td className="px-4 py-3 text-right font-mono">₹{formatNumber(result.ltp)}</td><td className={`px-4 py-3 text-right font-mono font-semibold ${result.dayChange>=0?'text-green-400':'text-red-400'}`}>{result.dayChange>=0?'+':''}{formatNumber(result.dayChange)}</td><td className={`px-4 py-3 text-right font-mono font-bold ${result.dayChangePercent>=0?'text-green-400':'text-red-400'}`}>{result.dayChangePercent>=0?'+':''}{result.dayChangePercent.toFixed(2)}%</td><td className="px-4 py-3 text-right font-mono font-semibold text-yellow-400">{result.volumeMultiple.toFixed(2)}x</td><td className="px-4 py-3"><span className={`inline-flex rounded-lg px-3 py-1 text-xs font-semibold ${bullish?'bg-green-900/60 text-green-300':'bg-red-900/60 text-red-300'}`}>{bullish?'↗ Bullish':'↘ Bearish'}</span></td><td className="px-4 py-3"><span className={`inline-flex rounded-lg px-3 py-1 text-xs font-semibold ${bullish?'bg-blue-900/70 text-blue-300':'bg-red-900/50 text-red-300'}`}>{result.setup}</span>{result.confirmed&&<span className="ml-2 text-yellow-400" title="Confirmed setup">★</span>}</td><td className="px-4 py-3 text-sm text-gray-400">{formatTime(result.firstSeen)}</td><td className="px-4 py-3 text-sm text-gray-400">{formatTime(result.lastSeen)}</td><td className="px-4 py-3"><button onClick={()=>window.open(`https://in.tradingview.com/symbols/NSE-${result.symbol}/`,'_blank','noopener,noreferrer')} className="rounded-full border border-gray-700 bg-gray-800 px-4 py-1.5 text-xs font-semibold text-gray-200 hover:border-blue-500 hover:text-blue-300">↗ View</button></td></tr>})}</tbody></table></div></div>}</main>
    <footer className="container mx-auto space-y-2 border-t border-gray-800 px-4 py-6 text-sm text-gray-500"><p><strong className="text-gray-400">Logic:</strong> Current candle volume &gt; previous trading day&apos;s SMA(20) × {volumeMultiplier}, AND current candle breaks previous day&apos;s high/low, AND today&apos;s high &gt; ₹{priceThreshold}.</p><p><strong className="text-gray-400">Daily memory:</strong> Once a stock triggers during the day, it is stored in this browser and remains in Today&apos;s Signal List through later scans. First Seen is never overwritten; Last Seen updates when the stock triggers again.</p><p><strong className="text-gray-400">Universe:</strong> Current NSE F&O stocks only, loaded dynamically from Upstox&apos;s instrument master.</p></footer>
  </div>;
}
