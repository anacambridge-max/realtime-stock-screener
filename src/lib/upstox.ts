import axios from 'axios';

const UPSTOX_API_BASE = 'https://api.upstox.com/v3';

export interface CandleData {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface HistoricalDataResponse {
  status: string;
  data?: {
    candles?: Array<[string, number, number, number, number, number, number]>;
  };
}

/**
 * Fetch a range of candles using Upstox Historical Candle V3.
 * V3 supports custom minute intervals and lets us fetch both the previous
 * completed trading day and today's candles in one request per stock.
 */
export async function getHistoricalData(
  instrumentKey: string,
  interval: '1minute' | '3minute' | '5minute' | 'day',
  fromDate: string,
  toDate: string,
  accessToken: string
): Promise<CandleData[]> {
  const minuteMatch = interval.match(/^(1|3|5)minute$/);
  const unit = minuteMatch ? 'minutes' : 'days';
  const apiInterval = minuteMatch ? minuteMatch[1] : '1';

  try {
    const response = await axios.get<HistoricalDataResponse>(
      `${UPSTOX_API_BASE}/historical-candle/${encodeURIComponent(instrumentKey)}/${unit}/${apiInterval}/${toDate}/${fromDate}`,
      {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        timeout: 12000,
      }
    );

    if (response.data.status !== 'success' || !response.data.data?.candles) {
      return [];
    }

    return response.data.data.candles.map((candle) => ({
      timestamp: candle[0],
      open: candle[1],
      high: candle[2],
      low: candle[3],
      close: candle[4],
      volume: candle[5],
    }));
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        `Upstox ${error.response?.status ?? 'network'} error for ${instrumentKey}:`,
        error.response?.data ?? error.message
      );
    } else {
      console.error(`Error fetching historical data for ${instrumentKey}:`, error);
    }
    return [];
  }
}

export function calculateSMA(values: number[], period: number): number {
  if (values.length < period) return 0;
  const recent = values.slice(-period);
  return recent.reduce((sum, value) => sum + value, 0) / period;
}

/**
 * Return an ISO date string for an instant in Asia/Kolkata.
 */
export function formatDateForAPI(date: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

export function getIndiaDateParts(date: Date = new Date()): { year: number; month: number; day: number; hour: number; minute: number; weekday: number } {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
    weekday: 'short',
  }).formatToParts(date);

  const get = (type: string) => Number(parts.find((part) => part.type === type)?.value ?? 0);
  const weekdayText = parts.find((part) => part.type === 'weekday')?.value ?? 'Mon';
  const weekdayMap: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

  return {
    year: get('year'),
    month: get('month'),
    day: get('day'),
    hour: get('hour'),
    minute: get('minute'),
    weekday: weekdayMap[weekdayText] ?? 1,
  };
}

export function isNseMarketOpen(date: Date = new Date()): boolean {
  const india = getIndiaDateParts(date);
  if (india.weekday === 0 || india.weekday === 6) return false;
  const minutes = india.hour * 60 + india.minute;
  return minutes >= 9 * 60 + 15 && minutes <= 15 * 60 + 30;
}

/**
 * Kept for compatibility. This handles weekends; the scanner itself derives
 * the actual previous trading day from returned candle data, so NSE holidays
 * are handled correctly as well.
 */
export function getPreviousTradingDay(date: Date = new Date()): Date {
  const prevDay = new Date(date);
  prevDay.setDate(prevDay.getDate() - 1);
  if (prevDay.getDay() === 0) prevDay.setDate(prevDay.getDate() - 2);
  else if (prevDay.getDay() === 6) prevDay.setDate(prevDay.getDate() - 1);
  return prevDay;
}

export * from '../config/stocks';
