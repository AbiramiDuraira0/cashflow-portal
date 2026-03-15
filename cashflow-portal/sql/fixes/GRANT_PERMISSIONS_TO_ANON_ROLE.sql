-- ============================================
-- File: GRANT_PERMISSIONS_TO_ANON_ROLE.sql
-- Purpose: Grant SELECT permission to anon role for category table
-- Date: 2026-03-13
-- Error Code: 42501 - permission denied for table category
-- ============================================

-- PROBLEM: The 'anon' role (used by Supabase anon key) doesn't have
-- permission to read from the category table
-- Error: "permission denied for table category" (Code: 42501)

-- ============================================
-- SOLUTION: Grant SELECT permission to anon role
-- ============================================

-- Grant SELECT permission on category table to anon and authenticated roles
GRANT SELECT ON public.category TO anon, authenticated;

-- Also grant permission on all tables in public schema (optional, for future tables)
-- GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;

-- ============================================
-- DISABLE RLS (if still enabled)
-- ============================================

-- Check RLS status
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'category';

-- Disable RLS
ALTER TABLE public.category DISABLE ROW LEVEL SECURITY;

-- ============================================
-- VERIFICATION
-- ============================================

-- Check granted permissions
SELECT 
    grantee, 
    table_schema, 
    table_name, 
    privilege_type
FROM information_schema.role_table_grants
WHERE table_name = 'category'
  AND grantee IN ('anon', 'authenticated', 'postgres');

-- Test query as anon role (simulates what Angular app does)
SET ROLE anon;
SELECT * FROM public.category WHERE is_active = true LIMIT 5;
RESET ROLE;

-- Should return rows without errors!

-- ============================================
-- EXPECTED OUTPUT AFTER FIX
-- ============================================

-- In browser console, you should see:
-- ✅ Loaded categories: 12

-- Network tab should show:
-- Status: 200 OK (instead of 401 Unauthorized)

-- ============================================
-- NOTES
-- ============================================

-- PostgreSQL Permissions:
-- • Tables are owned by 'postgres' role by default
-- • 'anon' and 'authenticated' are Supabase special roles
-- • Must explicitly GRANT permissions for these roles
-- • Without GRANT, you get error code 42501

-- For new tables, always run:
-- GRANT SELECT ON public.your_table TO anon, authenticated;
