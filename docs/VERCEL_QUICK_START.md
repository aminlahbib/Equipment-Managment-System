# Vercel Deployment - Quick Start Guide

This is a condensed guide for deploying the Equipment Management System to Vercel. For detailed information, see [VERCEL_DEPLOYMENT_PLAN.md](./VERCEL_DEPLOYMENT_PLAN.md).

## Architecture Overview

```
Frontend (Vercel) → Backend (Railway/Render) → Database (PlanetScale)
```

## Prerequisites

- GitHub account
- Vercel account (free)
- Railway account (free trial) or Render account
- PlanetScale account (free tier)

## Step-by-Step Deployment

### 1. Database Setup (PlanetScale)

1. Go to [planetscale.com](https://planetscale.com) and sign up
2. Create a new database
3. Get connection string from Settings > Connect
4. Note: Connection string format: `mysql://user:password@host:port/database`

### 2. Backend Deployment (Railway)

1. Go to [railway.app](https://railway.app) and sign up
2. Click "New Project" > "Deploy from GitHub repo"
3. Select your repository
4. Railway will auto-detect the backend
5. Set root directory to `backend/`
6. Add environment variables:

```env
SPRING_DATASOURCE_URL=jdbc:mysql://<planetscale-host>:3306/<db>?sslMode=REQUIRED
SPRING_DATASOURCE_USERNAME=<username>
SPRING_DATASOURCE_PASSWORD=<password>
JWT_SECRET=<generate-with-openssl-rand-base64-32>
JWT_EXPIRATION=86400000
CORS_ALLOWED_ORIGINS=https://your-app.vercel.app
SPRING_PROFILES_ACTIVE=production
```

7. Deploy and note the backend URL (e.g., `https://your-app.railway.app`)

### 3. Frontend Deployment (Vercel)

1. Go to [vercel.com](https://vercel.com) and sign up
2. Click "Add New Project" > "Import Git Repository"
3. Select your repository
4. Configure:
   - **Root Directory:** `frontend`
   - **Framework Preset:** Other
   - **Build Command:** (leave empty - no build needed)
   - **Output Directory:** (leave empty)

5. Add environment variable:
   ```
   VITE_API_BASE_URL=https://your-backend.railway.app/api
   ```

6. Deploy

### 4. Update CORS in Backend

After getting your Vercel URL, update Railway environment variable:
```
CORS_ALLOWED_ORIGINS=https://your-app.vercel.app
```

Redeploy backend if needed.

## Testing

1. Visit your Vercel URL
2. Test registration/login
3. Check browser console for errors
4. Verify API calls work

## Troubleshooting

### CORS Errors
- Verify `CORS_ALLOWED_ORIGINS` includes your Vercel domain
- Check backend logs for CORS configuration

### API Connection Failed
- Verify `VITE_API_BASE_URL` is set correctly in Vercel
- Check backend is running and accessible
- Test backend URL directly in browser

### Database Connection Failed
- Verify connection string format
- Ensure SSL mode is set to REQUIRED for PlanetScale
- Check database credentials

## Environment Variables Reference

### Vercel (Frontend)
- `VITE_API_BASE_URL` - Backend API URL

### Railway (Backend)
- `SPRING_DATASOURCE_URL` - Database connection string
- `SPRING_DATASOURCE_USERNAME` - Database username
- `SPRING_DATASOURCE_PASSWORD` - Database password
- `JWT_SECRET` - JWT signing secret (generate secure random)
- `JWT_EXPIRATION` - Token expiration in milliseconds
- `CORS_ALLOWED_ORIGINS` - Comma-separated allowed origins
- `SPRING_PROFILES_ACTIVE` - Set to `production`

## Cost Estimate

- **Vercel:** Free (up to 100GB bandwidth)
- **Railway:** $5/month (starter plan)
- **PlanetScale:** Free tier available
- **Total:** $0-5/month for development

## Next Steps

- Set up custom domain (optional)
- Configure monitoring
- Set up CI/CD for auto-deployment
- Review security settings

For detailed information, see [VERCEL_DEPLOYMENT_PLAN.md](./VERCEL_DEPLOYMENT_PLAN.md).

