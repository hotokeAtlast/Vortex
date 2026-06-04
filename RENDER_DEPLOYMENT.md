# Vortex - Render.com Deployment Guide

## Overview
This guide provides step-by-step instructions for deploying the Vortex application on Render.com with proper port binding and server-keep-alive configuration.

## What's Been Fixed

### 1. **Port Binding Issue** ✅
- **Problem**: Server wasn't binding to `0.0.0.0`, causing Render to fail port detection
- **Solution**: Updated `server/server.js` to explicitly listen on `0.0.0.0:PORT`
  ```javascript
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Listening on 0.0.0.0:${PORT}`);
  });
  ```

### 2. **Health Check Endpoint** ✅
- The `/api/health` endpoint is already implemented
- Returns: `{ status: 'active', message: 'The Vortex is awake.' }`
- Used by Render for health monitoring and cron jobs

### 3. **Render Configuration** ✅
- Created `render.yaml` with proper service and cron job configuration
- Cron job pings `/api/health` every 10 minutes to keep the server from sleeping

---

## Deployment Steps on Render.com

### Step 1: Prepare Your Repository
```bash
git add .
git commit -m "Configure for Render deployment"
git push origin main
```

### Step 2: Create Web Service on Render

1. Go to [https://dashboard.render.com](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Select your GitHub repository (Vortex)
4. Fill in the details:
   - **Name**: `vortex-backend` (or your preferred name)
   - **Region**: Select closest to your users
   - **Branch**: `main` (or your default branch)
   - **Runtime**: `Node`
   - **Build Command**: `cd server && npm install`
   - **Start Command**: `cd server && npm start`

### Step 3: Set Environment Variables

In the Render dashboard, add these environment variables:

| Key | Value | Notes |
|-----|-------|-------|
| `NODE_ENV` | `production` | Production environment |
| `FRONTEND_URL` | `https://your-frontend.onrender.com` | Update with your frontend URL |
| `RAZORPAY_KEY_ID` | Your production key | Get from Razorpay dashboard |
| `RAZORPAY_KEY_SECRET` | Your production secret | Get from Razorpay dashboard |

### Step 4: Deploy

1. Click **"Create Web Service"**
2. Render will automatically build and deploy your service
3. You'll get a URL like: `https://vortex-backend.onrender.com`

### Step 5: Set Up Health Check (Render Dashboard)

1. Go to your Web Service settings
2. Under **"Health Check"**:
   - **Path**: `/api/health`
   - **Check Interval**: `30` seconds

### Step 6: Create Cron Job (Keep Server Alive)

1. In your Render dashboard, go to **"Cron Jobs"**
2. Click **"New Cron Job"**
3. Configure:
   - **Name**: `vortex-keep-alive`
   - **Frequency**: `Every 10 minutes` (or `*/10 * * * *`)
   - **HTTP Method**: `GET`
   - **HTTP Path**: `/api/health`
   - **Target**: Select your `vortex-backend` web service
4. Click **"Create"**

---

## Testing

### Local Testing
```bash
cd server
npm install
npm start
```

Test the health endpoint:
```bash
curl http://localhost:5000/api/health
# Response: {"status":"active","message":"The Vortex is awake."}
```

### After Deployment
```bash
curl https://your-vortex-backend.onrender.com/api/health
# Response: {"status":"active","message":"The Vortex is awake."}
```

---

## Troubleshooting

### Issue: "No open ports detected on 0.0.0.0"
- ✅ **Fixed**: Server now binds to `0.0.0.0`
- Verify with: `console.log` should show `Listening on 0.0.0.0:PORT`

### Issue: Server keeps sleeping/crashing
- ✅ **Solution**: Cron job configured to ping every 10 minutes
- Verify cron job is active in Render dashboard

### Issue: Build fails
- Check build command: `cd server && npm install`
- Ensure `server/package.json` exists
- Check logs in Render dashboard

### Issue: Environment variables not working
- Verify all keys are set in Render dashboard
- No quotes needed for values in Render's environment variable UI
- Restart the web service after changing variables

---

## File Changes Summary

| File | Change |
|------|--------|
| `server/server.js` | Added `0.0.0.0` binding to `app.listen()` |
| `render.yaml` | Created with service and cron job config |
| `server/.env` | Added deployment instructions |

---

## Important Notes

1. **Render's Free Tier**: Services spin down after 15 minutes of inactivity. The cron job keeps it alive by pinging `/api/health` every 10 minutes.
2. **Production Keys**: Use production Razorpay keys in the Render environment, NOT test keys.
3. **CORS**: Update `FRONTEND_URL` in environment variables to match your frontend domain.
4. **Port**: Render may assign a different port than 5000. The `PORT` environment variable handles this automatically.

---

## Support Links

- [Render Web Services Documentation](https://render.com/docs/web-services)
- [Render Cron Jobs Documentation](https://render.com/docs/cronjobs)
- [Render Environment Variables](https://render.com/docs/environment-variables)
- [Render Database Guide](https://render.com/docs/databases)
