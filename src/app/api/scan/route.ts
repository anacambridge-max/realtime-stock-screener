import { NextRequest, NextResponse } from 'next/server';
import { scanMultipleStocks, ScannerConfig } from '@/lib/scanner';
import { getAllSymbols, getInstrumentKeyForSymbol } from '@/lib/upstox';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Maximum execution time for Vercel

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      timeframe = '5minute',
      volumeMultiplier = 2,
      priceThreshold = 50,
    } = body;

    // Validate environment variables
    const accessToken = process.env.UPSTOX_ACCESS_TOKEN;
    if (!accessToken) {
      return NextResponse.json(
        { error: 'Upstox access token not configured' },
        { status: 500 }
      );
    }

    // Prepare scanner configuration
    const config: ScannerConfig = {
      timeframe: timeframe as '1minute' | '3minute' | '5minute',
      volumeMultiplier: parseFloat(volumeMultiplier),
      priceThreshold: parseFloat(priceThreshold),
    };

    // Build instrument key map
    const allSymbols = getAllSymbols();
    const instrumentKeyMap: { [symbol: string]: string } = {};
    allSymbols.forEach((symbol) => {
      const key = getInstrumentKeyForSymbol(symbol);
      if (key) {
        instrumentKeyMap[symbol] = key;
      }
    });

    // Run the scan
    const results = await scanMultipleStocks(
      allSymbols,
      instrumentKeyMap,
      config,
      accessToken,
      300 // 300ms delay between stocks to respect rate limits
    );

    return NextResponse.json({
      success: true,
      count: results.length,
      results: results.sort((a, b) => b.volumeMultiple - a.volumeMultiple), // Sort by volume multiple descending
      scannedAt: new Date().toISOString(),
      config,
    });
  } catch (error) {
    console.error('Scan error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to scan stocks',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Stock scanner API - Use POST method with configuration',
    example: {
      timeframe: '5minute',
      volumeMultiplier: 2,
      priceThreshold: 50,
    },
  });
}
