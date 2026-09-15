import {
  getHistoricalData,
  getIntradayData,
  calculateSMA,
  formatDateForAPI,
  CandleData,
} from './upstox';

export type SignalDirection = 'BULLISH BREAKOUT' | 'BEARISH BREAKDOWN';

export interface ScanResult {
  symbol: string;
  ltp: number;
  dayChange: number;
  dayChangePercent: number;
  volumeMultiple: number;
  direction: SignalDirection;
  setup: 'BREAKOUT' | 'BREAKDOWN';
  confirmed: boolean;
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
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date(timestamp));
}

function getTradingDayGroups(candles: CandleData[]): Map<string, CandleData[]> {
  const groups = new Map<string, CandleData[]>();
  for (const candle of candles) {
    const key = getDateKey(candle.timestamp);
    const existing = groups.get(key);
    if (existing) existing.push(candle);
    else groups.set(key, [candle]);
  }
  for (const dayCandles of groups.values()) {
    dayCandles.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
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
    const fromStr = formatDateForAPI(new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000));

    const [historicalCandles, todayCandlesRaw] = await Promise.all([
      getHistoricalData(instrumentKey, config.timeframe, fromStr, todayStr, accessToken),
      getIntradayData(instrumentKey, config.timeframe, accessToken),
    ]);

    const groups = getTradingDayGroups(historicalCandles);
    const tradingDays = [...groups.keys()].filter((day) => day < todayStr).sort();
    const previousTradingDay = tradingDays.pop();
    if (!previousTradingDay) return [];

    const previousCandles = groups.get(previousTradingDay) ?? [];
    const todayCandles = [...todayCandlesRaw].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    if (!previousCandles.length || !todayCandles.length) return [];

    const currentCandle = todayCandles[todayCandles.length - 1];
    const previousClose = previousCandles[previousCandles.length - 1].close;
    if (!Number.isFinite(previousClose) || previousClose <= 0) return [];

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

    const dayChange = currentCandle.close - previousClose;
    const dayChangePercent = (dayChange / previousClose) * 100;

    const base = {
      symbol,
      ltp: currentCandle.close,
      dayChange: Number(dayChange.toFixed(2)),
      dayChangePercent: Number(dayChangePercent.toFixed(2)),
      volumeMultiple: Number(volumeMultiple.toFixed(2)),
      prevDayHigh,
      prevDayLow,
      dailyHigh,
      currentVolume: currentCandle.volume,
      avgVolume,
      triggeredAt: currentCandle.timestamp,
      confirmed: true,
    };

    const results: ScanResult[] = [];
    if (currentCandle.high > prevDayHigh) {
      results.push({ ...base, direction: 'BULLISH BREAKOUT', setup: 'BREAKOUT' });
    }
    if (currentCandle.low < prevDayLow) {
      results.push({ ...base, direction: 'BEARISH BREAKDOWN', setup: 'BREAKDOWN' });
    }
    return results;
  } catch (error) {
    console.error(`Error scanning ${symbol}:`, error);
    return [];
  }
}

export async function scanMultipleStocks(
  symbols: string[],
  instrumentKeyMap: { [symbol: string]: string },
  config: ScannerConfig,
  accessToken: string,
  concurrency = 15
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
