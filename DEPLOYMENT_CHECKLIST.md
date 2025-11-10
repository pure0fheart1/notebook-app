# 🚀 Complete Deployment Checklist - Notebook App

## Overview

This guide will help you deploy the Notebook/Checklist app to production and fix all critical database errors.

**Estimated Time:** 10-15 minutes

---

## ✅ Pre-Deployment Checklist

### 1. Environment Setup

- [ ] Supabase project created: `czfwuwqxdmelrglpecoh`
- [ ] Environment variables configured in `.env.local`:
  ```env
  VITE_SUPABASE_URL=https://czfwuwqxdmelrglpecoh.supabase.co
  VITE_SUPABASE_ANON_KEY=eyJhbGc...
  ```

### 2. Database Migration

- [ ] All tables created in Supabase
- [ ] RLS policies configured
- [ ] PostgREST cache refreshed

---

## 🔧 Step-by-Step Deployment

### STEP 1: Apply Database Schema (5 minutes)

**1.1 Open Supabase Dashboard**
- URL: https://supabase.com/dashboard/project/czfwuwqxdmelrglpecoh
- Navigate to: **SQL Editor** (left sidebar)

**1.2 Create Initial Schema**
- Click: **"New Query"**
- Copy contents from: `supabase/migrations/001_initial_schema.sql`
- Paste into SQL Editor
- Click: **"Run"** (or press Ctrl/Cmd + Enter)
- Verify: You should see "Success. No rows returned"

**1.3 Fix PostgREST Cache**
- Create a new query
- Copy contents from: `fix-postgrest-cache.sql`
- Click: **"Run"**
- Verify: You should see "PostgREST schema cache has been reloaded!"

**1.4 Create User Profile Trigger**
- Create a new query
- Copy contents from: `CREATE_USER_PROFILE_TRIGGER.sql`
- Click: **"Run"**
- Verify: You should see "User profile auto-creation trigger installed!"

---

### STEP 2: Verify Database Setup (2 minutes)

**2.1 Check Tables**
- In Supabase Dashboard, go to: **Table Editor**
- Verify these tables exist:
  - ✅ profiles
  - ✅ notebooks
  - ✅ notes
  - ✅ checklist_items
  - ✅ tags
  - ✅ note_tags

**2.2 Check RLS Policies**
- Click on any table (e.g., "notebooks")
- Click the **"RLS"** tab
- Verify policies exist:
  - "Users can view their own notebooks"
  - "Users can insert notebooks"
  - "Users can update their own notebooks"
  - "Users can delete their own notebooks"

**2.3 Run Verification Script**
```bash
cd C:\Users\jamie\Desktop\Projects\notebook-app
node check-and-fix-database.js
```

Expected output:
```
✅ Table 'profiles' exists (0 rows)
✅ Table 'notebooks' exists (0 rows)
✅ Table 'notes' exists (0 rows)
✅ Successfully queried notebooks
```

---

### STEP 3: Test the Application (3 minutes)

**3.1 Start Development Server**
```bash
npm run dev
```

**3.2 Create Test Account**
- Open: http://localhost:5173
- Click: "Sign Up"
- Create account with test email
- Verify: No errors in console

**3.3 Test Core Features**

**Create Notebook:**
- Click: "New Notebook"
- Enter title: "Test Notebook"
- Choose color and icon
- Click: "Create"
- ✅ Verify: Notebook appears without error message
- ✅ Verify: No "An unexpected error occurred" message

**Create Note:**
- Click on the test notebook
- Click: "Note" button
- Enter title: "Test Note"
- Type some content
- Click: "Save"
- ✅ Verify: Note is saved successfully

**Create Checklist:**
- Click: "Checklist" button
- Enter title: "Test Checklist"
- Add checklist items
- Click: "Save"
- ✅ Verify: Checklist is saved successfully

**Test CRUD Operations:**
- ✅ View notebooks list
- ✅ Edit notebook title
- ✅ Delete a notebook
- ✅ Pin/unpin notes
- ✅ Edit note content
- ✅ Delete notes

---

### STEP 4: Check Browser Console (1 minute)

**Open Browser DevTools:**
- Press F12 or right-click → "Inspect"
- Go to: **Console** tab

**Verify No Errors:**
- ❌ Should NOT see: `404 errors on /rest/v1/notebooks`
- ❌ Should NOT see: `404 errors on /rest/v1/notes`
- ❌ Should NOT see: `PGRST205` errors
- ❌ Should NOT see: `Could not find the table in the schema cache`
- ✅ Should see: Normal React logs only

**Check Network Tab:**
- Go to: **Network** tab
- Filter: "Fetch/XHR"
- Perform actions (create notebook, etc.)
- ✅ All API calls should return 200 or 201
- ❌ No 404 errors

---

### STEP 5: Production Deployment (Optional)

**5.1 Build for Production**
```bash
npm run build
```

**5.2 Deploy to Vercel/Netlify**
```bash
# Vercel
vercel --prod

# Or Netlify
netlify deploy --prod
```

**5.3 Configure Environment Variables**
- Add the same `.env.local` variables to your hosting platform
- Restart the deployment

---

## 🐛 Troubleshooting

### Issue: "An unexpected error occurred" when creating notebooks

**Solution:**
1. Check if PostgREST cache is loaded:
   - Run: `fix-postgrest-cache.sql` in Supabase Dashboard
   - Wait 30 seconds
   - Try again

2. Verify authentication:
   - Check if you're logged in
   - Check browser console for auth errors
   - Try logging out and back in

### Issue: 404 errors on API endpoints

**Solution:**
1. Verify tables are in `public` schema:
   ```sql
   SELECT schemaname, tablename
   FROM pg_tables
   WHERE tablename IN ('notebooks', 'notes', 'profiles');
   ```
   All should show `schemaname = 'public'`

2. Run the PostgREST cache fix again
3. Check API settings in Supabase Dashboard

### Issue: WebSocket connection failures

**Solution:**
1. Check if Realtime is enabled in Supabase Dashboard
2. Verify network allows WebSocket connections
3. Check firewall/proxy settings

### Issue: Profile not created on signup

**Solution:**
1. Verify trigger exists:
   ```sql
   SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
   ```
2. Re-run: `CREATE_USER_PROFILE_TRIGGER.sql`
3. Test signup with new email

### Issue: RLS policy errors

**Solution:**
1. Check if user is authenticated:
   ```javascript
   const { data: { session } } = await supabase.auth.getSession()
   console.log(session)
   ```
2. Verify RLS policies reference correct columns
3. Check if policies use `auth.uid()` correctly

---

## 📊 Verification Commands

**Check Database Status:**
```bash
node check-and-fix-database.js
```

**Check Environment Variables:**
```bash
# Linux/Mac
cat .env.local

# Windows
type .env.local
```

**Check Running Services:**
- Supabase Dashboard → Settings → API
- Verify:
  - ✅ PostgREST: Running
  - ✅ Realtime: Running
  - ✅ Auth: Running

---

## 🎯 Success Criteria

After completing all steps, you should have:

1. ✅ All database tables created and accessible
2. ✅ RLS policies properly configured
3. ✅ PostgREST cache loaded with all tables
4. ✅ No 404 errors in browser console
5. ✅ No "unexpected error" messages
6. ✅ Notebooks can be created successfully
7. ✅ Notes and checklists work correctly
8. ✅ All CRUD operations function properly
9. ✅ WebSocket connections established
10. ✅ User profiles auto-created on signup

---

## 📁 Important Files

| File | Purpose |
|------|---------|
| `supabase/migrations/001_initial_schema.sql` | Initial database schema |
| `fix-postgrest-cache.sql` | Fixes API visibility issues |
| `CREATE_USER_PROFILE_TRIGGER.sql` | Auto-creates user profiles |
| `check-and-fix-database.js` | Diagnostic script |
| `QUICK_FIX_GUIDE.md` | Emergency fix reference |

---

## 🆘 Getting Help

If issues persist:

1. **Check Logs:**
   - Supabase Dashboard → Logs → API
   - Supabase Dashboard → Logs → Postgres
   - Browser Console → Network tab

2. **Run Diagnostics:**
   ```bash
   node check-and-fix-database.js
   ```

3. **Check Common Issues:**
   - Are you logged in?
   - Is `.env.local` configured?
   - Did PostgREST cache reload?
   - Are tables in `public` schema?

4. **Restart Services:**
   - Restart your dev server: `npm run dev`
   - Pause/Resume Supabase project (Dashboard → Settings)

---

## ✨ Next Steps

After successful deployment:

1. Set up automatic backups in Supabase
2. Configure email templates for auth
3. Add monitoring/error tracking (Sentry, etc.)
4. Set up CI/CD pipeline
5. Configure custom domain
6. Add user analytics

---

**Last Updated:** 2025-11-10
**Status:** Ready for Production ✅
