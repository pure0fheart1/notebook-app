# Quick Supabase Setup (5-10 minutes)

## 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **"New Project"**
3. Fill in:
   - **Project Name**: `notebook-app`
   - **Password**: Create a strong password
   - **Region**: Choose closest to you
4. Click **"Create new project"** and wait ~2 minutes

## 2. Get Your API Keys

Once the project is created:

1. Click on **"Settings"** (gear icon bottom left)
2. Click **"API"**
3. Copy these two values:
   ```
   Project URL (VITE_SUPABASE_URL)
   Anon Key (VITE_SUPABASE_ANON_KEY)
   ```

## 3. Run Database Migrations

1. In Supabase, click **"SQL Editor"** (left sidebar)
2. Click **"New Query"**
3. Copy the entire content from: `supabase/migrations/001_initial_schema.sql`
4. Paste it into the SQL editor
5. Click **"Run"** button (or Ctrl+Enter)
6. Wait for it to complete ✅

## 4. Enable Realtime (Optional but Recommended)

1. Go to **"Database"** → **"Publications"** (left sidebar)
2. Click on **"supabase_realtime"**
3. Enable these tables:
   - ✅ notebooks
   - ✅ notes
   - ✅ checklist_items
4. Click **"Save"**

## 5. Configure Auth (Optional)

1. Go to **"Authentication"** → **"Providers"**
2. Email is already enabled by default
3. (Optional) Enable Google OAuth:
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create OAuth 2.0 credentials
   - Copy Client ID and Secret
   - Paste into Supabase

## 6. Save Your Credentials

Create `.env.local` file in your project root:

```bash
VITE_SUPABASE_URL=<your-project-url>
VITE_SUPABASE_ANON_KEY=<your-anon-key>
```

## 7. Test Locally

```bash
cd ~/Desktop/Projects/notebook-app
npm run dev
```

Visit `http://localhost:3000` and try signing up!

## Done! ✅

Your Supabase is ready. Now proceed to push to GitHub and deploy to Vercel.

---

## Troubleshooting

**"Relation does not exist" error**:
- Run the migration SQL again
- Make sure all migrations completed

**Login fails**:
- Check your credentials in `.env.local`
- Make sure Supabase project is active
- Clear browser cache

**Realtime not working**:
- Check that realtime is enabled in Publications
- Verify tables are selected
