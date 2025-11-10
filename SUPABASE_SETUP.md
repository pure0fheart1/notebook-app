# Supabase Setup Guide

This guide will help you set up Supabase for the Notebook/Checklist app.

## Prerequisites

- A Supabase account (https://supabase.com)
- Node.js and npm installed

## Setup Steps

### 1. Create a Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click "New Project"
3. Fill in the project details:
   - Name: `notebook-checklist-app`
   - Database password: Create a strong password
   - Region: Choose your closest region
4. Wait for the project to be created

### 2. Get API Keys

1. In your Supabase project, go to **Settings** → **API**
2. Copy the following values:
   - Project URL (VITE_SUPABASE_URL)
   - Anon Key (VITE_SUPABASE_ANON_KEY)

### 3. Create .env.local File

Create a `.env.local` file in the project root:

```bash
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### 4. Set Up Database Schema

1. Go to the **SQL Editor** in your Supabase project
2. Click **New Query** or **New File**
3. Copy the contents of `supabase/migrations/001_initial_schema.sql`
4. Paste it into the SQL editor
5. Click **Run** to execute the migration

### 5. Enable Realtime (Optional)

1. Go to **Database** → **Publications** in your Supabase project
2. Enable `supabase_realtime` publication for the tables you want to sync in real-time
3. Select tables: `notebooks`, `notes`, `checklist_items`

### 6. Set Up Authentication

1. Go to **Authentication** → **Providers**
2. Enable **Email** provider (already enabled by default)
3. (Optional) Enable **Google OAuth**:
   - Go to Google Cloud Console
   - Create OAuth 2.0 credentials
   - Add your Supabase callback URL
   - Copy Client ID and Secret into Supabase

### 7. Set Up Email Templates (Optional)

1. Go to **Authentication** → **Email Templates**
2. Customize email templates for:
   - Confirmation email
   - Password reset email
   - Magic link email

## Testing the Connection

After setting up .env.local, run:

```bash
npm run dev
```

Try signing up or logging in to test the connection.

## Troubleshooting

### "Missing Supabase environment variables"

Make sure `.env.local` exists and contains:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### "Relation does not exist"

Run the migration SQL again to ensure all tables are created.

### CORS Issues

If you get CORS errors, add your domain to Supabase:
1. Go to **Settings** → **Auth**
2. Add your domain to "Authorized redirect URLs"

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Supabase Realtime](https://supabase.com/docs/guides/realtime)
- [Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security)