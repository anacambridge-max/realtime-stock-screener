/**
 * Stock symbols configuration
 * Add or remove symbols here to customize which stocks are scanned
 */

export interface StockSymbol {
  symbol: string;
  instrumentKey: string;
  name: string;
  sector?: string;
}

/**
 * NSE F&O Stock Universe
 * These are the most liquid stocks with Futures & Options contracts
 * 
 * To add more stocks:
 * 1. Get the instrument key from Upstox instrument master file
 * 2. Add to this list following the same format
 * 
 * Upstox Instrument Master: https://assets.upstox.com/market-quote/instruments/exchange/NSE.csv
 */
export const FNO_STOCK_SYMBOLS: StockSymbol[] = [
  // Banking & Financial Services
  { symbol: 'HDFCBANK', instrumentKey: 'NSE_EQ|INE040A01034', name: 'HDFC Bank', sector: 'Banking' },
  { symbol: 'ICICIBANK', instrumentKey: 'NSE_EQ|INE090A01021', name: 'ICICI Bank', sector: 'Banking' },
  { symbol: 'SBIN', instrumentKey: 'NSE_EQ|INE062A01020', name: 'State Bank of India', sector: 'Banking' },
  { symbol: 'AXISBANK', instrumentKey: 'NSE_EQ|INE238A01034', name: 'Axis Bank', sector: 'Banking' },
  { symbol: 'KOTAKBANK', instrumentKey: 'NSE_EQ|INE237A01028', name: 'Kotak Mahindra Bank', sector: 'Banking' },
  { symbol: 'BAJFINANCE', instrumentKey: 'NSE_EQ|INE296A01024', name: 'Bajaj Finance', sector: 'NBFC' },
  { symbol: 'BAJAJFINSV', instrumentKey: 'NSE_EQ|INE918I01018', name: 'Bajaj Finserv', sector: 'Financial Services' },

  // IT Services
  { symbol: 'TCS', instrumentKey: 'NSE_EQ|INE467B01029', name: 'Tata Consultancy Services', sector: 'IT' },
  { symbol: 'INFY', instrumentKey: 'NSE_EQ|INE009A01021', name: 'Infosys', sector: 'IT' },
  { symbol: 'WIPRO', instrumentKey: 'NSE_EQ|INE075A01022', name: 'Wipro', sector: 'IT' },

  // Energy
  { symbol: 'RELIANCE', instrumentKey: 'NSE_EQ|INE002A01018', name: 'Reliance Industries', sector: 'Energy' },
  { symbol: 'ONGC', instrumentKey: 'NSE_EQ|INE213A01029', name: 'Oil & Natural Gas Corporation', sector: 'Oil & Gas' },

  // Telecom
  { symbol: 'BHARTIARTL', instrumentKey: 'NSE_EQ|INE397D01024', name: 'Bharti Airtel', sector: 'Telecom' },

  // Consumer Goods
  { symbol: 'HINDUNILVR', instrumentKey: 'NSE_EQ|INE030A01027', name: 'Hindustan Unilever', sector: 'FMCG' },
  { symbol: 'ITC', instrumentKey: 'NSE_EQ|INE154A01025', name: 'ITC Limited', sector: 'FMCG' },
  { symbol: 'NESTLEIND', instrumentKey: 'NSE_EQ|INE239A01016', name: 'Nestle India', sector: 'FMCG' },

  // Automobiles
  { symbol: 'MARUTI', instrumentKey: 'NSE_EQ|INE585B01010', name: 'Maruti Suzuki', sector: 'Automobiles' },
  { symbol: 'TATAMOTORS', instrumentKey: 'NSE_EQ|INE155A01022', name: 'Tata Motors', sector: 'Automobiles' },
  { symbol: 'M&M', instrumentKey: 'NSE_EQ|INE101A01026', name: 'Mahindra & Mahindra', sector: 'Automobiles' },

  // Metals & Mining
  { symbol: 'TATASTEEL', instrumentKey: 'NSE_EQ|INE081A01012', name: 'Tata Steel', sector: 'Metals' },
  { symbol: 'COALINDIA', instrumentKey: 'NSE_EQ|INE522F01014', name: 'Coal India', sector: 'Mining' },

  // Infrastructure & Construction
  { symbol: 'LT', instrumentKey: 'NSE_EQ|INE018A01030', name: 'Larsen & Toubro', sector: 'Infrastructure' },

  // Cement
  { symbol: 'ULTRACEMCO', instrumentKey: 'NSE_EQ|INE481G01011', name: 'UltraTech Cement', sector: 'Cement' },

  // Paints
  { symbol: 'ASIANPAINT', instrumentKey: 'NSE_EQ|INE021A01026', name: 'Asian Paints', sector: 'Paints' },

  // Pharma
  { symbol: 'SUNPHARMA', instrumentKey: 'NSE_EQ|INE044A01036', name: 'Sun Pharmaceutical', sector: 'Pharma' },

  // Retail & Consumer
  { symbol: 'TITAN', instrumentKey: 'NSE_EQ|INE280A01028', name: 'Titan Company', sector: 'Retail' },

  // Power & Utilities
  { symbol: 'NTPC', instrumentKey: 'NSE_EQ|INE733E01010', name: 'NTPC Limited', sector: 'Power' },
  { symbol: 'POWERGRID', instrumentKey: 'NSE_EQ|INE752E01010', name: 'Power Grid Corporation', sector: 'Utilities' },

  // Adani Group
  { symbol: 'ADANIGREEN', instrumentKey: 'NSE_EQ|INE364U01010', name: 'Adani Green Energy', sector: 'Renewable Energy' },
  { symbol: 'ADANIPORTS', instrumentKey: 'NSE_EQ|INE742F01042', name: 'Adani Ports', sector: 'Logistics' },
];

/**
 * Get list of all stock symbols (just the ticker)
 */
export function getAllSymbols(): string[] {
  return FNO_STOCK_SYMBOLS.map(stock => stock.symbol);
}

/**
 * Get instrument key for a symbol
 */
export function getInstrumentKeyForSymbol(symbol: string): string | undefined {
  const stock = FNO_STOCK_SYMBOLS.find(s => s.symbol === symbol);
  return stock?.instrumentKey;
}

/**
 * Get stock details by symbol
 */
export function getStockDetails(symbol: string): StockSymbol | undefined {
  return FNO_STOCK_SYMBOLS.find(s => s.symbol === symbol);
}

/**
 * Get stocks by sector
 */
export function getStocksBySector(sector: string): StockSymbol[] {
  return FNO_STOCK_SYMBOLS.filter(s => s.sector === sector);
}

/**
 * Get all unique sectors
 */
export function getAllSectors(): string[] {
  const sectors = FNO_STOCK_SYMBOLS
    .map(s => s.sector)
    .filter((s): s is string => !!s);
  return [...new Set(sectors)].sort();
}
