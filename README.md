# 📊 Real-Time Stock Scanner - Upstox API Integration

A professional real-time stock scanner web application that replicates Chartink-style scanner logic using live Upstox API v3 data for NSE F&O stocks.

![Stock Scanner Dashboard](https://img.shields.io/badge/Next.js-16.2-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-38bdf8?style=for-the-badge&logo=tailwind-css)

## 🎯 Features

### Scanner Logic (Chartink-Style)

The scanner implements the following exact logic:

1. **Timeframe Selector**: User can switch between 1min / 3min / 5min intervals
2. **Volume Filter**: `Volume > SMA(Volume, 20) × Multiplier` (configurable: 1.5x/2x/3x/4x)
3. **Price Breakout Filter** (OR condition):
   - **Bullish**: Current candle High > Previous Day High
   - **Bearish**: Current candle Low < Previous Day Low
4. **Price Threshold Filter**: Daily High > ₹50 (configurable)
5. **Final Condition**: `(Volume Filter) AND (Breakout Filter) AND (Price Filter)`

### Dashboard Features

- ⚡ **Live Data**: Real-time intraday candles from Upstox API
- 🔄 **Auto-Refresh**: Configurable intervals (15s/30s/1min)
- 🎨 **Dark Theme**: Professional trading dashboard UI
- 📊 **Smart Filtering**: Multiple configurable parameters
- 🎯 **Direction Tags**: Clear BULLISH/BEARISH indicators
- 📈 **Volume Analysis**: Shows volume multiples for each match
- 🔍 **NSE F&O Universe**: Scans 30+ liquid F&O stocks

## 🚀 Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19
- **Styling**: Tailwind CSS 4.1 (Dark Theme)
- **API**: Upstox API v3 (Historical Candle API)
- **Database**: PostgreSQL + Drizzle ORM
- **Deployment**: Vercel
- **Language**: TypeScript

## 📋 Prerequisites

1. **Node.js 18+** installed
2. **PostgreSQL** database (local or cloud)
3. **Upstox Demat Account** (free to open)
4. **Upstox Developer Account** (free registration)

## 🔑 Getting Upstox API Credentials

### Step 1: Create Upstox Developer App

1. Visit [Upstox Developer Portal](https://api.upstox.com/)
2. Sign in with your Upstox account credentials
3. Click on **"My Apps"** → **"Create App"**
4. Fill in the details:
   - **App Name**: Stock Scanner
   - **Redirect URL**: `http://localhost:3000` (for development)
   - **Type**: Select "API"
5. After creation, you'll receive:
   - **API Key** (Client ID)
   - **API Secret**

### Step 2: Generate Access Token

Upstox access tokens expire daily, so you need to regenerate them each day.

#### Method 1: Using Upstox Login Flow (Recommended)

1. Create the authorization URL:
   ```
   https://api.upstox.com/v2/login/authorization/dialog?response_type=code&client_id=YOUR_API_KEY&redirect_uri=http://localhost:3000
   ```
   
2. Visit this URL in your browser and authorize the app

3. After authorization, you'll be redirected to:
   ```
   http://localhost:3000?code=AUTHORIZATION_CODE
   ```

4. Use this code to get the access token via API:
   ```bash
   curl -X POST https://api.upstox.com/v2/login/authorization/token \
     -H "Content-Type: application/x-www-form-urlencoded" \
     -d "code=AUTHORIZATION_CODE" \
     -d "client_id=YOUR_API_KEY" \
     -d "client_secret=YOUR_API_SECRET" \
     -d "redirect_uri=http://localhost:3000" \
     -d "grant_type=authorization_code"
   ```

5. The response will contain your `access_token`

#### Method 2: Using Postman (Easier for Testing)

1. Download the [Upstox API Postman Collection](https://api.upstox.com/developer)
2. Import it into Postman
3. Follow the OAuth 2.0 flow in the collection
4. Copy the generated access token

### Important Notes:

- ⚠️ **Access tokens expire after midnight** (daily regeneration required)
- 💡 For production, implement automated token refresh
- 🔒 Never commit tokens to GitHub (use .env files)

## 🛠️ Installation & Setup

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd stock-scanner
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/app_db

# Upstox API Configuration
UPSTOX_API_KEY=your_api_key_here
UPSTOX_API_SECRET=your_api_secret_here
UPSTOX_ACCESS_TOKEN=your_access_token_here
```

**Important**: Replace the placeholder values with your actual Upstox credentials.

### 4. Setup Database

```bash
# Push database schema
npx drizzle-kit push
```

### 5. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the scanner in action!

## 📦 Project Structure

```
stock-scanner/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── health/         # Health check endpoint
│   │   │   └── scan/           # Stock scanner API route
│   │   ├── page.tsx            # Main dashboard UI
│   │   ├── layout.tsx          # Root layout
│   │   └── globals.css         # Global styles
│   ├── lib/
│   │   ├── upstox.ts           # Upstox API utilities
│   │   └── scanner.ts          # Scanner logic implementation
│   └── db/
│       ├── index.ts            # Database connection
│       └── schema.ts           # Database schema
├── .env                        # Environment variables
├── package.json
└── README.md
```

## 🔧 Configuration Options

### Timeframe Options
- `1min` - 1-minute candles
- `3min` - 3-minute candles  
- `5min` - 5-minute candles

### Volume Multiplier
- `1.5x` - More relaxed filter
- `2x` - Moderate filter (default)
- `3x` - Strict filter
- `4x` - Very strict filter

### Price Threshold
- Default: `₹50`
- Adjustable to any value
- Filters out penny stocks

### Auto-Refresh Intervals
- `Off` - Manual refresh only
- `15s` - Every 15 seconds
- `30s` - Every 30 seconds (default)
- `1min` - Every minute

## 🚀 Deployment to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit: Stock scanner app"
git remote add origin <your-github-repo-url>
git push -u origin main
```

### 2. Deploy to Vercel

1. Visit [vercel.com](https://vercel.com) and sign in
2. Click **"New Project"**
3. Import your GitHub repository
4. Configure environment variables:
   - `DATABASE_URL` - Your PostgreSQL connection string
   - `UPSTOX_API_KEY` - Your Upstox API key
   - `UPSTOX_API_SECRET` - Your Upstox API secret
   - `UPSTOX_ACCESS_TOKEN` - Your Upstox access token
5. Click **"Deploy"**

### 3. Update Upstox Redirect URL

After deployment, update your Upstox app settings:
- Redirect URL: `https://your-app.vercel.app`

### Production Considerations

- **Database**: Use a managed PostgreSQL service (Neon, Supabase, Railway)
- **Access Token**: Implement automated daily token refresh
- **Rate Limiting**: Upstox has API rate limits (check their docs)
- **Caching**: Consider caching instrument master data
- **Error Handling**: Add retry logic for failed API calls

## 📊 Scanner API Usage

### Endpoint

```
POST /api/scan
```

### Request Body

```json
{
  "timeframe": "5minute",
  "volumeMultiplier": 2,
  "priceThreshold": 50
}
```

### Response

```json
{
  "success": true,
  "count": 5,
  "results": [
    {
      "symbol": "RELIANCE",
      "ltp": 2450.75,
      "volumeMultiple": 3.45,
      "direction": "BULLISH BREAKOUT",
      "prevDayHigh": 2445.00,
      "prevDayLow": 2420.50,
      "dailyHigh": 2455.00,
      "currentVolume": 1500000,
      "avgVolume": 434783,
      "triggeredAt": "2026-01-10T10:30:00.000Z"
    }
  ],
  "scannedAt": "2026-01-10T10:35:00.000Z",
  "config": {
    "timeframe": "5minute",
    "volumeMultiplier": 2,
    "priceThreshold": 50
  }
}
```

## 🎓 How It Works

### Scanner Logic Flow

1. **Fetch Intraday Candles**: Get last 100 candles of selected timeframe
2. **Calculate Volume SMA**: Compute 20-period moving average of volume
3. **Check Volume Condition**: Current volume > SMA × multiplier
4. **Fetch Previous Day Data**: Get yesterday's high/low values
5. **Check Breakout Condition**: High > prev high OR Low < prev low
6. **Fetch Daily Data**: Get today's daily candle
7. **Check Price Filter**: Daily high > threshold
8. **Generate Results**: If all conditions met, tag as BULLISH or BEARISH

### Example Calculation

For RELIANCE on 5-minute timeframe:
- Current Volume: 1,500,000
- SMA(20): 434,783
- Multiplier: 2x
- Volume Condition: 1,500,000 > 869,566 ✅
- Current High: 2,455.00
- Prev Day High: 2,445.00
- Breakout: 2,455 > 2,445 ✅ (BULLISH)
- Daily High: 2,455.00
- Price Filter: 2,455 > 50 ✅
- **Result**: BULLISH BREAKOUT ✅

## 🔍 Monitored Stocks (NSE F&O)

The scanner monitors these liquid F&O stocks:

- RELIANCE, TCS, HDFCBANK, INFY, ICICIBANK
- HINDUNILVR, SBIN, BHARTIARTL, KOTAKBANK, ITC
- LT, AXISBANK, ASIANPAINT, MARUTI, WIPRO
- TITAN, ULTRACEMCO, SUNPHARMA, TATAMOTORS, TATASTEEL
- BAJFINANCE, ADANIGREEN, ADANIPORTS, NTPC, POWERGRID
- M&M, ONGC, COALINDIA, NESTLEIND, BAJAJFINSV

*Note: You can easily add more stocks by updating the `FNO_STOCKS` array in `src/lib/upstox.ts`*

## 🛡️ Security Best Practices

1. **Never commit `.env` file** to GitHub
2. **Use environment variables** for all secrets
3. **Rotate access tokens** regularly
4. **Enable Vercel environment protection**
5. **Use HTTPS** in production
6. **Implement rate limiting** on API routes

## 📝 Daily Token Refresh

Since Upstox tokens expire daily, you have two options:

### Option 1: Manual Update (Quick Setup)
Update the `UPSTOX_ACCESS_TOKEN` in Vercel dashboard daily

### Option 2: Automated Refresh (Production)
Implement a token refresh endpoint:

```typescript
// src/app/api/refresh-token/route.ts
export async function POST(request: Request) {
  // Implement OAuth refresh logic
  // Store new token in database
  // Use cron job to call this daily
}
```

## 🐛 Troubleshooting

### "Upstox access token not configured"
- Ensure `.env` file has `UPSTOX_ACCESS_TOKEN` set
- Token expires daily - regenerate if needed

### "No stocks matching criteria"
- Lower volume multiplier (try 1.5x)
- Lower price threshold (try ₹20)
- Check if market is open (9:15 AM - 3:30 PM IST)

### Rate Limit Errors
- Scanner includes 300ms delay between stocks
- Reduce scan frequency if needed
- Check Upstox API limits

## 📚 Resources

- [Upstox API Documentation](https://upstox.com/developer/api-documentation/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Drizzle ORM Guide](https://orm.drizzle.team/docs/overview)
- [Tailwind CSS](https://tailwindcss.com/docs)

## 📄 License

MIT License - Feel free to use this project for personal or commercial purposes.

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Add more stock symbols
- Improve scanner logic
- Add new filters
- Enhance UI/UX

## ⚠️ Disclaimer

This tool is for educational and informational purposes only. It is not financial advice. Always do your own research before making investment decisions. Trading in stocks involves risk, and you should only trade with money you can afford to lose.

## 📧 Support

For issues or questions:
- Open a GitHub issue
- Check Upstox API documentation
- Review Next.js troubleshooting guides

---

**Built with ❤️ using Next.js, Upstox API, and Tailwind CSS**

Happy Trading! 📈
