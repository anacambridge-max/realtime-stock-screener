import axios from 'axios';

const UPSTOX_API_BASE = 'https://api.upstox.com/v2';

export interface CandleData {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface HistoricalDataResponse {
  status: string;
  data: {
    candles: Array<[string, number, number, number, number, number, number]>; // [timestamp, open, high, low, close, volume, oi]
  };
}

// Get historical candle data for intraday timeframes
export async function getHistoricalData(
  instrumentKey: string,
  interval: '1minute' | '3minute' | '5minute' | 'day',
  fromDate: string,
  toDate: string,
  accessToken: string
): Promise<CandleData[]> {
  try {
    const response = await axios.get<HistoricalDataResponse>(
      `${UPSTOX_API_BASE}/historical-candle/${instrumentKey}/${interval}/${toDate}/${fromDate}`,
      {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (response.data.status === 'success' && response.data.data.candles) {
      return response.data.data.candles.map((candle) => ({
        timestamp: candle[0],
        open: candle[1],
        high: candle[2],
        low: candle[3],
        close: candle[4],
        volume: candle[5],
      }));
    }
    return [];
  } catch (error) {
    console.error(`Error fetching historical data for ${instrumentKey}:`, error);
    return [];
  }
}

// Calculate Simple Moving Average
export function calculateSMA(values: number[], period: number): number {
  if (values.length < period) {
    return 0;
  }
  const sum = values.slice(-period).reduce((acc, val) => acc + val, 0);
  return sum / period;
}

// Get previous trading day (skip weekends)
export function getPreviousTradingDay(date: Date = new Date()): Date {
  const prevDay = new Date(date);
  prevDay.setDate(prevDay.getDate() - 1);
  
  // If Saturday (6) go back to Friday, if Sunday (0) go back to Friday
  if (prevDay.getDay() === 0) {
    prevDay.setDate(prevDay.getDate() - 2);
  } else if (prevDay.getDay() === 6) {
    prevDay.setDate(prevDay.getDate() - 1);
  }
  
  return prevDay;
}

// Format date for Upstox API (YYYY-MM-DD)
export function formatDateForAPI(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Export types and utilities for use throughout the app
export * from '../config/stocks';
