# Coolify Deployment Guide for Diverse Quiz Hub

This guide provides specific instructions for deploying the Diverse Quiz Hub application on Coolify.

## Prerequisites

- Coolify instance set up and running
- Git repository access
- Database connection (if using external database)

## Deployment Steps

### 1. Create New Application in Coolify

1. Log into your Coolify dashboard
2. Click "New Resource" → "Application"
3. Choose "Git Repository" as source
4. Connect your repository containing this project

### 2. Configure Build Settings

In your Coolify application settings:

**Build Configuration:**
- **Build Pack:** Docker
- **Dockerfile Location:** `./Dockerfile` (root directory)
- **Build Context:** `.` (root directory)

### 3. Environment Variables

Set the following environment variables in Coolify:

```env
NODE_ENV=production
PORT=3003

# Database Configuration (if using external DB)
DATABASE_URL=your_database_connection_string

# Google OAuth (if using)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Session Configuration
SESSION_SECRET=your_session_secret_key

# Replit Configuration (if migrating from Replit)
REPLIT_DOMAINS=your_domain.com
```

### 4. Port Configuration

**Primary Port:** `3003`
**Additional Ports:** `5173` (if needed for development)

### 5. Health Check Configuration

**Health Check Path:** `/api/health`
**Health Check Port:** `3003`
**Health Check Interval:** `30s`

### 6. Volume Mounts (Optional)

If you need persistent storage for uploaded assets:

**Source:** `./attached_assets`
**Destination:** `/app/attached_assets`
**Type:** `bind`

### 7. Domain Configuration

1. Set up your custom domain in Coolify
2. Configure SSL certificate (Coolify can auto-generate Let's Encrypt certificates)
3. Update any hardcoded URLs in your application to use the new domain

## Dockerfile Optimizations for Coolify

The Dockerfile has been optimized for Coolify deployment:

- ✅ Uses `npm ci` to install all dependencies (including devDependencies for tsx)
- ✅ Exposes both ports 3003 and 5173
- ✅ Uses `npx tsx` to run TypeScript files directly
- ✅ Includes proper user permissions and security

## Troubleshooting

### Common Issues and Solutions

**1. TypeScript Execution Error**
```
Error: Cannot find module 'tsx'
```
**Solution:** The Dockerfile now installs all dependencies including devDependencies.

**2. Permission Denied Errors**
```
Permission denied (publickey,password)
```
**Solution:** Ensure your Git repository is properly connected in Coolify and SSH keys are configured.

**3. Build Failures**
```
npm ERR! code ELIFECYCLE
```
**Solution:** Check that all required environment variables are set in Coolify.

**4. Database Connection Issues**
```
Connection refused
```
**Solution:** Verify DATABASE_URL environment variable and ensure database is accessible from Coolify.

### Logs and Debugging

1. **View Build Logs:** Go to your application → Deployments → Click on latest deployment
2. **View Runtime Logs:** Go to your application → Logs tab
3. **Check Health Status:** Monitor the health check endpoint at `/api/health`

## Post-Deployment Checklist

- [ ] Application starts successfully
- [ ] Health check endpoint responds at `/api/health`
- [ ] Database connections work (if applicable)
- [ ] Authentication flows work (Google OAuth, etc.)
- [ ] Static assets load correctly
- [ ] WebSocket connections work for real-time features
- [ ] All API endpoints respond correctly

## Scaling and Performance

For production deployments:

1. **Resource Allocation:**
   - CPU: 1-2 cores minimum
   - RAM: 2-4 GB minimum
   - Storage: 10-20 GB minimum

2. **Database Optimization:**
   - Use connection pooling
   - Configure proper indexes
   - Monitor query performance

3. **Monitoring:**
   - Set up application monitoring
   - Configure log aggregation
   - Set up alerts for downtime

## Backup and Recovery

1. **Database Backups:** Configure regular database backups
2. **Application Data:** Backup any persistent volumes
3. **Environment Variables:** Keep a secure backup of all environment variables

## Support

If you encounter issues:

1. Check Coolify documentation
2. Review application logs in Coolify dashboard
3. Verify all environment variables are correctly set
4. Test the application locally with Docker to isolate issues
