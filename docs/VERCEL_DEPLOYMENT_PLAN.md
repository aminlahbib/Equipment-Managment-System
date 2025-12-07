# Vercel Deployment Plan - Equipment Management System

**Assessment Date:** 2024  
**Assessed By:** Senior Full-Stack Developer & Cloud Engineer  
**Target Platform:** Vercel (Frontend) + Cloud Backend + Managed Database

---

## Executive Summary

This document outlines a comprehensive deployment strategy to migrate the Equipment Management System from Docker/Kubernetes to a Vercel-based architecture. The plan addresses the architectural challenges of deploying a Spring Boot backend and MySQL database alongside a Vercel-hosted frontend.

**Key Challenge:** Vercel does not natively support Java/Spring Boot applications. The backend must be deployed to a separate platform.

**Recommended Architecture:**
- **Frontend:** Vercel (Static Site Hosting)
- **Backend:** Railway/Render/AWS (Spring Boot Support)
- **Database:** PlanetScale/Supabase (Managed MySQL)

---

## Current Architecture Analysis

### Current Stack
```
┌─────────────┐      ┌──────────────┐      ┌──────────────┐
│   Frontend  │─────▶│   Backend    │─────▶│    MySQL     │
│  (Nginx)    │      │ (Spring Boot)│      │   Database   │
│   Port 8081 │      │   Port 8080  │      │   Port 3306  │
└─────────────┘      └──────────────┘      └──────────────┘
```

### Key Components
1. **Frontend:** Vanilla JavaScript SPA with client-side routing
2. **Backend:** Spring Boot 3.2.3 REST API with JWT authentication
3. **Database:** MySQL 8.0 with Flyway migrations
4. **Infrastructure:** Docker Compose / Kubernetes

### Deployment Constraints

**Vercel Limitations:**
- ✅ Supports static sites and serverless functions
- ✅ Excellent for frontend frameworks (React, Next.js, Vue, etc.)
- ❌ Does NOT support Java/Spring Boot applications
- ❌ Does NOT provide managed databases
- ❌ Serverless functions limited to Node.js, Python, Go, Ruby

**Solution:** Hybrid deployment architecture

---

## Proposed Architecture

### Target Architecture
```
┌─────────────────┐      ┌──────────────────┐      ┌──────────────────┐
│   Frontend      │─────▶│   Backend API    │─────▶│   Managed DB     │
│   (Vercel)      │      │  (Railway/Render)│      │  (PlanetScale)   │
│   Static Host   │      │  Spring Boot     │      │  MySQL 8.0       │
│   vercel.app    │      │  *.railway.app   │      │  PlanetScale.io  │
└─────────────────┘      └──────────────────┘      └──────────────────┘
```

### Component Breakdown

#### 1. Frontend (Vercel)
- **Platform:** Vercel
- **Type:** Static Site Hosting
- **Build:** No build step required (vanilla JS)
- **Routing:** Client-side routing with `vercel.json` rewrites
- **Environment Variables:** API base URL configuration

#### 2. Backend (Railway/Render)
- **Platform Options:**
  - **Railway** (Recommended): Excellent Java support, easy deployment
  - **Render:** Good Java support, free tier available
  - **AWS Elastic Beanstalk:** Enterprise-grade, more complex
  - **Google Cloud Run:** Container-based, pay-per-use
- **Type:** Containerized Spring Boot application
- **Database Connection:** External managed database

#### 3. Database (PlanetScale/Supabase)
- **Platform Options:**
  - **PlanetScale** (Recommended): MySQL-compatible, serverless, branching
  - **Supabase:** PostgreSQL (requires migration)
  - **AWS RDS:** Full MySQL support, more expensive
  - **Railway Database:** Simple, integrated with Railway
- **Type:** Managed MySQL 8.0
- **Migrations:** Flyway (already configured)

---

## Deployment Plan

### Phase 1: Database Setup

#### Option A: PlanetScale (Recommended)

**Steps:**
1. Create PlanetScale account
2. Create new database
3. Get connection string
4. Run Flyway migrations

**Connection String Format:**
```
jdbc:mysql://<host>:3306/<database>?sslMode=REQUIRED
```

**Advantages:**
- MySQL-compatible (no code changes)
- Serverless scaling
- Branching for schema changes
- Free tier available

#### Option B: Railway Database

**Steps:**
1. Create Railway project
2. Add MySQL database service
3. Get connection string from environment variables
4. Run migrations

**Advantages:**
- Integrated with Railway backend
- Simple setup
- Automatic backups

### Phase 2: Backend Deployment

#### Option A: Railway (Recommended)

**Prerequisites:**
- Railway account
- GitHub repository connected
- Database connection string

**Steps:**

1. **Create Railway Project**
   ```bash
   # Install Railway CLI
   npm i -g @railway/cli
   
   # Login
   railway login
   
   # Initialize project
   railway init
   ```

2. **Configure Railway**
   - Connect GitHub repository
   - Set root directory to `backend/`
   - Configure build command: `mvn clean package -DskipTests`
   - Set start command: `java -jar target/equipment-management-0.0.1-SNAPSHOT.jar`

3. **Environment Variables**
   ```env
   SPRING_DATASOURCE_URL=jdbc:mysql://<planetscale-host>:3306/<db>?sslMode=REQUIRED
   SPRING_DATASOURCE_USERNAME=<username>
   SPRING_DATASOURCE_PASSWORD=<password>
   JWT_SECRET=<generate-secure-secret>
   JWT_EXPIRATION=86400000
   SPRING_PROFILES_ACTIVE=production
   ```

4. **Deploy**
   ```bash
   railway up
   ```

5. **Get Backend URL**
   - Railway provides: `https://<app-name>.railway.app`
   - Note this URL for frontend configuration

#### Option B: Render

**Steps:**

1. **Create Render Account**
2. **Create Web Service**
   - Connect GitHub repository
   - Root directory: `backend`
   - Build command: `mvn clean package -DskipTests`
   - Start command: `java -jar target/equipment-management-0.0.1-SNAPSHOT.jar`
   - Environment: Java 17

3. **Environment Variables** (same as Railway)

4. **Deploy**
   - Render auto-deploys on git push

### Phase 3: Frontend Configuration

#### 1. Update API Configuration

**Create `frontend/js/config.js`:**
```javascript
// Environment-aware API configuration
const getApiBaseUrl = () => {
  // Check for environment variable (Vercel)
  if (import.meta.env?.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  // Check for window config (injected by Vercel)
  if (window.API_BASE_URL) {
    return window.API_BASE_URL;
  }
  
  // Development fallback
  return 'http://localhost:8080/api';
};

export const API_BASE_URL = getApiBaseUrl();
```

**Update `frontend/js/api.js`:**
```javascript
import { API_BASE_URL } from './config.js';

const baseUrl = `${API_BASE_URL}/benutzer`;
// ... rest of the code
```

#### 2. Create Vercel Configuration

**Create `vercel.json` in project root:**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "frontend/**",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/frontend/$1"
    },
    {
      "src": "/templates/(.*)",
      "dest": "/frontend/templates/$1"
    },
    {
      "src": "/js/(.*)",
      "dest": "/frontend/js/$1"
    },
    {
      "src": "/css/(.*)",
      "dest": "/frontend/css/$1"
    },
    {
      "src": "/assets/(.*)",
      "dest": "/frontend/assets/$1"
    },
    {
      "src": "/(.*\\.(html|js|css|ico|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot))",
      "dest": "/frontend/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/frontend/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

**Alternative: Deploy frontend folder directly**

If deploying from `frontend/` directory:

**Create `frontend/vercel.json`:**
```json
{
  "version": 2,
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        }
      ]
    }
  ]
}
```

#### 3. Update CORS Configuration

**Update `backend/src/main/java/com/equipment/config/SecurityConfig.java`:**
```java
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    
    // Get allowed origins from environment variable
    String allowedOrigins = System.getenv("CORS_ALLOWED_ORIGINS");
    if (allowedOrigins != null && !allowedOrigins.isEmpty()) {
        configuration.setAllowedOrigins(Arrays.asList(allowedOrigins.split(",")));
    } else {
        // Default for development
        configuration.setAllowedOrigins(Arrays.asList(
            "http://localhost:8081",
            "http://localhost:3000",
            "https://*.vercel.app"
        ));
    }
    
    configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
    configuration.setAllowedHeaders(Arrays.asList("*"));
    configuration.setAllowCredentials(true);
    configuration.setMaxAge(3600L);

    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);
    return source;
}
```

### Phase 4: Vercel Deployment

#### 1. Install Vercel CLI
```bash
npm i -g vercel
```

#### 2. Login to Vercel
```bash
vercel login
```

#### 3. Deploy Frontend
```bash
cd frontend
vercel
```

Or connect GitHub repository:
1. Go to vercel.com
2. Import project from GitHub
3. Set root directory to `frontend/`
4. Configure environment variables
5. Deploy

#### 4. Environment Variables (Vercel Dashboard)

Set in Vercel project settings:
```
VITE_API_BASE_URL=https://your-backend.railway.app/api
```

Or use Vercel's environment variable injection:
```javascript
// In frontend/index.html, add before closing </body>:
<script>
  window.API_BASE_URL = 'https://your-backend.railway.app/api';
</script>
```

### Phase 5: Testing & Verification

#### 1. Test Frontend
- Access Vercel deployment URL
- Verify static assets load
- Test client-side routing

#### 2. Test API Connection
- Open browser console
- Check for CORS errors
- Test login/register endpoints

#### 3. Test Authentication Flow
- Register new user
- Login
- Access protected routes
- Test JWT token handling

---

## Configuration Files

### 1. Frontend Environment Configuration

**Create `frontend/.env.production`:**
```env
VITE_API_BASE_URL=https://your-backend.railway.app/api
```

**Create `frontend/.env.local` (for local development):**
```env
VITE_API_BASE_URL=http://localhost:8080/api
```

### 2. Backend Production Profile

**Create `backend/src/main/resources/application-production.properties`:**
```properties
# Production profile
spring.profiles.active=production

# Database (from environment variables)
spring.datasource.url=${SPRING_DATASOURCE_URL}
spring.datasource.username=${SPRING_DATASOURCE_USERNAME}
spring.datasource.password=${SPRING_DATASOURCE_PASSWORD}

# JWT
jwt.secret=${JWT_SECRET}
jwt.expiration=${JWT_EXPIRATION}

# CORS
cors.allowed.origins=${CORS_ALLOWED_ORIGINS:https://your-app.vercel.app}

# Logging
logging.level.root=INFO
logging.level.com.equipment=INFO

# Actuator
management.endpoints.web.exposure.include=health,info
management.endpoint.health.show-details=never
```

### 3. Railway Configuration

**Create `railway.json` (optional):**
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "mvn clean package -DskipTests"
  },
  "deploy": {
    "startCommand": "java -jar target/equipment-management-0.0.1-SNAPSHOT.jar",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

---

## Migration Checklist

### Pre-Deployment
- [ ] Set up PlanetScale database
- [ ] Run Flyway migrations on production database
- [ ] Test database connection
- [ ] Generate secure JWT secret
- [ ] Update CORS configuration in backend
- [ ] Create production Spring profile
- [ ] Update frontend API configuration

### Backend Deployment
- [ ] Create Railway/Render account
- [ ] Connect GitHub repository
- [ ] Configure build settings
- [ ] Set environment variables
- [ ] Deploy backend
- [ ] Verify backend health endpoint
- [ ] Test API endpoints
- [ ] Verify CORS headers

### Frontend Deployment
- [ ] Update API base URL configuration
- [ ] Create `vercel.json` configuration
- [ ] Test local build
- [ ] Deploy to Vercel
- [ ] Configure environment variables in Vercel
- [ ] Verify frontend loads
- [ ] Test API connectivity
- [ ] Test authentication flow

### Post-Deployment
- [ ] Monitor backend logs
- [ ] Monitor database connections
- [ ] Test all user flows
- [ ] Verify error handling
- [ ] Set up monitoring/alerting
- [ ] Document deployment process
- [ ] Update README with deployment info

---

## Cost Estimation

### Vercel (Frontend)
- **Free Tier:** 
  - 100GB bandwidth/month
  - Unlimited deployments
  - Perfect for this project
- **Pro Tier ($20/month):** 
  - 1TB bandwidth
  - Team features
  - Only needed for high traffic

### Railway (Backend)
- **Free Trial:** $5 credit/month
- **Starter ($5/month):**
  - $5 credit included
  - Pay-as-you-go after
- **Estimated Cost:** $5-15/month for small app

### PlanetScale (Database)
- **Free Tier:**
  - 1 database
  - 1GB storage
  - 1 billion row reads/month
  - Perfect for development/small apps
- **Scaler ($29/month):**
  - 10GB storage
  - 10 billion row reads/month
  - Production-ready

### Total Estimated Cost
- **Development/Testing:** $0/month (all free tiers)
- **Small Production:** $5-15/month (Railway only)
- **Production with Scaling:** $34-44/month

---

## Alternative Deployment Options

### Option 1: All-in-One Platform (Simpler)

**Render (Full Stack)**
- Frontend: Static Site
- Backend: Web Service
- Database: PostgreSQL (requires migration)
- **Cost:** Free tier available, $7/month for database

**Advantages:**
- Single platform
- Simpler management
- Integrated services

**Disadvantages:**
- PostgreSQL migration required
- Less flexible than Vercel for frontend

### Option 2: AWS (Enterprise)

**Architecture:**
- Frontend: S3 + CloudFront
- Backend: Elastic Beanstalk or ECS
- Database: RDS MySQL

**Advantages:**
- Enterprise-grade
- Highly scalable
- Full control

**Disadvantages:**
- More complex setup
- Higher cost
- Steeper learning curve

### Option 3: Google Cloud

**Architecture:**
- Frontend: Firebase Hosting
- Backend: Cloud Run
- Database: Cloud SQL

**Advantages:**
- Good free tier
- Serverless backend
- Integrated services

**Disadvantages:**
- More complex than Railway
- Requires GCP knowledge

---

## Security Considerations

### 1. Environment Variables
- ✅ Never commit secrets to git
- ✅ Use platform secret management
- ✅ Rotate JWT secrets regularly
- ✅ Use different secrets for dev/prod

### 2. CORS Configuration
- ✅ Whitelist specific origins
- ✅ Don't use wildcard in production
- ✅ Include Vercel domain explicitly

### 3. Database Security
- ✅ Use SSL/TLS connections
- ✅ Restrict database access
- ✅ Use strong passwords
- ✅ Enable connection pooling

### 4. API Security
- ✅ Keep Spring Boot updated
- ✅ Enable HTTPS only
- ✅ Implement rate limiting (future)
- ✅ Monitor for suspicious activity

---

## Monitoring & Maintenance

### 1. Backend Monitoring
- Railway/Render provide built-in logs
- Add application monitoring (optional):
  - Sentry for error tracking
  - Datadog/New Relic for APM

### 2. Database Monitoring
- PlanetScale provides dashboard
- Monitor connection counts
- Track query performance

### 3. Frontend Monitoring
- Vercel Analytics (built-in)
- Error tracking (Sentry)
- Performance monitoring

### 4. Backup Strategy
- PlanetScale: Automatic backups
- Railway: Manual database exports
- Document restore procedures

---

## Troubleshooting Guide

### Common Issues

#### 1. CORS Errors
**Symptom:** Browser console shows CORS errors

**Solution:**
- Verify CORS_ALLOWED_ORIGINS includes Vercel domain
- Check backend CORS configuration
- Ensure credentials are allowed

#### 2. API Connection Failed
**Symptom:** Frontend can't reach backend

**Solution:**
- Verify backend URL in environment variables
- Check backend is running
- Verify network connectivity
- Check firewall rules

#### 3. Database Connection Failed
**Symptom:** Backend can't connect to database

**Solution:**
- Verify connection string
- Check SSL mode (PlanetScale requires SSL)
- Verify credentials
- Check database is accessible

#### 4. 404 on Client Routes
**Symptom:** Direct URL access returns 404

**Solution:**
- Verify `vercel.json` rewrites configuration
- Ensure all routes redirect to `index.html`
- Check file structure matches routes

---

## Next Steps

1. **Choose Deployment Platform**
   - Review cost and features
   - Select Railway/Render for backend
   - Select PlanetScale for database

2. **Set Up Database**
   - Create PlanetScale account
   - Create database
   - Run migrations

3. **Deploy Backend**
   - Set up Railway/Render project
   - Configure environment variables
   - Deploy and test

4. **Configure Frontend**
   - Update API configuration
   - Create Vercel configuration
   - Test locally

5. **Deploy Frontend**
   - Deploy to Vercel
   - Configure environment variables
   - Test end-to-end

6. **Monitor & Optimize**
   - Set up monitoring
   - Optimize performance
   - Document issues and solutions

---

## Conclusion

This deployment plan provides a comprehensive strategy for migrating the Equipment Management System to Vercel while maintaining the Spring Boot backend and MySQL database. The hybrid architecture leverages the strengths of each platform:

- **Vercel:** Excellent frontend hosting with global CDN
- **Railway/Render:** Simple Java/Spring Boot deployment
- **PlanetScale:** Managed MySQL with serverless scaling

The estimated cost is minimal for development/testing (free tiers) and reasonable for production ($5-44/month depending on scale).

**Recommended Path:** Start with Railway + PlanetScale + Vercel for the simplest deployment experience with good scalability options.

---

**Document Version:** 1.0  
**Last Updated:** 2024  
**Status:** Ready for Implementation

