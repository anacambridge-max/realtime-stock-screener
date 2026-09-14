import {
  getHistoricalData,
  calculateSMA,
  formatDateForAPI,
  CandleData,
} from './upstox';

export interface ScanResult {
  symbol: string;
  ltp: number;
  volumeMultiple: number;
  direction: 'BULLISH BREAKOUT' | 'BEARISH BREAKDOWN';
  prevDayHigh: number;
  prevDayLow: number;
  dailyHigh: number;
  currentVolume: number;
  avgVolume: number;
  triggeredAt: string;
}

export interface ScannerConfig {
  timeframe: '1minute' | '3minute' | '5minute';
  volumeMultiplier: number;
  priceThreshold: number;
}

function getDateKey(timestamp: string): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
  }).format(new Date(timestamp));
}

function getTradingDayGroups(candles: CandleData[]): Map<string, CandleData[]> {
  const groups = new Map<string, CandleData[]>();
  for (const candle of candles) {
    const key = getDateKey(candle.timestamp);
    const existing = groups.get(key);
    if (existing) existing.push(candle);
    else groups.set(key, [candle]);
  }
  return groups;
}

export async function scanStock(
  symbol: string,
  instrumentKey: string,
  config: ScannerConfig,
  accessToken: string
): Promise<ScanResult[]> {
  try {
    const today = new Date();
    const todayStr = formatDateForAPI(today);

    // Pull a 7-day window once. This handles weekends and NSE holidays without
    // guessing the previous trading day, and gives us enough candles for a
    // reliable previous-session volume baseline.
    const from = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fromStr = formatDateForAPI(from);
    const candles = await getHistoricalData(
      instrumentKey,
      config.timeframe,
      fromStr,
      todayStr,
      accessToken
    );

    if (candles.length === 0) return [];

    const groups = getTradingDayGroups(candles);
    const todayCandles = groups.get(todayStr) ?? [];
    if (todayCandles.length === 0) return [];

    const tradingDays = [...groups.keys()].sort();
    const previousTradingDay = tradingDays.filter((day) => day < todayStr).pop();
    if (!previousTradingDay) return [];

    const previousCandles = groups.get(previousTradingDay) ?? [];
    if (previousCandles.length === 0) return [];

    // Use the latest candle as the live signal candle. For volume SMA, use the
    // last 20 completed candles from the previous trading session. This avoids
    // comparing today's partial session against an incomplete SMA.
    const currentCandle = todayCandles[todayCandles.length - 1];
    const baselineVolumes = previousCandles
      .map((candle) => candle.volume)
      .filter((volume) => Number.isFinite(volume) && volume >= 0);
    const avgVolume = calculateSMA(baselineVolumes, 20);

    if (avgVolume <= 0) return [];

    const volumeMultiple = currentCandle.volume / avgVolume;
    if (volumeMultiple <= config.volumeMultiplier) return [];

    const prevDayHigh = Math.max(...previousCandles.map((candle) => candle.high));
    const prevDayLow = Math.min(...previousCandles.map((candle) => candle.low));
    const dailyHigh = Math.max(...todayCandles.map((candle) => candle.high));

    if (dailyHigh <= config.priceThreshold) return [];

    const results: ScanResult[] = [];
    const base = {
      symbol,
      ltp: currentCandle.close,
      volumeMultiple: Number(volumeMultiple.toFixed(2)),
      prevDayHigh,
      prevDayLow,
      dailyHigh,
      currentVolume: currentCandle.volume,
      avgVolume,
      triggeredAt: currentCandle.timestamp,
    };

    if (currentCandle.high > prevDayHigh) {
      results.push({ ...base, direction: 'BULLISH BREAKOUT' });
    }

    if (currentCandle.low < prevDayLow) {
      results.push({ ...base, direction: 'BEARISH BREAKDOWN' });
    }

    return results;
  } catch (error) {
    console.error(`Error scanning ${symbol}:`, error);
    return [];
  }
}

/**
 * Scan with bounded concurrency. Upstox's standard APIs allow 50 requests/sec;
 * one request per stock means a small worker pool is both much faster than the
 * old serial loop and safely below the documented limit.
 */
export async function scanMultipleStocks(
  symbols: string[],
  instrumentKeyMap: { [symbol: string]: string },
  config: ScannerConfig,
  accessToken: string,
  concurrency: number = 10
): Promise<ScanResult[]> {
  const allResults: ScanResult[] = [];
  let cursor = 0;

  async function worker() {
    while (true) {
      const index = cursor++;
      if (index >= symbols.length) return;

      const symbol = symbols[index];
      const instrumentKey = instrumentKeyMap[symbol];
      if (!instrumentKey) continue;

      const results = await scanStock(symbol, instrumentKey, config, accessToken);
      allResults.push(...results);
    }
  }

  const workerCount = Math.min(Math.max(1, concurrency), symbols.length || 1);
  await Promise.all(Array.from({ length: workerCount }, () => worker()));

  return allResults;
}
