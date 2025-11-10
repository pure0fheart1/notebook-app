-- Fix PostgREST schema cache issue (PGRST205 error)
-- This SQL script reloads the schema cache and ensures tables are properly exposed to the API

-- IMPORTANT: Run this in Supabase Dashboard > SQL Editor

-- 1. Notify PostgREST to reload the schema cache
NOTIFY pgrst, 'reload schema';

-- 2. Verify all tables are in the public schema
SELECT
  schemaname,
  tablename,
  tableowner
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'notebooks', 'notes', 'checklist_items', 'tags', 'note_tags')
ORDER BY tablename;

-- 3. Verify RLS is enabled
SELECT
  schemaname,
  tablename,
  rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'notebooks', 'notes', 'checklist_items', 'tags', 'note_tags')
ORDER BY tablename;

-- 4. Check if authenticator role has proper access
-- Grant usage on public schema to authenticator and anon roles
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant SELECT, INSERT, UPDATE, DELETE on all tables to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;

-- Grant SELECT on all tables to anonymous users (for public access if needed)
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO anon;

-- 5. Verify sequences are accessible
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO authenticated;

-- 6. Final reload notification
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload config';

-- ============================================================
-- SUCCESS MESSAGE
-- ============================================================
SELECT 'PostgREST schema cache has been reloaded!' as status,
       'Tables should now be accessible via the API' as message;
