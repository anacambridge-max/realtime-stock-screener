import axios from 'axios';
import { gunzipSync } from 'zlib';

const UPSTOX_API_BASE = 'https://api.upstox.com/v3';
const NSE_INSTRUMENTS_URL = 'https://assets.upstox.com/market-quote/instruments/exchange/NSE.json.gz';

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

interface UpstoxInstrument {
  segment?: string;
  instrument_type?: string;
  instrument_key?: string;
  trading_symbol?: string;
  underlying_key?: string;
  underlying_type?: string;
}

let fnoUniverseCache: { expiresAt: number; symbols: string[]; instrumentKeyMap: Record<string, string> } | null = null;

function mapCandles(candles: Array<[string, number, number, number, number, number, number]>): CandleData[] {
  return candles.map((candle) => ({
    timestamp: candle[0],
    open: candle[1],
    high: candle[2],
    low: candle[3],
    close: candle[4],
    volume: candle[5],
  }));
}

/**
 * Fetch historical candles for completed trading sessions.
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
        headers: { Accept: 'application/json', Authorization: `Bearer ${accessToken}` },
        timeout: 12000,
      }
    );
    if (response.data.status !== 'success' || !response.data.data?.candles) return [];
    return mapCandles(response.data.data.candles);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`Upstox historical ${error.response?.status ?? 'network'} error for ${instrumentKey}:`, error.response?.data ?? error.message);
    } else {
      console.error(`Error fetching historical data for ${instrumentKey}:`, error);
    }
    return [];
  }
}

/**
 * Fetch candles for the CURRENT trading day. Upstox exposes this through the
 * dedicated V3 intraday endpoint, which is what the scanner must use for live
 * market-hours candles.
 */
export async function getIntradayData(
  instrumentKey: string,
  interval: '1minute' | '3minute' | '5minute',
  accessToken: string
): Promise<CandleData[]> {
  const apiInterval = interval.replace('minute', '');
  try {
    const response = await axios.get<HistoricalDataResponse>(
      `${UPSTOX_API_BASE}/historical-candle/intraday/${encodeURIComponent(instrumentKey)}/minutes/${apiInterval}`,
      {
        headers: { Accept: 'application/json', Authorization: `Bearer ${accessToken}` },
        timeout: 12000,
      }
    );
    if (response.data.status !== 'success' || !response.data.data?.candles) return [];
    return mapCandles(response.data.data.candles);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`Upstox intraday ${error.response?.status ?? 'network'} error for ${instrumentKey}:`, error.response?.data ?? error.message);
    } else {
      console.error(`Error fetching intraday data for ${instrumentKey}:`, error);
    }
    return [];
  }
}

/**
 * Build the CURRENT NSE F&O equity universe from Upstox's daily instrument
 * master. A stock is included when Upstox has an active NSE_FO FUT contract
 * whose underlying is an NSE equity. This avoids a stale hard-coded 30-stock
 * list and automatically follows additions/removals from the F&O universe.
 * The instrument master is cached in the running Vercel instance for 6 hours.
 */
export async function getCurrentFnoUniverse(): Promise<{ symbols: string[]; instrumentKeyMap: Record<string, string> }> {
  const now = Date.now();
  if (fnoUniverseCache && fnoUniverseCache.expiresAt > now) {
    return { symbols: fnoUniverseCache.symbols, instrumentKeyMap: fnoUniverseCache.instrumentKeyMap };
  }

  const response = await fetch(NSE_INSTRUMENTS_URL, { cache: 'no-store' });
  if (!response.ok) throw new Error(`Unable to load Upstox instrument master: HTTP ${response.status}`);

  const bytes = Buffer.from(await response.arrayBuffer());
  const jsonText = bytes[0] === 0x1f && bytes[1] === 0x8b
    ? gunzipSync(bytes).toString('utf8')
    : bytes.toString('utf8');
  const instruments = JSON.parse(jsonText) as UpstoxInstrument[];

  const equityByKey = new Map<string, UpstoxInstrument>();
  const fnoUnderlyingKeys = new Set<string>();

  for (const instrument of instruments) {
    if (instrument.segment === 'NSE_EQ' && instrument.instrument_type === 'EQ' && instrument.instrument_key) {
      equityByKey.set(instrument.instrument_key, instrument);
    }
    if (
      instrument.segment === 'NSE_FO' &&
      instrument.instrument_type === 'FUT' &&
      instrument.underlying_type === 'EQUITY' &&
      instrument.underlying_key
    ) {
      fnoUnderlyingKeys.add(instrument.underlying_key);
    }
  }

  const pairs = [...fnoUnderlyingKeys]
    .map((key) => equityByKey.get(key))
    .filter((instrument): instrument is UpstoxInstrument => !!instrument && !!instrument.trading_symbol && !!instrument.instrument_key)
    .map((instrument) => ({ symbol: instrument.trading_symbol as string, key: instrument.instrument_key as string }))
    .sort((a, b) => a.symbol.localeCompare(b.symbol));

  if (!pairs.length) throw new Error('No current NSE F&O equity instruments found in Upstox master');

  const symbols = pairs.map((pair) => pair.symbol);
  const instrumentKeyMap = Object.fromEntries(pairs.map((pair) => [pair.symbol, pair.key]));
  fnoUniverseCache = { expiresAt: now + 6 * 60 * 60 * 1000, symbols, instrumentKeyMap };
  return { symbols, instrumentKeyMap };
}

export function calculateSMA(values: number[], period: number): number {
  if (values.length < period) return 0;
  const recent = values.slice(-period);
  return recent.reduce((sum, value) => sum + value, 0) / period;
}

export function formatDateForAPI(date: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(date);
}

export function getIndiaDateParts(date: Date = new Date()): { year: number; month: number; day: number; hour: number; minute: number; weekday: number } {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23', weekday: 'short',
  }).formatToParts(date);
  const get = (type: string) => Number(parts.find((part) => part.type === type)?.value ?? 0);
  const weekdayText = parts.find((part) => part.type === 'weekday')?.value ?? 'Mon';
  const weekdayMap: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  return { year: get('year'), month: get('month'), day: get('day'), hour: get('hour'), minute: get('minute'), weekday: weekdayMap[weekdayText] ?? 1 };
}

export function isNseMarketOpen(date: Date = new Date()): boolean {
  const india = getIndiaDateParts(date);
  if (india.weekday === 0 || india.weekday === 6) return false;
  const minutes = india.hour * 60 + india.minute;
  return minutes >= 9 * 60 + 15 && minutes <= 15 * 60 + 30;
}

export function getPreviousTradingDay(date: Date = new Date()): Date {
  const prevDay = new Date(date);
  prevDay.setDate(prevDay.getDate() - 1);
  if (prevDay.getDay() === 0) prevDay.setDate(prevDay.getDate() - 2);
  else if (prevDay.getDay() === 6) prevDay.setDate(prevDay.getDate() - 1);
  return prevDay;
}

export * from '../config/stocks';
