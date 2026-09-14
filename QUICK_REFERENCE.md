# 🚀 Quick Reference Card

**Stock Scanner - Essential Commands & Info**

---

## 📦 Installation

```bash
git clone <repo-url>
cd stock-scanner
npm install
cp .env.example .env
# Edit .env with your credentials
npx drizzle-kit push
npm run dev
```

---

## 🔑 Get Upstox Token (Daily)

```bash
# 1. Generate auth URL
node scripts/generate-auth-url.js

# 2. Visit URL in browser, authorize, copy code from redirect

# 3. Get access token
curl -X POST https://api.upstox.com/v2/login/authorization/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "code=YOUR_CODE" \
  -d "client_id=YOUR_API_KEY" \
  -d "client_secret=YOUR_API_SECRET" \
  -d "redirect_uri=http://localhost:3000" \
  -d "grant_type=authorization_code"

# 4. Copy access_token from response to .env
```

---

## 🛠️ Development Commands

```bash
npm run dev          # Start dev server (localhost:3000)
npm run build        # Build for production
npm start            # Start production server
npm run typecheck    # Check TypeScript errors
npm run lint         # Lint code
npm run db:push      # Sync database schema
npm run db:studio    # Open database UI
```

---

## 🚀 Deploy to Vercel

```bash
# 1. Push to GitHub
git add .
git commit -m "Deploy"
git push

# 2. In Vercel Dashboard:
# - Import repo
# - Add env vars (DATABASE_URL, UPSTOX_*)
# - Deploy
```

---

## 📊 Scanner Logic

```
CONDITION 1: Volume > SMA(Volume, 20) × Multiplier
AND
CONDITION 2: High > Prev Day High OR Low < Prev Day Low
AND
CONDITION 3: Daily High > Price Threshold

RESULT: BULLISH BREAKOUT or BEARISH BREAKDOWN
```

---

## ⚙️ Default Settings

| Setting | Default | Options |
|---------|---------|---------|
| Timeframe | 5min | 1min, 3min, 5min |
| Volume Multiplier | 2x | 1.5x, 2x, 3x, 4x |
| Price Threshold | ₹50 | Any number |
| Auto-refresh | 30s | Off, 15s, 30s, 60s |

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| `src/app/page.tsx` | Dashboard UI |
| `src/app/api/scan/route.ts` | Scanner API |
| `src/lib/scanner.ts` | Scanner logic |
| `src/lib/upstox.ts` | Upstox API utils |
| `src/config/stocks.ts` | Stock symbols |
| `.env` | Environment variables |

---

## 🔧 Add New Stock

Edit `src/config/stocks.ts`:

```typescript
export const FNO_STOCK_SYMBOLS: StockSymbol[] = [
  // ... existing stocks
  { 
    symbol: 'NEWSYMBOL', 
    instrumentKey: 'NSE_EQ|INE123456789', 
    name: 'New Company',
    sector: 'Technology' 
  },
];
```

Get instrument key from: https://assets.upstox.com/market-quote/instruments/exchange/NSE.csv

---

## 🐛 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| "Token not configured" | Check .env has UPSTOX_ACCESS_TOKEN |
| No results | Market closed OR filters too strict |
| Build fails | Run `npm exec tsc` to see errors |
| DB error | Run `npx drizzle-kit push` |
| Token expired | Generate new token (daily task) |

---

## 📚 Documentation Files

- **README.md** - Full documentation
- **SETUP.md** - Quick setup (5 min)
- **DEPLOYMENT.md** - Vercel deployment
- **FAQ.md** - Common questions
- **CHECKLIST.md** - Setup checklist
- **CONTRIBUTING.md** - How to contribute

---

## 🔗 Important URLs

- Upstox Developer: https://api.upstox.com/developer
- Upstox API Docs: https://upstox.com/developer/api-documentation/
- Vercel Dashboard: https://vercel.com/dashboard
- GitHub Repo: https://github.com/yourusername/stock-scanner

---

## 📊 API Endpoints

```bash
# Health check
curl https://your-app.vercel.app/api/health

# Scan stocks
curl -X POST https://your-app.vercel.app/api/scan \
  -H "Content-Type: application/json" \
  -d '{"timeframe":"5minute","volumeMultiplier":2,"priceThreshold":50}'
```

---

## 🕐 Trading Hours (NSE)

- **Pre-open**: 9:00 AM - 9:15 AM IST
- **Regular**: 9:15 AM - 3:30 PM IST
- **Post-close**: 3:40 PM - 4:00 PM IST

**Token expires**: Midnight IST (daily refresh required)

---

## 💡 Pro Tips

1. **Test during market hours** for accurate results
2. **Start with 2x multiplier** for balanced results
3. **Lower to 1.5x** if no results found
4. **Use 5min timeframe** for stability
5. **Set calendar reminder** for daily token refresh
6. **Save access token** in password manager
7. **Monitor API limits** to avoid quota issues

---

## ⚠️ Remember

- This is NOT financial advice
- Always do your own research
- Past performance ≠ future results
- Trading involves risk
- Only trade with money you can afford to lose

---

## 🆘 Need Help?

1. Check **FAQ.md** first
2. Search **GitHub Issues**
3. Open new issue with:
   - Error message
   - Steps to reproduce
   - Environment (OS, Node version)

---

**Version**: 1.0.0  
**Last Updated**: January 2026  
**License**: MIT  

Happy Trading! 📈
