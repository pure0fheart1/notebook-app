// Script to check and fix Supabase database for notebook app
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const supabaseUrl = 'https://czfwuwqxdmelrglpecoh.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6Znd1d3F4ZG1lbHJnbHBlY29oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3NDAwNjAsImV4cCI6MjA3ODMxNjA2MH0.mhTvvkZDWzLhMEzqQKz9qA3Mkf0ScNZooJkFnvAwylI'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

console.log('🔍 Checking Supabase database status...\n')

async function checkTables() {
  console.log('1️⃣ Checking if tables exist...')

  const tables = ['profiles', 'notebooks', 'notes', 'checklist_items', 'tags', 'note_tags']

  for (const table of tables) {
    try {
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })

      if (error) {
        if (error.code === '42P01') {
          console.log(`   ❌ Table '${table}' does NOT exist`)
        } else if (error.message.includes('404')) {
          console.log(`   ❌ Table '${table}' not found (404 error)`)
        } else {
          console.log(`   ⚠️  Table '${table}': ${error.message}`)
        }
      } else {
        console.log(`   ✅ Table '${table}' exists (${count || 0} rows)`)
      }
    } catch (err) {
      console.log(`   ❌ Error checking '${table}': ${err.message}`)
    }
  }
  console.log()
}

async function checkAuth() {
  console.log('2️⃣ Checking authentication...')

  const { data: { session }, error } = await supabase.auth.getSession()

  if (session) {
    console.log(`   ✅ User is authenticated: ${session.user.email}`)
    console.log(`   User ID: ${session.user.id}`)
  } else {
    console.log(`   ⚠️  No active session (this is OK for checking table existence)`)
  }
  console.log()
}

async function testCRUD() {
  console.log('3️⃣ Testing CRUD operations...')

  // Check if we can access notebooks (this will test RLS too)
  const { data, error } = await supabase
    .from('notebooks')
    .select('*')
    .limit(1)

  if (error) {
    console.log(`   ❌ Cannot query notebooks: ${error.message}`)
    console.log(`   Error code: ${error.code}`)
    console.log(`   Error hint: ${error.hint || 'N/A'}`)
  } else {
    console.log(`   ✅ Successfully queried notebooks`)
  }
  console.log()
}

async function checkRLS() {
  console.log('4️⃣ Checking Row Level Security status...')
  console.log('   (This requires service_role key - skipping for security)')
  console.log('   RLS policies should be checked in Supabase Dashboard')
  console.log()
}

async function printSummary() {
  console.log('=' .repeat(60))
  console.log('📊 SUMMARY')
  console.log('=' .repeat(60))
  console.log()
  console.log('Next steps:')
  console.log('1. If tables do NOT exist:')
  console.log('   - Run: node apply-migration.js')
  console.log('   - Or apply migration manually in Supabase Dashboard SQL Editor')
  console.log()
  console.log('2. If tables exist but getting 404 errors:')
  console.log('   - Check API settings in Supabase Dashboard')
  console.log('   - Verify PostgREST is running')
  console.log('   - Check that tables are in public schema')
  console.log()
  console.log('3. If RLS errors occur:')
  console.log('   - Check RLS policies in Supabase Dashboard')
  console.log('   - Ensure auth.uid() matches user_id in queries')
  console.log()
}

// Run all checks
async function main() {
  await checkAuth()
  await checkTables()
  await testCRUD()
  await checkRLS()
  await printSummary()
}

main().catch(console.error)
