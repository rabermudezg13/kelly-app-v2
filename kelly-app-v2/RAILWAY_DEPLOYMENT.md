# Kelly App v2.0 - Deployment Guide for Railway

This guide will help you deploy the Kelly Education Front Desk application to Railway.

## Architecture

The application consists of:
- **Backend**: FastAPI (Python) - Port 3026
- **Frontend**: React + Vite - Port 3025
- **Database**: PostgreSQL

## Prerequisites

1. Railway account (https://railway.app)
2. GitHub repository connected
3. Railway CLI installed (optional): `npm install -g @railway/cli`

## Deployment Steps

### 1. Create a New Project in Railway

1. Go to https://railway.app/dashboard
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose `rabermudezg13/kelly-app-v2`

### 2. Add PostgreSQL Database

1. In your Railway project, click "+ New"
2. Select "Database" → "Add PostgreSQL"
3. Railway will automatically create a database and provide the `DATABASE_URL` variable

### 3. Deploy Backend Service

1. Click "+ New" → "GitHub Repo" → Select your repo
2. Configure the service:
   - **Root Directory**: `backend`
   - **Build Command**: (Auto-detected from railway.json)
   - **Start Command**: `python -m uvicorn main:app --host 0.0.0.0 --port $PORT`

3. Add Environment Variables:
   ```
   DATABASE_URL=${DATABASE_URL}  # Linked from PostgreSQL service
   SECRET_KEY=<generate-with-openssl-rand-hex-32>
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=43200
   ADMIN_EMAIL=admin@yourdomain.com
   ADMIN_PASSWORD=<your-secure-password>
   CORS_ORIGINS=<your-frontend-url>,http://localhost:3025
   ```

4. Generate a SECRET_KEY:
   ```bash
   openssl rand -hex 32
   ```

### 4. Deploy Frontend Service

1. Click "+ New" → "GitHub Repo" → Select your repo again
2. Configure the service:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm ci && npm run build`
   - **Output Directory**: `dist`

3. Add Environment Variable:
   ```
   VITE_API_URL=<your-backend-url>
   ```
   Example: `https://kelly-backend.up.railway.app`

### 5. Configure Custom Domains (Optional)

1. In each service, go to "Settings" → "Domains"
2. Click "Generate Domain" or add your custom domain
3. Update CORS_ORIGINS in backend with the frontend domain

## Environment Variables Summary

### Backend Service
| Variable | Description | Example |
|----------|-------------|---------|
| DATABASE_URL | PostgreSQL connection (auto) | From Railway PostgreSQL |
| SECRET_KEY | JWT secret key | Generate with openssl |
| ALGORITHM | JWT algorithm | HS256 |
| ACCESS_TOKEN_EXPIRE_MINUTES | Token expiration | 43200 (30 days) |
| ADMIN_EMAIL | Default admin email | admin@example.com |
| ADMIN_PASSWORD | Default admin password | SecurePassword123! |
| CORS_ORIGINS | Allowed origins | https://your-frontend.up.railway.app |

### Frontend Service
| Variable | Description | Example |
|----------|-------------|---------|
| VITE_API_URL | Backend API URL | https://your-backend.up.railway.app |

## Post-Deployment

### 1. Verify Backend
Visit `https://your-backend.up.railway.app/docs` to see the API documentation

### 2. Verify Frontend
Visit your frontend URL and try logging in with the admin credentials

### 3. Initialize Database
The backend will automatically:
- Create all necessary tables
- Initialize the default admin user
- Set up the database schema

## Troubleshooting

### Build Fails
- Check the build logs in Railway
- Verify `requirements.txt` has all dependencies
- Ensure Python version is compatible (3.9+)

### Database Connection Issues
- Verify DATABASE_URL is linked correctly
- Check that PostgreSQL service is running
- Review backend logs for connection errors

### CORS Errors
- Update CORS_ORIGINS in backend to include frontend URL
- Ensure no trailing slashes in URLs
- Redeploy backend after changes

### Frontend API Calls Fail
- Verify VITE_API_URL is set correctly
- Check that backend is deployed and running
- Inspect browser console for errors

## Monitoring

- **Logs**: View in Railway dashboard under each service
- **Metrics**: Railway provides CPU, memory, and network usage
- **Alerts**: Configure in Railway settings

## Scaling

Railway automatically scales based on usage. To configure:
1. Go to service "Settings"
2. Adjust "Resources" (CPU, memory)
3. Configure "Sleep Settings" if needed

## Cost Estimation

- **Hobby Plan**: $5/month (500 hours, 512MB RAM)
- **Pro Plan**: $20/month (includes all services)
- Database storage: Included up to limits

## Security Best Practices

1. ✅ Use strong SECRET_KEY (32+ characters)
2. ✅ Set strong ADMIN_PASSWORD
3. ✅ Configure CORS_ORIGINS restrictively
4. ✅ Use environment variables for secrets
5. ✅ Enable Railway's automatic HTTPS
6. ✅ Regularly update dependencies

## Support

For issues specific to:
- **Application**: Check application logs
- **Railway**: https://railway.app/help
- **Database**: Review PostgreSQL logs in Railway

---

**Ready to deploy!** 🚀

Follow the steps above, and your Kelly App v2.0 will be live on Railway.
