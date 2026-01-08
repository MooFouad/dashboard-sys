# Portfolio Version Setup Guide

## 🚨 CRITICAL: Isolating Portfolio from Production

This guide ensures your portfolio version is **completely separate** from your live production system.

---

## Option 1: Separate GitHub Repository (RECOMMENDED)

### Step 1: Create New MongoDB Database for Portfolio

1. **Go to MongoDB Atlas** (https://cloud.mongodb.com)
2. **Create a NEW cluster** (use free tier)
   - Cluster name: `gts-demo` or `gts-portfolio`
   - Region: Choose closest to your deployment region
3. **Create database user**
   - Username: `gts_demo_user`
   - Password: Generate strong password (save it!)
4. **Network Access**
   - Add IP: `0.0.0.0/0` (allow from anywhere - safe for demo)
5. **Get connection string**
   - Click "Connect" → "Connect your application"
   - Copy the connection string
   - Example: `mongodb+srv://gts_demo_user:PASSWORD@demo-cluster.xxxxx.mongodb.net/gts-demo`

### Step 2: Create Separate GitHub Repository

```bash
# Navigate to your project
cd "D:/GTS/New folder/gts-dashboard"

# Initialize new git repository (if not already)
git init

# Create new repository on GitHub named "gts-dashboard-portfolio"

# Add remote
git remote add origin https://github.com/YOUR_USERNAME/gts-dashboard-portfolio.git

# Create .gitignore to exclude sensitive files
# (already done in previous steps)
```

### Step 3: Update Backend .env for Portfolio ONLY

**IMPORTANT:** Create a **NEW** `.env` file with DEMO credentials:

```env
# ========================================
# PORTFOLIO DEMO ENVIRONMENT
# ========================================
# This .env is for PORTFOLIO VERSION ONLY
# DO NOT use production credentials here!
# ========================================

# Demo MongoDB Database (NEW cluster)
MONGODB_URI=mongodb+srv://gts_demo_user:YOUR_NEW_PASSWORD@demo-cluster.xxxxx.mongodb.net/gts-demo?retryWrites=true&w=majority

# Server Configuration
PORT=5000
NODE_ENV=production
ALLOWED_ORIGINS=http://localhost:5173,https://your-portfolio-frontend.vercel.app
DISABLE_RATE_LIMIT=false

# DEMO MODE - Always true for portfolio
DEMO_MODE=true

# JWT Secret (NEW - never use production key)
JWT_SECRET=8df1698c0e3f92964e7b3a4fe56065c3a6aa38c9216bbdd70f10c0eca5de2a05a58db35342d171662d5bd86d5744b29d5a70518eae4904fce3a329dceee8d009

# VAPID Keys for Push Notifications (NEW - different from production)
VAPID_PUBLIC_KEY=BFme8MomUeiPyMe1mEa49Z7oY16I4sAGkoiH6JCG47JIZ67TuZGIKQn08i9iuwJvEWbatWIHoptRX8Z-6BWsyM0
VAPID_PRIVATE_KEY=6zjHYXfZRV9zU2AOtz0aUDdz4zNghktpd1QnhrIRO9w
VAPID_EMAIL=mailto:demo@gts-demo.com

# Email Configuration (OPTIONAL - can leave empty for demo)
EMAIL_SERVICE=gmail
EMAIL_USER=
EMAIL_PASS=
EMAIL_FROM=

# App Configuration
APP_URL=http://localhost:5173
NOTIFICATION_DAYS_BEFORE=10
NOTIFICATION_CHECK_HOUR=9

# External APIs - NOT USED in demo mode (mocked)
GOSI_API_KEY=
GOSI_CLIENT_ID=
GOSI_CLIENT_SECRET=
GOSI_REGISTRATION_NUMBER=
GOSI_PRIVATE_KEY=
TAMM_CLIENT_ID=
TAMM_CLIENT_SECRET=
TAMM_USER_ID_NUMBER=
TAMM_CUSTOMER_ID=
```

### Step 4: Update Frontend .env for Portfolio

```env
# Portfolio Frontend
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=GTS Dashboard
VITE_APP_VERSION=1.0.0

# VAPID key (must match backend)
VITE_VAPID_PUBLIC_KEY=BFme8MomUeiPyMe1mEa49Z7oY16I4sAGkoiH6JCG47JIZ67TuZGIKQn08i9iuwJvEWbatWIHoptRX8Z-6BWsyM0

VITE_USE_API=true
```

### Step 5: Seed Demo Database

```bash
cd backend

# This will populate your NEW demo database (not production!)
npm run seed
```

### Step 6: Verify Separation

**Check that portfolio version uses ONLY demo resources:**

✅ **MongoDB:**
- Portfolio: `gts-demo` database on NEW cluster
- Production: Your existing production database (UNTOUCHED)

✅ **Push Notifications:**
- Portfolio: New VAPID keys (different from production)
- Production: Your existing VAPID keys (UNTOUCHED)

✅ **Email:**
- Portfolio: Empty/disabled OR separate Gmail account
- Production: Your existing email (UNTOUCHED)

✅ **External APIs:**
- Portfolio: Mocked (DEMO_MODE=true)
- Production: Real GOSI/TAMM connections (UNTOUCHED)

---

## Option 2: Git Branch Strategy

If you want to keep portfolio in same repo:

```bash
# Create portfolio branch
git checkout -b portfolio

# Make all portfolio changes in this branch
# Keep production code in main/master branch

# NEVER merge portfolio branch to main!
# Deploy portfolio branch separately
```

---

## Deployment Checklist

Before deploying portfolio version, verify:

- [ ] Using separate MongoDB database (NOT production)
- [ ] DEMO_MODE=true in backend .env
- [ ] New VAPID keys (different from production)
- [ ] No production API credentials in code
- [ ] All sensitive files in .gitignore
- [ ] README.md clearly states "Portfolio Demo"
- [ ] Demo credentials displayed on login
- [ ] Guest mode working
- [ ] Push notifications use separate keys or disabled

---

## What Happens When Users Use Portfolio?

### Data Changes
- ✅ **Safe:** All data goes to demo database
- ✅ **No impact** on production database
- ✅ **Can reset** anytime with `npm run reset:demo`

### Notifications
- ✅ **Safe:** Uses separate VAPID keys
- ✅ **No impact** on production notification subscribers
- ⚠️ **Optional:** Disable email notifications entirely (leave EMAIL_USER empty)

### API Calls
- ✅ **Safe:** All GOSI/TAMM calls are mocked (DEMO_MODE=true)
- ✅ **No impact** on your production API quotas
- ✅ **No real data** fetched

---

## Testing Portfolio Locally

1. **Start backend with demo database:**
   ```bash
   cd backend
   npm run dev
   # Should connect to demo database, not production
   ```

2. **Start frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Verify in browser:**
   - Login page shows demo credentials
   - "Try as Guest" button works
   - Header shows "Portfolio Demo" badge
   - No production data visible

---

## Emergency: If You Accidentally Used Production

If you accidentally ran the seed script on production database:

```bash
# DON'T PANIC - your backups are safe

# Option 1: Restore from backup
cd backend
npm run restore

# Option 2: Manual cleanup
# Delete only the seeded demo users:
# - demo@gts-demo.com
# - user@gts-demo.com
# - viewer@gts-demo.com
# Leave your real users untouched
```

---

## Summary: Keep These Separate

| Resource | Production | Portfolio |
|----------|-----------|-----------|
| **MongoDB** | `gts-dashboard` (production cluster) | `gts-demo` (NEW cluster) |
| **VAPID Keys** | Your production keys | NEW keys we generated |
| **Email** | Your production email | Empty OR separate account |
| **APIs** | Real GOSI/TAMM | Mocked (DEMO_MODE=true) |
| **Domain** | Your production domain | portfolio-demo.vercel.app |
| **Repository** | Private (company) | Public (portfolio) |

---

## Next Steps

1. ✅ Create new MongoDB Atlas cluster for demo
2. ✅ Update backend/.env with demo database URI
3. ✅ Verify DEMO_MODE=true
4. ✅ Run `npm run seed` to populate demo database
5. ✅ Test locally - ensure no production connection
6. ✅ Deploy to Vercel/Render with demo credentials
7. ✅ Share portfolio link on LinkedIn!

---

**Questions? Double-check that .env uses demo database before any deployment!**
