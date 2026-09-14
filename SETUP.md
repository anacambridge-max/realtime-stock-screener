# Quick Setup Guide

## 🚀 5-Minute Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Get Upstox Credentials

#### A. Create Developer Account
1. Go to https://api.upstox.com/
2. Sign in with Upstox account
3. Create new app → Get API Key & Secret

#### B. Generate Access Token (Daily Required)
1. Visit this URL (replace YOUR_API_KEY):
   ```
   https://api.upstox.com/v2/login/authorization/dialog?response_type=code&client_id=YOUR_API_KEY&redirect_uri=http://localhost:3000
   ```

2. Authorize the app → You'll be redirected with a code

3. Get access token:
   ```bash
   curl -X POST https://api.upstox.com/v2/login/authorization/token \
     -H "Content-Type: application/x-www-form-urlencoded" \
     -d "code=AUTHORIZATION_CODE" \
     -d "client_id=YOUR_API_KEY" \
     -d "client_secret=YOUR_API_SECRET" \
     -d "redirect_uri=http://localhost:3000" \
     -d "grant_type=authorization_code"
   ```

4. Copy the `access_token` from response

### 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your credentials:
```env
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/app_db
UPSTOX_API_KEY=abc123xyz
UPSTOX_API_SECRET=xyz789abc
UPSTOX_ACCESS_TOKEN=eyJhbGc...
```

### 4. Setup Database

```bash
npx drizzle-kit push
```

### 5. Run Development Server

```bash
npm run dev
```

Open http://localhost:3000

## ✅ Verify Setup

1. Dashboard loads without errors
2. Click "Scan Now" button
3. Results appear (if market is open)

## 🔄 Daily Token Refresh

**Important**: Access tokens expire after midnight IST.

Every day before market hours:
1. Repeat Step 2B above to get new code
2. Get new access token
3. Update `UPSTOX_ACCESS_TOKEN` in `.env`
4. Restart server (or redeploy on Vercel)

## 🚀 Deploy to Vercel

```bash
# Push to GitHub
git init
git add .
git commit -m "Initial commit"
git push

# Deploy on Vercel
1. Import GitHub repo
2. Add environment variables
3. Deploy
```

## 🐛 Common Issues

### "Access token not configured"
→ Check `.env` file has `UPSTOX_ACCESS_TOKEN`

### "No results found"
→ Market may be closed (9:15 AM - 3:30 PM IST)
→ Try lowering volume multiplier to 1.5x

### "Rate limit exceeded"
→ Upstox API has limits
→ Scanner already includes delays
→ Reduce auto-refresh frequency

## 📞 Need Help?

- Check README.md for detailed docs
- Visit Upstox API docs: https://upstox.com/developer/
- Open GitHub issue

## 🎯 Pro Tips

1. **Save your access token** in a secure password manager
2. **Set calendar reminder** for daily token refresh
3. **Test during market hours** (9:15 AM - 3:30 PM IST)
4. **Start with 5min timeframe** - most reliable
5. **Use 2x volume multiplier** for balanced results

---

Ready to scan! 📊🚀
