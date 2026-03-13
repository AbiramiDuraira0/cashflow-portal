-- ============================================
-- File: GRANT_FULL_CRUD_PERMISSIONS.sql
-- Purpose: Grant INSERT, UPDATE, DELETE permissions for CRUD operations
-- Date: 2026-03-13
-- ============================================

-- CURRENT STATUS: SELECT permission granted (Read works ✅)
-- NEEDED: INSERT, UPDATE, DELETE permissions for full CRUD

-- ============================================
-- GRANT ALL CRUD PERMISSIONS
-- ============================================

-- Grant full CRUD permissions to anon and authenticated roles
GRANT SELECT, INSERT, UPDATE, DELETE ON public.category TO anon, authenticated;

-- Grant USAGE on sequence (needed for auto-incrementing category_id)
GRANT USAGE, SELECT ON SEQUENCE public.category_category_id_seq TO anon, authenticated;

-- ============================================
-- VERIFICATION
-- ============================================

-- Check granted permissions
SELECT 
    grantee, 
    table_schema, 
    table_name, 
    string_agg(privilege_type, ', ') as permissions
FROM information_schema.role_table_grants
WHERE table_name = 'category'
  AND grantee IN ('anon', 'authenticated')
GROUP BY grantee, table_schema, table_name;

-- Expected output:
-- grantee | table_schema | table_name | permissions
-- anon    | public       | category   | SELECT, INSERT, UPDATE, DELETE

-- ============================================
-- TEST CRUD OPERATIONS
-- ============================================

-- Test as anon role (simulates Angular app)
SET ROLE anon;

-- Test SELECT (already working)
SELECT * FROM public.category WHERE is_active = true LIMIT 3;

-- Test INSERT
INSERT INTO public.category (category_name, is_active)
VALUES ('Test Category', true)
RETURNING *;

-- Test UPDATE
UPDATE public.category 
SET category_name = 'Updated Test Category'
WHERE category_name = 'Test Category'
RETURNING *;

-- Test DELETE (soft delete via is_active)
UPDATE public.category 
SET is_active = false
WHERE category_name = 'Updated Test Category'
RETURNING *;

-- Reset role
RESET ROLE;

-- Cleanup test data
DELETE FROM public.category WHERE category_name LIKE '%Test%';

-- ============================================
-- RLS STATUS
-- ============================================

-- Verify RLS is disabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'category';

-- If RLS is enabled, disable it:
-- ALTER TABLE public.category DISABLE ROW LEVEL SECURITY;

-- ============================================
-- NOTES
-- ============================================

-- Permissions needed for CRUD:
-- • SELECT - Read categories (GET) ✅
-- • INSERT - Add new categories (POST)
-- • UPDATE - Edit categories, soft delete (PUT/PATCH)
-- • DELETE - Hard delete (not used, we soft delete)
-- • USAGE on sequence - Auto-generate category_id

-- After running this script:
-- • Angular app can add new categories ✅
-- • Angular app can edit category names ✅
-- • Angular app can soft delete categories ✅
