// API Response types
export interface ScanResponse {
  success: boolean;
  count: number;
  results: ScanResult[];
  scannedAt: string;
  config: ScannerConfig;
  error?: string;
}

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

// Upstox API types
export interface CandleData {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface UpstoxHistoricalResponse {
  status: string;
  data: {
    candles: Array<[string, number, number, number, number, number, number]>;
  };
}
