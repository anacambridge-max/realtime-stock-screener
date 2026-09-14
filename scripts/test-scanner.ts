/**
 * Test script to verify scanner logic locally
 * Run with: npx tsx scripts/test-scanner.ts
 */

import { scanStock } from '../src/lib/scanner';
import { getInstrumentKeyForSymbol } from '../src/lib/upstox';

async function testScanner() {
  console.log('🔍 Testing Stock Scanner...\n');

  const accessToken = process.env.UPSTOX_ACCESS_TOKEN;
  
  if (!accessToken) {
    console.error('❌ UPSTOX_ACCESS_TOKEN not found in environment');
    console.error('Please set it in .env file');
    process.exit(1);
  }

  const testConfig = {
    timeframe: '5minute' as const,
    volumeMultiplier: 2,
    priceThreshold: 50,
  };

  console.log('📊 Scanner Configuration:');
  console.log(`   Timeframe: ${testConfig.timeframe}`);
  console.log(`   Volume Multiplier: ${testConfig.volumeMultiplier}x`);
  console.log(`   Price Threshold: ₹${testConfig.priceThreshold}`);
  console.log('\n' + '='.repeat(60) + '\n');

  // Test with RELIANCE
  const symbol = 'RELIANCE';
  const instrumentKey = getInstrumentKeyForSymbol(symbol) || '';

  console.log(`Testing ${symbol}...`);
  console.log(`Instrument Key: ${instrumentKey}\n`);

  try {
    const results = await scanStock(
      symbol,
      instrumentKey,
      testConfig,
      accessToken
    );

    if (results.length > 0) {
      console.log('✅ Match Found!\n');
      results.forEach((result) => {
        console.log(`Symbol: ${result.symbol}`);
        console.log(`Direction: ${result.direction}`);
        console.log(`LTP: ₹${result.ltp.toFixed(2)}`);
        console.log(`Volume Multiple: ${result.volumeMultiple}x`);
        console.log(`Prev Day High: ₹${result.prevDayHigh.toFixed(2)}`);
        console.log(`Prev Day Low: ₹${result.prevDayLow.toFixed(2)}`);
        console.log(`Daily High: ₹${result.dailyHigh.toFixed(2)}`);
        console.log(`Current Volume: ${result.currentVolume.toLocaleString()}`);
        console.log(`Avg Volume: ${result.avgVolume.toLocaleString()}`);
        console.log(`Triggered At: ${result.triggeredAt}`);
      });
    } else {
      console.log('❌ No match found');
      console.log('This could mean:');
      console.log('  - Stock doesn\'t meet criteria');
      console.log('  - Market is closed');
      console.log('  - API token is invalid/expired');
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ Test completed successfully!');
  } catch (error) {
    console.error('❌ Test failed:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
    }
    process.exit(1);
  }
}

// Run the test
testScanner();
