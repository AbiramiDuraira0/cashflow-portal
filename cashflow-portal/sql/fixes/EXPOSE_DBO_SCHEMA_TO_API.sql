-- ============================================
-- File: EXPOSE_DBO_SCHEMA_TO_API.sql
-- Purpose: Configure Supabase to expose dbo schema via REST API
-- Date: 2026-03-13
-- ============================================

-- PROBLEM: Supabase REST API only exposes "public" schema by default
-- Your table is in "dbo" schema → not accessible via REST API

-- ============================================
-- SOLUTION: Add dbo to PostgREST exposed schemas
-- ============================================

-- Step 1: Check current exposed schemas
SHOW pgrst.db_schemas;

-- Step 2: Add dbo schema to PostgREST config
-- NOTE: This requires database configuration access
-- You may need to contact Supabase support or use Dashboard settings

-- Alternative: Use SQL function wrapper in public schema
CREATE OR REPLACE FUNCTION public.get_categories()
RETURNS TABLE (
  category_id INTEGER,
  category_name VARCHAR(50),
  is_active BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) 
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT category_id, category_name, is_active, created_at, updated_at
  FROM dbo.category
  WHERE is_active = true
  ORDER BY category_name;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_categories() TO anon, authenticated;

-- ============================================
-- USAGE IN ANGULAR
-- ============================================

-- Instead of querying table directly:
-- .from('category').select('*')

-- Call the function using RPC:
-- .rpc('get_categories')

-- ============================================
-- RECOMMENDATION
-- ============================================

-- ⚠️ For Supabase projects, ALWAYS use "public" schema
-- It's simpler and works out-of-the-box with REST API
-- Run MOVE_CATEGORY_TO_PUBLIC_SCHEMA.sql instead
