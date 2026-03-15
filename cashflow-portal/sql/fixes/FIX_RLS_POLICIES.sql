-- ============================================
-- File: FIX_RLS_POLICIES.sql
-- Purpose: Fix Row Level Security to allow reads
-- Date: 2026-03-13
-- ============================================

-- PROBLEM: Supabase enables Row Level Security (RLS) by default
-- This blocks ALL queries unless you create policies
-- Angular app gets empty results even though data exists

-- ============================================
-- SOLUTION 1: Disable RLS (Quick Fix for Testing)
-- ============================================

-- Check current RLS status
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'category';

-- Disable RLS temporarily (TESTING ONLY)
ALTER TABLE public.category DISABLE ROW LEVEL SECURITY;

-- If your table is in dbo schema:
-- ALTER TABLE dbo.category DISABLE ROW LEVEL SECURITY;

-- ============================================
-- SOLUTION 2: Create Public Read Policy (Recommended)
-- ============================================

-- Enable RLS (if disabled)
ALTER TABLE public.category ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read categories (even unauthenticated users)
CREATE POLICY "Allow public read access to categories"
ON public.category
FOR SELECT
USING (true);

-- If your table is in dbo schema:
-- CREATE POLICY "Allow public read access to categories"
-- ON dbo.category
-- FOR SELECT
-- USING (true);

-- ============================================
-- SOLUTION 3: Authenticated Users Only
-- ============================================

-- If you have authentication, restrict to logged-in users
-- CREATE POLICY "Allow authenticated read access"
-- ON public.category
-- FOR SELECT
-- USING (auth.role() = 'authenticated');

-- ============================================
-- VERIFICATION
-- ============================================

-- Check all policies on category table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'category';

-- Test query (should work after applying policy)
SELECT * FROM public.category WHERE is_active = true;

-- ============================================
-- NOTES
-- ============================================

-- RLS Status:
-- • ENABLED + NO POLICIES = All queries return empty/blocked
-- • DISABLED = All queries work (no security)
-- • ENABLED + POLICIES = Queries work based on policy rules

-- For development: Disable RLS
-- For production: Enable RLS + Create proper policies

-- ============================================
-- CLEANUP (if needed)
-- ============================================

-- Drop existing policies
-- DROP POLICY IF EXISTS "Allow public read access to categories" ON public.category;

-- Re-enable RLS
-- ALTER TABLE public.category ENABLE ROW LEVEL SECURITY;
