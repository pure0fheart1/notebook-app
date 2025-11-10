# Deploy to Vercel in 10 Minutes

This guide will get your app live in minutes!

---

## ✅ Prerequisites Checklist

- [ ] Supabase project created and credentials ready
- [ ] `.env.local` file with Supabase credentials
- [ ] GitHub account (you have this ✅)
- [ ] Vercel account (you have this ✅)
- [ ] Project tested locally with `npm run dev`

---

## Step 1: Push to GitHub (3 minutes)

### Create GitHub Repository

1. Go to [github.com/new](https://github.com/new)
2. **Repository name**: `notebook-app`
3. **Description**: "A beautiful notebook and checklist app with Supabase"
4. **Visibility**: Public (for free tier)
5. Click **"Create repository"**

### Push Code to GitHub

```bash
cd ~/Desktop/Projects/notebook-app

# Add GitHub as remote
git remote add origin https://github.com/YOUR_USERNAME/notebook-app.git

# Rename branch to main (if needed)
git branch -M main

# Push code to GitHub
git push -u origin main
```

**Done!** Your code is now on GitHub ✅

---

## Step 2: Deploy to Vercel (7 minutes)

### Connect Vercel to GitHub

1. Go to [vercel.com](https://vercel.com)
2. Sign in to your Vercel account
3. Click **"Add New..."** → **"Project"**
4. Select **"Import an existing Git Repository"**
5. Find your `notebook-app` repository
6. Click **"Import"**

### Configure Project Settings

Vercel auto-detects React/Vite, but verify:

1. **Framework Preset**: Vite ✅
2. **Build Command**: `npm run build` ✅
3. **Output Directory**: `dist` ✅
4. **Install Command**: `npm install` ✅

### Set Environment Variables

This is **CRITICAL** for the app to work!

1. In Vercel project, go to **"Settings"** → **"Environment Variables"**
2. Add two variables:

   **Variable 1:**
   - **Name**: `VITE_SUPABASE_URL`
   - **Value**: (paste your Supabase project URL)
   - **Environments**: ✅ Production ✅ Preview ✅ Development

   **Variable 2:**
   - **Name**: `VITE_SUPABASE_ANON_KEY`
   - **Value**: (paste your Supabase anon key)
   - **Environments**: ✅ Production ✅ Preview ✅ Development

3. Click **"Save"**

### Deploy!

1. Click **"Deploy"** button
2. Wait for build to complete (~1 minute)
3. See **"Congratulations! Your site is live"** ✅

---

## Step 3: Configure Supabase Redirect URLs (2 minutes)

Your app needs to redirect back to Vercel after auth!

1. Go to your **Supabase project**
2. Click **"Authentication"** → **"URL Configuration"**
3. Under **"Authorized redirect URLs"**, add:
   ```
   https://your-app-name.vercel.app/
   https://your-app-name.vercel.app/dashboard
   ```
   (Replace `your-app-name` with your Vercel project name)
4. Click **"Save"**

---

## 🎉 Done! Your App is Live!

Visit: `https://your-app-name.vercel.app`

---

## Testing Your Live App

✅ Try these:

1. **Sign Up**: Create a new account
2. **Create Notebook**: Add a notebook from dashboard
3. **Create Note**: Add a note to notebook with rich text
4. **Create Checklist**: Try adding a checklist
5. **Search**: Use Cmd/Ctrl+K to search
6. **Refresh Page**: Verify realtime sync works

---

## Common Issues & Solutions

### ❌ Build Fails

**Error**: `Environment variable not found`

**Fix**: Make sure both environment variables are set in Vercel Settings

### ❌ "Cannot authenticate" error

**Cause**: Missing Supabase URL or wrong credentials

**Fix**:
1. Double-check credentials in Vercel Settings
2. Verify you copied them correctly from Supabase
3. Redeploy: Click **"Redeploy"** in Vercel

### ❌ Login form doesn't work

**Cause**: Supabase redirect URLs not configured

**Fix**:
1. Go to Supabase → Authentication → URL Configuration
2. Add your Vercel URL to authorized redirects
3. Try logging in again

### ❌ Notes don't save

**Cause**: RLS policies not enabled or database migrations not run

**Fix**:
1. Check Supabase that all migrations ran
2. Verify tables exist in database
3. Check browser console for errors

### ❌ Offline features don't work

**Cause**: Service worker may not be registered

**Fix**:
1. Open DevTools → Application → Service Workers
2. Should see `/sw.js` registered
3. Try page refresh
4. Clear cache if needed

---

## Next Steps

### Optional: Use Custom Domain

1. In Vercel project, go to **"Settings"** → **"Domains"**
2. Add your custom domain
3. Follow DNS instructions
4. Update Supabase redirect URLs

### Optional: Enable Analytics

1. In Vercel, click **"Analytics"**
2. View real-time metrics
3. Check Core Web Vitals

### Continuous Deployment

✅ **Already enabled!**

Every time you push to GitHub:
```bash
git add .
git commit -m "Your message"
git push origin main
```

Vercel automatically deploys! 🚀

---

## Sharing Your App

Your app is now live! Share the link:
```
https://your-app-name.vercel.app
```

---

## Monitoring & Debugging

### Check Vercel Logs

```bash
vercel logs
```

### Check Supabase Logs

1. Supabase Dashboard → **"Logs"** section
2. Check for database and auth errors

### Monitor Performance

1. Vercel Dashboard → **"Analytics"**
2. Check page load times and Web Vitals

---

## Troubleshooting Checklist

- [ ] GitHub repository created and code pushed
- [ ] Vercel project created and linked to GitHub
- [ ] Environment variables set in Vercel
- [ ] Build completed successfully
- [ ] App loads at your Vercel URL
- [ ] Can sign up/login
- [ ] Can create notebooks and notes
- [ ] Supabase redirect URLs configured
- [ ] Tested in production

---

## Advanced: Rollback

If something goes wrong:

1. Go to Vercel Dashboard → **"Deployments"**
2. Find previous working deployment
3. Click three dots (**...**) → **"Promote to Production"**

Or via CLI:
```bash
vercel rollback
```

---

## 🎊 Success!

Your notebook app is live on Vercel!

**Your app URL**: `https://your-app-name.vercel.app`

**Next**:
- Share with friends
- Create notebooks
- Invite others
- Add custom domain
- Monitor with analytics

**Questions?** Check the full docs in the project folder!