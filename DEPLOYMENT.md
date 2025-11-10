# Deployment Guide

This guide will help you deploy the Notebook & Checklist app to production.

## Prerequisites

- GitHub account
- Vercel account (free tier available)
- Supabase project already set up
- Node.js and npm installed locally

## Step 1: Push to GitHub

### Create a GitHub Repository

1. Go to [github.com/new](https://github.com/new)
2. Create a new repository named `notebook-app`
3. Copy the repository URL

### Push Your Code

```bash
cd ~/Desktop/Projects/notebook-app

# Initialize git if not already done
git remote add origin https://github.com/YOUR_USERNAME/notebook-app.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Step 2: Deploy to Vercel

### Option A: Deploy from Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Sign in with your GitHub account
3. Click "New Project"
4. Select your `notebook-app` repository
5. Click "Import"

### Option B: Deploy with Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

## Step 3: Configure Environment Variables

1. In Vercel dashboard, go to your project settings
2. Click "Environment Variables"
3. Add the following variables:
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key

4. Make sure they are available in all environments (Production, Preview, Development)

## Step 4: Configure Custom Domain (Optional)

1. In Vercel project settings, go to "Domains"
2. Click "Add Domain"
3. Enter your custom domain
4. Follow DNS configuration instructions

## Step 5: Post-Deployment Configuration

### Update Supabase

1. Go to your Supabase project settings
2. Go to "Auth" → "Authorized redirect URLs"
3. Add your Vercel domain:
   ```
   https://your-app.vercel.app/auth/callback
   https://your-domain.com/auth/callback
   ```

### Enable CORS in Supabase (if needed)

1. Go to Supabase project settings
2. API → CORS settings
3. Add your Vercel domain and custom domain

## Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Vercel project created and linked to GitHub
- [ ] Environment variables configured in Vercel
- [ ] Build successful in Vercel
- [ ] App loads without errors
- [ ] Authentication works
- [ ] Notebooks can be created/edited/deleted
- [ ] Notes and checklists work properly
- [ ] Search functionality works
- [ ] Service Worker registered (check DevTools → Application)
- [ ] PWA manifest loads correctly

## Continuous Deployment

Vercel automatically deploys when you push to the main branch.

### Preview Deployments

Every pull request gets a preview deployment at:
```
https://notebook-app-git-branch-name.vercel.app
```

### Production Deployment

Commits to the main branch are automatically deployed to:
```
https://your-app.vercel.app
```

## Monitoring & Debugging

### View Logs

```bash
# Watch real-time logs
vercel logs --follow

# Get specific build logs
vercel logs --since 1h
```

### Check Build Performance

1. In Vercel dashboard, go to "Analytics"
2. Monitor Web Vitals, page load time, etc.

### Enable Error Tracking

1. Go to Vercel project settings
2. Enable "Error Tracking"
3. Install Vercel Analytics (optional)

## Rollback

If something goes wrong:

1. Go to Vercel project dashboard
2. Click on "Deployments"
3. Find the previous stable deployment
4. Click the three dots → "Promote to Production"

Or rollback via CLI:

```bash
vercel rollback
```

## Database Migrations

If you need to update the database schema:

1. Create a new migration in `supabase/migrations/`
2. Test locally
3. Run migration in Supabase dashboard
4. Commit and push to GitHub
5. Vercel will automatically redeploy

## Performance Optimization

### Build Optimization

The Vite build is already optimized with:
- Tree shaking
- Code splitting
- Minification
- Asset optimization

Monitor at [vercel.com/analytics](https://vercel.com/analytics)

### Database Query Optimization

- Use indexes (already configured)
- Limit data fetching with pagination
- Use React Query caching
- Enable Supabase query profiling

## Security Checklist

- [ ] Environment variables not committed to git
- [ ] Only anon key exposed on frontend (not service role)
- [ ] RLS policies enforced in Supabase
- [ ] HTTPS enforced
- [ ] CORS properly configured
- [ ] CSP headers configured
- [ ] Rate limiting enabled (if needed)

## Troubleshooting

### Build Fails

1. Check Vercel logs: `vercel logs`
2. Ensure all dependencies are in package.json
3. Check for TypeScript errors: `npm run build`
4. Verify environment variables are set

### App Won't Load

1. Check browser console for errors
2. Check Network tab for failed requests
3. Verify Supabase credentials are correct
4. Check CORS settings in Supabase

### Authentication Not Working

1. Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
2. Check Supabase auth settings
3. Verify redirect URLs in Supabase
4. Clear browser cache and cookies

### Service Worker Issues

1. Check service worker registration in DevTools
2. Verify `/sw.js` file exists and loads
3. Check Cache Storage in DevTools
4. Try unregistering and re-registering

## Advanced Deployment

### Zero-Downtime Deployments

Vercel handles this automatically:
1. New version deployed in parallel
2. Traffic switches when ready
3. Old version kept for rollback

### Custom Build Script

To customize the build process, edit `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist"
}
```

### Environment-Specific Configs

Create separate environment variables for:
- Production
- Preview (staging)
- Development

## Monitoring After Deployment

### Set Up Alerts

1. Enable Vercel alerts for deployment failures
2. Set up Supabase alerts for database issues
3. Monitor error tracking

### Regular Checks

- Weekly: Review deployment logs
- Weekly: Check error tracking
- Monthly: Review performance metrics
- Monthly: Update dependencies

## Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vite Deploy Guide](https://vitejs.dev/guide/static-deploy.html)
- [Supabase Deployment](https://supabase.com/docs/guides/hosting/overview)
- [React Router Deployment](https://reactrouter.com/en/start/deployment)