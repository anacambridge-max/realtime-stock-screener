import {
  getHistoricalData,
  calculateSMA,
  getPreviousTradingDay,
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
  volumeMultiplier: number; // 1.5, 2, 3, 4
  priceThreshold: number; // default 50
}

// Main scanner function
export async function scanStock(
  symbol: string,
  instrumentKey: string,
  config: ScannerConfig,
  accessToken: string
): Promise<ScanResult[]> {
  const results: ScanResult[] = [];

  try {
    const today = new Date();
    const todayStr = formatDateForAPI(today);
    const prevDay = getPreviousTradingDay(today);
    const prevDayStr = formatDateForAPI(prevDay);

    // Fetch intraday candles for selected timeframe (last 100 candles for SMA calculation)
    const intradayCandles = await getHistoricalData(
      instrumentKey,
      config.timeframe,
      todayStr, // from date
      todayStr, // to date
      accessToken
    );

    if (intradayCandles.length === 0) {
      return results;
    }

    // Get the latest (current) candle
    const currentCandle = intradayCandles[intradayCandles.length - 1];

    // Calculate volume SMA(20)
    const volumes = intradayCandles.map((c) => c.volume);
    const volumeSMA = calculateSMA(volumes, 20);

    // CONDITION 1: Volume filter
    const volumeCondition = currentCandle.volume > volumeSMA * config.volumeMultiplier;
    
    if (!volumeCondition) {
      return results; // Volume condition not met
    }

    // Fetch previous day's daily candle
    const prevDayCandles = await getHistoricalData(
      instrumentKey,
      'day',
      prevDayStr,
      prevDayStr,
      accessToken
    );

    if (prevDayCandles.length === 0) {
      return results;
    }

    const prevDayCandle = prevDayCandles[0];
    const prevDayHigh = prevDayCandle.high;
    const prevDayLow = prevDayCandle.low;

    // Fetch today's daily candle for the price filter
    const todayDailyCandles = await getHistoricalData(
      instrumentKey,
      'day',
      todayStr,
      todayStr,
      accessToken
    );

    if (todayDailyCandles.length === 0) {
      return results;
    }

    const todayDailyCandle = todayDailyCandles[0];
    const dailyHigh = todayDailyCandle.high;

    // CONDITION 4: Price filter (Daily High > threshold)
    const priceCondition = dailyHigh > config.priceThreshold;

    if (!priceCondition) {
      return results; // Price condition not met
    }

    // CONDITION 3: Breakout filter (OR condition - can match both)
    const bullishBreakout = currentCandle.high > prevDayHigh;
    const bearishBreakdown = currentCandle.low < prevDayLow;

    const volumeMultiple = currentCandle.volume / volumeSMA;

    // Add results based on breakout direction
    if (bullishBreakout) {
      results.push({
        symbol,
        ltp: currentCandle.close,
        volumeMultiple: parseFloat(volumeMultiple.toFixed(2)),
        direction: 'BULLISH BREAKOUT',
        prevDayHigh,
        prevDayLow,
        dailyHigh,
        currentVolume: currentCandle.volume,
        avgVolume: volumeSMA,
        triggeredAt: currentCandle.timestamp,
      });
    }

    if (bearishBreakdown) {
      results.push({
        symbol,
        ltp: currentCandle.close,
        volumeMultiple: parseFloat(volumeMultiple.toFixed(2)),
        direction: 'BEARISH BREAKDOWN',
        prevDayHigh,
        prevDayLow,
        dailyHigh,
        currentVolume: currentCandle.volume,
        avgVolume: volumeSMA,
        triggeredAt: currentCandle.timestamp,
      });
    }

    return results;
  } catch (error) {
    console.error(`Error scanning ${symbol}:`, error);
    return results;
  }
}

// Batch process stocks with rate limiting
export async function scanMultipleStocks(
  symbols: string[],
  instrumentKeyMap: { [symbol: string]: string },
  config: ScannerConfig,
  accessToken: string,
  delayMs: number = 500 // Rate limiting delay between API calls
): Promise<ScanResult[]> {
  const allResults: ScanResult[] = [];

  for (const symbol of symbols) {
    const instrumentKey = instrumentKeyMap[symbol];
    if (!instrumentKey) {
      console.warn(`No instrument key found for ${symbol}`);
      continue;
    }

    const results = await scanStock(symbol, instrumentKey, config, accessToken);
    allResults.push(...results);

    // Rate limiting delay
    if (delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  return allResults;
}
