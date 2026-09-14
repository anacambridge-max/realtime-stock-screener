# Frequently Asked Questions (FAQ)

## General Questions

### Q: What is this stock scanner?
**A:** It's a real-time web application that scans NSE F&O stocks based on Chartink-style technical conditions using live data from Upstox API. It identifies stocks with high volume breakouts above or below previous day's high/low.

### Q: Is this free to use?
**A:** Yes! The code is open-source (MIT License). You need a free Upstox demat account to get API access. Hosting on Vercel is free for personal use.

### Q: Do I need coding knowledge to use this?
**A:** Basic knowledge helps, but the setup guide is beginner-friendly. Just follow the step-by-step instructions in README.md.

---

## Upstox API Questions

### Q: How do I get Upstox API credentials?
**A:** 
1. Open a Upstox demat account (free)
2. Visit https://api.upstox.com/developer
3. Create a new app to get API Key and Secret
4. Generate access token using OAuth flow (explained in README)

### Q: Why does my access token expire daily?
**A:** This is Upstox's security policy. Tokens expire at midnight IST every day. You need to regenerate them daily.

### Q: How do I refresh the token daily?
**A:** Two options:
1. **Manual**: Generate new token each morning and update in Vercel env vars
2. **Automated**: Implement token refresh API (advanced - see DEPLOYMENT.md)

### Q: What are Upstox API rate limits?
**A:** Upstox has rate limits (check their docs). The scanner includes 300ms delays between requests to respect limits.

### Q: Can I use this with other brokers (Zerodha, Angel One)?
**A:** Currently only Upstox API is supported. You'd need to modify the code to support other APIs.

---

## Scanner Logic Questions

### Q: What does "BULLISH BREAKOUT" mean?
**A:** The stock's current candle high has crossed above the previous day's high, with volume exceeding 2x (or your chosen multiplier) of its 20-period average.

### Q: What does "BEARISH BREAKDOWN" mean?
**A:** The stock's current candle low has fallen below the previous day's low, with high volume.

### Q: Why am I seeing no results?
**A:** Possible reasons:
- Market is closed (only works 9:15 AM - 3:30 PM IST on trading days)
- Filters are too strict (try lowering volume multiplier to 1.5x)
- No stocks currently meeting criteria
- Access token expired
- API rate limit reached

### Q: Can I customize which stocks are scanned?
**A:** Yes! Edit `src/lib/upstox.ts` and modify the `FNO_STOCKS` array. Add/remove symbols as needed.

### Q: What timeframes are available?
**A:** 1-minute, 3-minute, and 5-minute candles. You can add more by modifying the code.

### Q: How accurate is this scanner?
**A:** The scanner shows technical breakouts based on configured criteria. It's a screening tool, not a trading signal. Always verify and do your own analysis.

---

## Technical Questions

### Q: What technology stack is used?
**A:**
- Frontend: Next.js 16 (React 19, TypeScript)
- Styling: Tailwind CSS 4.1
- API: Upstox v3 REST API
- Database: PostgreSQL + Drizzle ORM
- Hosting: Vercel

### Q: Do I need a database?
**A:** Yes, for storing instrument mappings and optionally scan results. You can use free tiers from Neon, Supabase, or Railway.

### Q: Can I run this locally?
**A:** Yes! Just follow the setup in README.md. You'll need Node.js 18+ and PostgreSQL.

### Q: How do I update to the latest code?
**A:**
```bash
git pull origin main
npm install
npm run build
```

---

## Deployment Questions

### Q: Can I host this for free?
**A:** Yes! Vercel's free tier is sufficient for personal use. Database free tiers are also available.

### Q: How do I deploy updates?
**A:** Just push to GitHub - Vercel auto-deploys:
```bash
git add .
git commit -m "Update"
git push
```

### Q: Can I use a custom domain?
**A:** Yes! Add your domain in Vercel dashboard (may require paid plan for multiple domains).

### Q: What happens if I exceed Vercel's free limits?
**A:** You'll get notified. Upgrade to Pro ($20/month) for unlimited bandwidth.

---

## Usage Questions

### Q: When should I run scans?
**A:** During market hours (9:15 AM - 3:30 PM IST). Most active periods:
- 9:15-10:00 AM (Opening)
- 2:30-3:30 PM (Closing)

### Q: What volume multiplier should I use?
**A:**
- **1.5x**: More results, less strict
- **2x**: Balanced (recommended)
- **3x-4x**: Very strict, only strongest breakouts

### Q: What price threshold is recommended?
**A:** Default ₹50 filters out penny stocks. Adjust based on your needs:
- ₹20: Include small caps
- ₹50: Balanced
- ₹100+: Focus on larger stocks

### Q: How often should auto-refresh run?
**A:**
- 1 minute: Safe, respects API limits
- 30 seconds: Balanced
- 15 seconds: Active monitoring (watch for rate limits)

---

## Troubleshooting

### Q: "Upstox access token not configured" error
**A:** 
1. Check `.env` file has `UPSTOX_ACCESS_TOKEN` set
2. Verify token hasn't expired (regenerate if past midnight)
3. Restart development server

### Q: "Failed to scan stocks" error
**A:**
1. Check browser console for detailed error
2. Verify Upstox token is valid
3. Check if API rate limit is exceeded
4. Ensure market is open

### Q: Scanner is slow
**A:** 
- Reduce number of stocks being scanned
- Increase delay between requests
- Check your internet connection
- Verify Vercel function isn't timing out (60s limit)

### Q: Database connection errors
**A:**
1. Verify `DATABASE_URL` in `.env`
2. Check database server is running
3. Run `npx drizzle-kit push` to sync schema

### Q: Build fails on Vercel
**A:**
1. Check build logs for specific error
2. Ensure all env vars are set in Vercel
3. Test build locally: `npm run build`
4. Check for TypeScript errors

---

## Security Questions

### Q: Is it safe to store API keys in .env?
**A:** Yes, as long as:
- `.env` is in `.gitignore` (never commit to GitHub)
- Use Vercel environment variables for production
- Never share your `.env` file

### Q: Can others see my API keys on Vercel?
**A:** No, environment variables are encrypted and only visible to project owners.

### Q: What if my access token is compromised?
**A:** Generate a new one immediately and update in Vercel. Old tokens expire in 24 hours anyway.

---

## Feature Requests

### Q: Can you add XYZ feature?
**A:** Open a GitHub Issue with your suggestion! Better yet, contribute via Pull Request.

### Q: Will you add support for options data?
**A:** Possibly in future updates. Contributions welcome!

### Q: Can this send me alerts via email/SMS?
**A:** Not currently, but you can add this feature using services like SendGrid or Twilio.

---

## Trading Questions

### Q: Should I buy stocks that appear in the scanner?
**A:** **NO!** This is a screening tool, not investment advice. Always:
- Do your own research
- Check fundamentals
- Consider overall market conditions
- Consult a financial advisor
- Only invest what you can afford to lose

### Q: Is this a guaranteed profit strategy?
**A:** Absolutely not. Technical breakouts can fail. This tool helps identify opportunities, but trading involves significant risk.

### Q: Can I backtest this strategy?
**A:** You'd need historical data for backtesting. Upstox API provides limited historical data. Consider using dedicated backtesting platforms.

---

## Legal Questions

### Q: Is automated trading legal in India?
**A:** Using APIs for market data and placing orders is legal. However, this app only scans data - it doesn't place trades.

### Q: Do I need SEBI approval to use this?
**A:** No. This is a personal screening tool. You're not providing trading services to others.

### Q: Can I sell this application?
**A:** The code is MIT licensed - you can use it commercially, but cannot claim exclusive ownership. Check LICENSE file.

---

## Performance Questions

### Q: How many stocks can I scan simultaneously?
**A:** Currently ~30 stocks with rate limiting. You can increase this but watch for:
- API rate limits
- Vercel function timeout (60s)
- API quota usage

### Q: Why does scanning take 15-20 seconds?
**A:** We add 300ms delay between each stock to respect Upstox rate limits. 30 stocks × 300ms = 9 seconds minimum.

### Q: Can I make it faster?
**A:** Yes, but carefully:
- Reduce delay (risk hitting rate limits)
- Use parallel requests (risk ban)
- Cache instrument data
- Scan fewer stocks

---

## Data Questions

### Q: Is the data real-time?
**A:** Yes, Upstox provides live market data during trading hours.

### Q: What's the data delay?
**A:** Minimal. Upstox uses WebSocket for live data (this app uses REST API with slight delay).

### Q: Can I see historical scan results?
**A:** Database schema includes `scanResults` table, but frontend doesn't display it yet. You can build this feature!

---

## Still Have Questions?

- 📖 Read the full [README.md](README.md)
- 🚀 Check [DEPLOYMENT.md](DEPLOYMENT.md) for deploy issues
- 💻 Review [CONTRIBUTING.md](CONTRIBUTING.md) to contribute
- 🐛 Open a [GitHub Issue](https://github.com/yourusername/stock-scanner/issues)
- 📧 Contact via repository discussions

---

**Remember**: This tool is for educational purposes. Not financial advice. Trade responsibly! 📊
