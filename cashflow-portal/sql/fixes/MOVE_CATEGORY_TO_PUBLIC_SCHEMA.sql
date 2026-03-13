-- ============================================
-- File: MOVE_CATEGORY_TO_PUBLIC_SCHEMA.sql
-- Purpose: Move category table from dbo to public schema
-- Date: 2026-03-13
-- ============================================

-- PROBLEM: Supabase REST API only exposes tables in "public" schema
-- Your category table is in "dbo" schema → 404 error
-- URL tried: /rest/v1/category (looks in public.category)
-- Actual location: dbo.category

-- ============================================
-- SOLUTION: Move table to public schema
-- ============================================

-- Step 1: Check if table exists in dbo schema
SELECT schemaname, tablename 
FROM pg_tables 
WHERE tablename = 'category';

-- Step 2: If table is in dbo schema, move it to public
ALTER TABLE dbo.category SET SCHEMA public;

-- Step 3: Verify the move
SELECT schemaname, tablename 
FROM pg_tables 
WHERE tablename = 'category';
-- Should show: schemaname = 'public'

-- Step 4: Disable RLS to allow reads
ALTER TABLE public.category DISABLE ROW LEVEL SECURITY;

-- OR create a policy for public read access:
-- ALTER TABLE public.category ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow public read access" 
-- ON public.category 
-- FOR SELECT 
-- USING (true);

-- Step 5: Test query
SELECT * FROM public.category WHERE is_active = true ORDER BY category_name;

-- ============================================
-- VERIFICATION
-- ============================================

-- Check table location
\dt public.category

-- Check RLS status
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'category';

-- Test via REST API (should work now)
-- GET https://bbaxjrihnfnpqmlttioh.supabase.co/rest/v1/category?select=*
