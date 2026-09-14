# 🚀 Deployment Guide

## Deploying to Vercel (Recommended)

### Prerequisites
- GitHub account
- Vercel account (free tier works)
- Upstox API credentials

### Step-by-Step Deployment

#### 1. Prepare Your Repository

```bash
# Initialize git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Stock scanner application"

# Create GitHub repository and push
# (Replace with your repository URL)
git remote add origin https://github.com/yourusername/stock-scanner.git
git branch -M main
git push -u origin main
```

#### 2. Setup PostgreSQL Database

You need a hosted PostgreSQL database. Choose one:

**Option A: Neon (Recommended - Free Tier)**
1. Visit https://neon.tech
2. Create account and new project
3. Copy connection string (it looks like: `postgresql://user:pass@host/dbname`)

**Option B: Supabase (Free Tier)**
1. Visit https://supabase.com
2. Create project
3. Go to Settings → Database → Connection string
4. Copy URI connection string

**Option C: Railway (Paid)**
1. Visit https://railway.app
2. Create PostgreSQL database
3. Copy connection string

#### 3. Deploy to Vercel

1. **Visit Vercel**
   - Go to https://vercel.com
   - Sign in with GitHub

2. **Import Project**
   - Click "New Project"
   - Select your stock-scanner repository
   - Click "Import"

3. **Configure Project**
   - Framework Preset: **Next.js** (auto-detected)
   - Root Directory: `./` (leave as default)
   - Build Command: `npm run build` (default)
   - Install Command: `npm install` (default)

4. **Add Environment Variables**
   
   Click "Environment Variables" and add these:

   ```
   DATABASE_URL
   postgresql://user:password@host:5432/database_name
   ```

   ```
   UPSTOX_API_KEY
   your_api_key_from_upstox_developer_portal
   ```

   ```
   UPSTOX_API_SECRET
   your_api_secret_from_upstox_developer_portal
   ```

   ```
   UPSTOX_ACCESS_TOKEN
   your_daily_access_token
   ```

   **Important**: Set all variables for "Production", "Preview", and "Development" environments.

5. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes for deployment
   - Your app will be live at `https://your-app-name.vercel.app`

#### 4. Initialize Database

After first deployment:

1. Open Vercel Dashboard → Your Project → Settings → Environment Variables
2. Verify DATABASE_URL is set correctly
3. The database schema will be created automatically on first API call

Alternatively, run migrations manually:
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link to your project
vercel link

# Run migration
vercel env pull .env.local
npx drizzle-kit push
```

#### 5. Update Upstox Redirect URL

1. Go to https://api.upstox.com → My Apps
2. Edit your app
3. Update Redirect URL to: `https://your-app-name.vercel.app`
4. Save changes

#### 6. Test Your Deployment

1. Visit your Vercel URL
2. Open browser console (F12)
3. Check for any errors
4. Click "Scan Now" button
5. Verify results appear (during market hours)

---

## Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DATABASE_URL` | Yes | PostgreSQL connection string | `postgresql://user:pass@host/db` |
| `UPSTOX_API_KEY` | Yes | Upstox API Key (Client ID) | `abc123xyz` |
| `UPSTOX_API_SECRET` | Yes | Upstox API Secret | `secret789` |
| `UPSTOX_ACCESS_TOKEN` | Yes | Daily access token | `eyJhbGc...` |

---

## Daily Access Token Refresh

**Problem**: Upstox access tokens expire after midnight IST.

### Manual Solution (Quick)

1. Generate new access token daily (see README.md)
2. Update in Vercel:
   - Dashboard → Project → Settings → Environment Variables
   - Edit `UPSTOX_ACCESS_TOKEN`
   - Save (triggers automatic redeployment)

### Automated Solution (Advanced)

Create a scheduled function to refresh tokens:

1. **Install Vercel Cron**
   ```bash
   npm install @vercel/node
   ```

2. **Create API Route** (`src/app/api/cron/refresh-token/route.ts`):
   ```typescript
   export async function GET(request: Request) {
     // Verify cron secret
     const authHeader = request.headers.get('authorization');
     if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
       return Response.json({ error: 'Unauthorized' }, { status: 401 });
     }

     // Refresh Upstox token logic here
     // Store new token in database or KV store
     
     return Response.json({ success: true });
   }
   ```

3. **Add to vercel.json**:
   ```json
   {
     "crons": [{
       "path": "/api/cron/refresh-token",
       "schedule": "0 0 * * *"
     }]
   }
   ```

4. **Add CRON_SECRET** to environment variables

---

## Custom Domain (Optional)

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your domain (e.g., `stockscanner.com`)
3. Follow DNS configuration instructions
4. Update Upstox redirect URL to your custom domain

---

## Performance Optimization

### 1. Enable Caching
Add to `src/app/api/scan/route.ts`:
```typescript
export const revalidate = 15; // Cache for 15 seconds
```

### 2. Reduce Scan Scope
Limit stocks during high load:
```typescript
const STOCKS_TO_SCAN = FNO_STOCKS.slice(0, 20); // Top 20 only
```

### 3. Use Edge Runtime (Optional)
```typescript
export const runtime = 'edge';
```

---

## Monitoring & Logs

### View Logs
1. Vercel Dashboard → Your Project → Deployments
2. Click latest deployment → "View Function Logs"
3. Monitor API calls and errors

### Setup Alerts
1. Vercel → Project → Settings → Notifications
2. Enable deployment notifications
3. Add email/Slack integration

---

## Troubleshooting Deployment

### Build Fails
- Check build logs in Vercel
- Ensure all dependencies in package.json
- Verify TypeScript has no errors locally

### Database Connection Fails
- Verify DATABASE_URL format
- Check database allows connections from `0.0.0.0/0`
- Test connection string locally

### API Returns Errors
- Check Function Logs in Vercel
- Verify environment variables are set
- Ensure Upstox token is valid

### No Results in Scanner
- Verify market is open (9:15 AM - 3:30 PM IST)
- Check Upstox API quota/limits
- Lower volume multiplier to test

---

## Cost Estimation

### Free Tier Limits (Vercel)
- ✅ 100 GB bandwidth/month
- ✅ 100 hours serverless function execution/month
- ✅ Unlimited deployments
- ✅ SSL certificates included

### When You Might Upgrade
- **High traffic**: 10K+ users/month
- **Frequent scans**: Auto-refresh every 5 seconds
- **Many stocks**: Scanning 200+ symbols

### Estimated Costs (Paid Plan)
- Vercel Pro: $20/month (unlimited bandwidth)
- Database (Neon/Supabase): $0-10/month
- **Total**: $20-30/month for production app

---

## Backup & Security

### 1. Backup Environment Variables
Store securely in password manager:
- DATABASE_URL
- UPSTOX_API_KEY
- UPSTOX_API_SECRET

### 2. Enable Vercel Preview Protection
1. Settings → Deployment Protection
2. Enable "Password Protection"
3. Set password for preview deployments

### 3. Setup GitHub Branch Protection
1. GitHub Repo → Settings → Branches
2. Add rule for `main` branch
3. Require pull request reviews

---

## Rollback Procedure

If deployment has issues:

1. **Instant Rollback**
   - Vercel Dashboard → Deployments
   - Find previous working deployment
   - Click "⋯" → "Promote to Production"

2. **Code Rollback**
   ```bash
   git revert HEAD
   git push
   ```

---

## Next Steps After Deployment

1. ✅ Test all features in production
2. ✅ Setup daily token refresh workflow
3. ✅ Configure custom domain (optional)
4. ✅ Enable monitoring/alerts
5. ✅ Share with users!

---

## Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **Upstox API**: https://upstox.com/developer/
- **GitHub Issues**: Create issue in your repo
- **Vercel Community**: https://github.com/vercel/vercel/discussions

---

**Your stock scanner is now live! 🎉**

Access it at: `https://your-app-name.vercel.app`
