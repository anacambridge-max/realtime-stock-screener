# 📋 Setup & Deployment Checklist

Use this checklist to ensure you've completed all necessary steps.

## ✅ Pre-Setup Requirements

- [ ] Node.js 18 or higher installed
- [ ] Git installed
- [ ] PostgreSQL access (local or cloud)
- [ ] Upstox demat account
- [ ] GitHub account
- [ ] Vercel account (for deployment)

---

## 🔑 Upstox API Setup

- [ ] Registered at https://api.upstox.com/developer
- [ ] Created new app in Upstox Developer Portal
- [ ] Copied API Key (Client ID)
- [ ] Copied API Secret
- [ ] Generated OAuth authorization URL
- [ ] Completed OAuth flow and got authorization code
- [ ] Exchanged code for access token
- [ ] Saved access token securely

**Reminder**: Access token expires daily at midnight IST

---

## 💻 Local Development Setup

- [ ] Cloned repository
  ```bash
  git clone <your-repo-url>
  cd stock-scanner
  ```

- [ ] Installed dependencies
  ```bash
  npm install
  ```

- [ ] Created `.env` file
  ```bash
  cp .env.example .env
  ```

- [ ] Added environment variables to `.env`:
  - [ ] DATABASE_URL
  - [ ] UPSTOX_API_KEY
  - [ ] UPSTOX_API_SECRET
  - [ ] UPSTOX_ACCESS_TOKEN

- [ ] Setup database schema
  ```bash
  npx drizzle-kit push
  ```

- [ ] Started development server
  ```bash
  npm run dev
  ```

- [ ] Tested on http://localhost:3000
  - [ ] Page loads without errors
  - [ ] Click "Scan Now" works
  - [ ] Results appear (during market hours)

---

## 🚀 Deployment to Vercel

### Database Setup
- [ ] Created hosted PostgreSQL database
  - [ ] Option A: Neon.tech ✅
  - [ ] Option B: Supabase ✅
  - [ ] Option C: Railway ✅
- [ ] Copied connection string
- [ ] Tested connection locally

### GitHub Setup
- [ ] Created new GitHub repository
- [ ] Initialized git in local project
  ```bash
  git init
  git add .
  git commit -m "Initial commit"
  ```
- [ ] Pushed to GitHub
  ```bash
  git remote add origin <your-repo-url>
  git push -u origin main
  ```

### Vercel Deployment
- [ ] Logged into Vercel
- [ ] Clicked "New Project"
- [ ] Imported GitHub repository
- [ ] Confirmed framework preset: Next.js
- [ ] Added environment variables:
  - [ ] DATABASE_URL
  - [ ] UPSTOX_API_KEY
  - [ ] UPSTOX_API_SECRET
  - [ ] UPSTOX_ACCESS_TOKEN
- [ ] Set variables for all environments (Production, Preview, Development)
- [ ] Clicked "Deploy"
- [ ] Waited for deployment to complete
- [ ] Tested deployed URL

### Post-Deployment
- [ ] Visited deployed app URL
- [ ] Verified app loads correctly
- [ ] Tested scanner functionality
- [ ] Checked browser console for errors
- [ ] Updated Upstox app redirect URL to production domain

---

## 🔧 Configuration & Customization

- [ ] Reviewed stock list in `src/config/stocks.ts`
- [ ] Added/removed stocks as needed
- [ ] Tested custom stock configuration
- [ ] Adjusted default scanner parameters if needed
  - [ ] Default timeframe
  - [ ] Default volume multiplier
  - [ ] Default price threshold

---

## 📊 Testing Checklist

- [ ] Health check works: `/api/health`
- [ ] Scanner API works: `/api/scan`
- [ ] Dashboard loads
- [ ] Timeframe selector works (1min/3min/5min)
- [ ] Volume multiplier selector works
- [ ] Price threshold input works
- [ ] Auto-refresh selector works
- [ ] Scan Now button works
- [ ] Results display correctly
- [ ] Color coding works (green/red)
- [ ] Volume multiples display
- [ ] Timestamps are correct
- [ ] Error messages appear when appropriate
- [ ] Loading states work

---

## 🔐 Security Checklist

- [ ] `.env` file is in `.gitignore`
- [ ] No API keys in code
- [ ] Environment variables set in Vercel
- [ ] Access token stored securely
- [ ] GitHub repository is private (or public with no secrets)
- [ ] HTTPS enabled (automatic with Vercel)

---

## 📝 Documentation Review

- [ ] Read README.md
- [ ] Read SETUP.md
- [ ] Read DEPLOYMENT.md
- [ ] Read FAQ.md
- [ ] Bookmarked for future reference

---

## 🔄 Daily Maintenance

- [ ] Set calendar reminder for daily token refresh
- [ ] Saved token refresh procedure
- [ ] Tested token refresh process
- [ ] Know how to update token in Vercel:
  - Settings → Environment Variables → Edit → Save

---

## 🎯 Optional Enhancements

- [ ] Setup custom domain
- [ ] Configure Vercel analytics
- [ ] Setup error monitoring (Sentry)
- [ ] Create scheduled token refresh
- [ ] Add more stock symbols
- [ ] Customize UI theme
- [ ] Add additional filters
- [ ] Setup email alerts
- [ ] Create mobile app wrapper

---

## 📊 Monitoring & Maintenance

- [ ] Bookmarked Vercel dashboard
- [ ] Enabled deployment notifications
- [ ] Setup error alerts
- [ ] Monitoring API usage
- [ ] Checking Upstox API limits
- [ ] Reviewing function logs periodically

---

## 🐛 Troubleshooting Completed

If you encountered issues, mark what you've resolved:

- [ ] Database connection issues
- [ ] Upstox API authentication
- [ ] Build errors
- [ ] Deployment failures
- [ ] Runtime errors
- [ ] Performance issues

---

## ✨ Success Criteria

You've successfully completed setup when:

- ✅ App is live at your Vercel URL
- ✅ Scanner returns results during market hours
- ✅ All controls work as expected
- ✅ No errors in console
- ✅ API health check passes
- ✅ You can refresh access token daily

---

## 🎓 Learning Completed

- [ ] Understand Upstox API basics
- [ ] Know how OAuth flow works
- [ ] Understand scanner logic
- [ ] Can modify stock list
- [ ] Can adjust scanner parameters
- [ ] Know how to deploy updates
- [ ] Can troubleshoot common issues

---

## 📞 Next Steps

Once everything is checked:

1. **Test during market hours** (9:15 AM - 3:30 PM IST)
2. **Monitor results** for a few days
3. **Adjust filters** based on your needs
4. **Share feedback** via GitHub Issues
5. **Contribute improvements** via Pull Requests

---

## 🎉 Congratulations!

If you've checked all the essential boxes, you're ready to use your stock scanner!

### Daily Routine
- Morning: Refresh access token
- Market hours: Monitor scanner
- Evening: Review results

### Weekly Routine
- Check for updates
- Review API usage
- Monitor performance
- Backup environment variables

---

**Need Help?**
- 📖 Check FAQ.md
- 🐛 Open GitHub Issue
- 💬 Ask in Discussions

**Happy Scanning! 📊🚀**

---

Last Updated: 2026-01-10
