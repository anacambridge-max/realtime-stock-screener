import { NextRequest, NextResponse } from 'next/server';
import { scanMultipleStocks, ScannerConfig } from '@/lib/scanner';
import { getCurrentFnoUniverse, isNseMarketOpen } from '@/lib/upstox';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const startedAt = Date.now();

  try {
    const body = await request.json().catch(() => ({}));
    const {
      timeframe = '5minute',
      volumeMultiplier = 2,
      priceThreshold = 50,
      forceScan = false,
    } = body;

    const accessToken = process.env.UPSTOX_ACCESS_TOKEN;
    if (!accessToken) {
      return NextResponse.json({ error: 'Upstox access token not configured' }, { status: 500 });
    }

    const now = new Date();
    if (!forceScan && !isNseMarketOpen(now)) {
      let totalStocks = 0;
      try { totalStocks = (await getCurrentFnoUniverse()).symbols.length; } catch { totalStocks = 0; }
      return NextResponse.json({
        success: true,
        marketOpen: false,
        count: 0,
        results: [],
        scanned: 0,
        totalStocks,
        scannedAt: now.toISOString(),
        durationMs: Date.now() - startedAt,
        message: 'NSE market is closed. Scanning runs automatically from 09:15 AM to 03:30 PM IST.',
        config: { timeframe, volumeMultiplier: Number(volumeMultiplier), priceThreshold: Number(priceThreshold) },
      });
    }

    if (!['1minute', '3minute', '5minute'].includes(timeframe)) {
      return NextResponse.json({ error: 'Invalid timeframe' }, { status: 400 });
    }

    const config: ScannerConfig = {
      timeframe: timeframe as ScannerConfig['timeframe'],
      volumeMultiplier: Number(volumeMultiplier),
      priceThreshold: Number(priceThreshold),
    };

    if (!Number.isFinite(config.volumeMultiplier) || config.volumeMultiplier <= 0) {
      return NextResponse.json({ error: 'Invalid volume multiplier' }, { status: 400 });
    }
    if (!Number.isFinite(config.priceThreshold) || config.priceThreshold < 0) {
      return NextResponse.json({ error: 'Invalid price threshold' }, { status: 400 });
    }

    // Pull the live F&O universe from Upstox's daily instrument master rather
    // than the old hard-coded 30-stock list.
    const { symbols, instrumentKeyMap } = await getCurrentFnoUniverse();

    const results = await scanMultipleStocks(
      symbols,
      instrumentKeyMap,
      config,
      accessToken,
      15
    );

    return NextResponse.json({
      success: true,
      marketOpen: true,
      count: results.length,
      scanned: symbols.length,
      totalStocks: symbols.length,
      results: results.sort((a, b) => b.volumeMultiple - a.volumeMultiple),
      scannedAt: new Date().toISOString(),
      durationMs: Date.now() - startedAt,
      config,
    });
  } catch (error) {
    console.error('Scan error:', error);
    return NextResponse.json({
      error: 'Failed to scan stocks',
      message: error instanceof Error ? error.message : 'Unknown error',
      durationMs: Date.now() - startedAt,
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Stock scanner API - use POST /api/scan',
    marketHours: '09:15-15:30 IST, Monday-Friday',
  });
}
