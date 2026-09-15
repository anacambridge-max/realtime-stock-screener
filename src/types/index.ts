export interface ScanResponse {
  success: boolean;
  count: number;
  scanned: number;
  totalStocks: number;
  marketOpen: boolean;
  durationMs?: number;
  message?: string;
  results: ScanResult[];
  scannedAt: string;
  config: ScannerConfig;
  error?: string;
}

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
